"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  X,
  Mail,
  Phone,
  Building2,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OrgChartNode } from "./org-chart-node";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Employee, Company, OrgChartLayout } from "@/types";
import {
  getEmployees,
  getCompanies,
  getDirectReports,
  getCompanyById,
  getEmployeesByCompany,
} from "@/lib/data";
import Link from "next/link";

const nodeTypes = {
  orgNode: OrgChartNode,
};

interface OrgChartProps {
  initialCompany?: string;
}

export function OrgChart({ initialCompany }: OrgChartProps) {
  const [selectedCompany, setSelectedCompany] = useState(
    initialCompany || "all"
  );
  const [layout, setLayout] = useState<OrgChartLayout>("vertical");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const employees = getEmployees();
  const companies = getCompanies();

  // Filter employees by company
  const filteredEmployees = useMemo(() => {
    if (selectedCompany === "all") {
      return employees;
    }
    return getEmployeesByCompany(selectedCompany);
  }, [selectedCompany, employees]);

  // Build hierarchy tree
  const buildHierarchy = useCallback(
    (
      emps: Employee[]
    ): { nodes: Node[]; edges: Edge[] } => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];
      const nodeSpacingX = layout === "horizontal" ? 300 : 220;
      const nodeSpacingY = layout === "horizontal" ? 120 : 150;

      // Find root employees (those without reportsTo or whose manager is not in the list)
      const empIds = new Set(emps.map((e) => e.id));
      const roots = emps.filter(
        (e) => !e.reportsTo || !empIds.has(e.reportsTo)
      );

      // Position nodes using BFS
      const positioned = new Map<string, { x: number; y: number; level: number }>();
      const queue: { emp: Employee; level: number; parentX: number }[] = [];

      // Initialize with roots
      let rootX = 0;
      roots.forEach((root) => {
        queue.push({ emp: root, level: 0, parentX: rootX });
        rootX += nodeSpacingX * 2;
      });

      // Process queue
      const levelCounts: Map<number, number> = new Map();
      
      while (queue.length > 0) {
        const item = queue.shift()!;
        const { emp, level } = item;

        if (positioned.has(emp.id)) continue;

        // Count nodes at this level
        const countAtLevel = levelCounts.get(level) || 0;
        levelCounts.set(level, countAtLevel + 1);

        const x = layout === "horizontal" ? level * nodeSpacingX : countAtLevel * nodeSpacingX;
        const y = layout === "horizontal" ? countAtLevel * nodeSpacingY : level * nodeSpacingY;

        positioned.set(emp.id, { x, y, level });

        // Add children to queue
        const children = emps.filter((e) => e.reportsTo === emp.id);
        children.forEach((child) => {
          queue.push({ emp: child, level: level + 1, parentX: x });
        });
      }

      // Create nodes and edges
      positioned.forEach((pos, empId) => {
        const emp = emps.find((e) => e.id === empId)!;
        const company = getCompanyById(emp.company)!;
        const hasChildren = emps.some((e) => e.reportsTo === empId);

        nodes.push({
          id: emp.id,
          type: "orgNode",
          position: { x: pos.x, y: pos.y },
          data: {
            employee: emp,
            company,
            hasChildren,
            onSelect: () => setSelectedEmployee(emp),
          },
        });

        // Create edge to parent
        if (emp.reportsTo && positioned.has(emp.reportsTo)) {
          edges.push({
            id: `${emp.reportsTo}-${emp.id}`,
            source: emp.reportsTo,
            target: emp.id,
            type: "smoothstep",
            style: { stroke: "#8B8B9E", strokeWidth: 2 },
            animated: false,
          });
        }
      });

      return { nodes, edges };
    },
    [layout]
  );

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildHierarchy(filteredEmployees),
    [filteredEmployees, buildHierarchy]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when data changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildHierarchy(filteredEmployees);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [filteredEmployees, buildHierarchy, setNodes, setEdges]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="h-[calc(100vh-8rem)] w-full rounded-xl border border-border overflow-hidden bg-card relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--muted-foreground)"
          style={{ opacity: 0.3 }}
        />

        <Controls
          showInteractive={false}
          className="!bg-card !border-border !shadow-lg"
        />

        <MiniMap
          nodeColor={(node) => {
            const data = node.data as { company: Company };
            return data?.company?.color || "#7C3AED";
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
          className="!bg-card !border-border"
        />

        {/* Company Tabs */}
        <Panel position="top-left" className="!m-4">
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
            <Tabs value={selectedCompany} onValueChange={setSelectedCompany}>
              <TabsList className="bg-muted/50 flex-wrap h-auto">
                <TabsTrigger value="all" className="text-xs">
                  Todas
                </TabsTrigger>
                {companies.map((company) => (
                  <TabsTrigger
                    key={company.id}
                    value={company.id}
                    className="text-xs gap-1.5"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: company.color }}
                    />
                    {company.shortName || company.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </Panel>

        {/* Layout Toggle */}
        <Panel position="top-right" className="!m-4">
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg flex gap-2">
            <Button
              variant={layout === "vertical" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setLayout("vertical")}
              className="text-xs"
            >
              Vertical
            </Button>
            <Button
              variant={layout === "horizontal" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setLayout("horizontal")}
              className="text-xs"
            >
              Horizontal
            </Button>
          </div>
        </Panel>
      </ReactFlow>

      {/* Employee Detail Panel */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute top-0 right-0 h-full w-80 bg-card border-l border-border shadow-xl z-10"
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">
                  Detalles del Empleado
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedEmployee(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {(() => {
                const company = getCompanyById(selectedEmployee.company);
                const directReports = getDirectReports(selectedEmployee.id);

                return (
                  <div className="space-y-6">
                    {/* Avatar and name */}
                    <div className="text-center">
                      <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-border">
                        <AvatarFallback
                          className="text-2xl font-semibold"
                          style={{
                            backgroundColor: `${company?.color}20`,
                            color: company?.color,
                          }}
                        >
                          {getInitials(selectedEmployee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="font-semibold text-lg text-foreground">
                        {selectedEmployee.name}
                      </h4>
                      <p className="text-muted-foreground">
                        {selectedEmployee.position}
                      </p>
                    </div>

                    {/* Company badge */}
                    {company && (
                      <div className="flex justify-center">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: `${company.color}15`,
                            color: company.color,
                          }}
                        >
                          {company.shortName || company.name}
                        </span>
                      </div>
                    )}

                    {/* Contact info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm text-foreground truncate">
                            {selectedEmployee.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Teléfono
                          </p>
                          <p className="text-sm text-foreground">
                            {selectedEmployee.phone} ext. {selectedEmployee.extension}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Departamento
                          </p>
                          <p className="text-sm text-foreground">
                            {selectedEmployee.department}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Direct reports */}
                    {directReports.length > 0 && (
                      <div>
                        <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Reportes directos ({directReports.length})
                        </h5>
                        <div className="space-y-2">
                          {directReports.map((report) => (
                            <button
                              key={report.id}
                              onClick={() => setSelectedEmployee(report)}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(report.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm text-foreground truncate">
                                  {report.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {report.position}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View full profile */}
                    <Link href={`/directorio/${selectedEmployee.id}`}>
                      <Button className="w-full">Ver perfil completo</Button>
                    </Link>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
