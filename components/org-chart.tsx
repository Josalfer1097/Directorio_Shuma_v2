"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
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
import { cn } from "@/lib/utils";
import {
  getEmployees,
  getCompanies,
} from "@/lib/data";
import Link from "next/link";

import dagre from 'dagre'

const nodeTypes = {
  orgNode: OrgChartNode,
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ 
    rankdir: direction,
    nodesep: 80,
    ranksep: 120,
    marginx: 40,
    marginy: 40
  })

  nodes.forEach(node => g.setNode(node.id, { width: 220, height: 80 }))
  edges.forEach(edge => g.setEdge(edge.source, edge.target))
  dagre.layout(g)

  return {
    nodes: nodes.map(node => {
      const pos = g.node(node.id)
      return { ...node, position: { x: pos.x - 110, y: pos.y - 40 } }
    }),
    edges
  }
}

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
  const companies = getCompanies().filter(c => !c.disabled);

  // Filter employees by company
  const filteredEmployees = useMemo(() => {
    const activeEmps = employees.filter(emp => {
      const company = companies.find(c => c.id === emp.company);
      return company && !company.disabled;
    });

    if (selectedCompany === "all") {
      return activeEmps;
    }
    return activeEmps.filter(emp => emp.company === selectedCompany);
  }, [selectedCompany, employees, companies]);

  // Create nodes and edges
  const hierarchyData = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Find root employees (those without reportsTo or whose manager is not in the list)
    const empIds = new Set(filteredEmployees.map((e) => e.id));
    
    filteredEmployees.forEach((emp) => {
      const company = companies.find(c => c.id === emp.company)!;
      nodes.push({
        id: emp.id,
        type: "orgNode",
        position: { x: 0, y: 0 },
        data: {
          employee: emp,
          company,
          onSelect: () => setSelectedEmployee(emp),
        },
      });

      if (emp.reportsTo && empIds.has(emp.reportsTo)) {
        const parentEmp = filteredEmployees.find(e => e.id === emp.reportsTo);
        const parentCompany = companies.find(c => c.id === parentEmp?.company);
        const edgeColor = parentCompany?.colors?.primary || "#1E1E30";
        
        edges.push({
          id: `${emp.reportsTo}-${emp.id}`,
          source: emp.reportsTo,
          target: emp.id,
          type: "smoothstep",
          animated: true,
          style: { 
            stroke: edgeColor, 
            strokeWidth: 2, 
            opacity: 0.55,
            strokeDasharray: '5,5'
          },
        });
      }
    });

    return getLayoutedElements(nodes, edges, layout === 'horizontal' ? 'LR' : 'TB');
  }, [filteredEmployees, companies, layout]);

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[500px] w-full rounded-xl border border-border-subtle overflow-hidden bg-[--bg-base] relative">
      <ReactFlow
        nodes={hierarchyData.nodes}
        edges={hierarchyData.edges}
        onNodesChange={undefined}
        onEdgesChange={undefined}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        panOnScroll
        selectionOnDrag={false}
        zoomOnPinch
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#1E1E30"
          style={{ opacity: 0.8 }}
        />

        <Controls
          showInteractive={false}
          className="!bg-[--bg-surface]/80 !backdrop-blur-md !border-border-subtle !shadow-xl"
        />

        <MiniMap
          nodeColor={(node) => {
            const data = node.data as { company: Company };
            return data?.company?.colors?.primary || "var(--irid-a)";
          }}
          maskColor="rgba(8, 8, 16, 0.8)"
          className="!bg-[--bg-surface]/80 !backdrop-blur-md !border-border-subtle !rounded-lg"
        />

        {/* Mobile hint */}
        <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-[--bg-surface]/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border-subtle text-[10px] text-[--text-muted] pointer-events-none">
          Pellizca para hacer zoom
        </div>

        {/* Layout Toggle */}
        <Panel position="top-right" className="!m-4">
          <div className="bg-[--bg-surface]/80 backdrop-blur-md border border-border-subtle rounded-lg p-1.5 shadow-lg flex gap-1">
            <button
              onClick={() => setLayout("vertical")}
              className={cn(
                "px-3 py-1 rounded-md font-neuropol text-[10px] uppercase transition-colors",
                layout === "vertical" ? "bg-[--bg-elevated] text-text-primary" : "text-text-faint hover:text-text-muted"
              )}
              style={{ fontFamily: "'Neuropol', sans-serif" }}
            >
              Vertical
            </button>
            <button
              onClick={() => setLayout("horizontal")}
              className={cn(
                "px-3 py-1 rounded-md font-neuropol text-[10px] uppercase transition-colors",
                layout === "horizontal" ? "bg-[--bg-elevated] text-text-primary" : "text-text-faint hover:text-text-muted"
              )}
              style={{ fontFamily: "'Neuropol', sans-serif" }}
            >
              Horizontal
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
