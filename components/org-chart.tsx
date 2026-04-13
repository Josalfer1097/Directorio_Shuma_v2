"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { OrgChartNode } from "./org-chart-node";
import type { Company, OrgChartLayout } from "@/types";
import { cn } from "@/lib/utils";
import { getEmployees, getCompanies } from "@/lib/data";

import dagre from 'dagre';

const nodeTypes = {
  orgNode: OrgChartNode,
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB', isMobile = false) => {
  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ 
    rankdir: direction,
    nodesep: direction === 'TB' ? 60 : 40,
    ranksep: direction === 'TB' ? 100 : 80,
    marginx: 20,
    marginy: 20
  });

  // Node dimensions based on screen size
  const nodeWidth = isMobile ? 170 : 220;
  const nodeHeight = isMobile ? 70 : 80;

  nodes.forEach(node => g.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach(edge => g.setEdge(edge.source, edge.target));
  
  try {
    dagre.layout(g);
  } catch (e) {
    console.warn('[v0] dagre layout failed:', e);
    // Return nodes with basic positioning if layout fails
    return {
      nodes: nodes.map((node, i) => ({
        ...node,
        position: { x: (i % 4) * 250, y: Math.floor(i / 4) * 120 }
      })),
      edges
    };
  }

  return {
    nodes: nodes.map(node => {
      const pos = g.node(node.id);
      if (!pos) {
        return { ...node, position: { x: 0, y: 0 } };
      }
      return { ...node, position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 } };
    }),
    edges
  };
};

// Company filter config
const companyFilters = [
  { id: "all", label: "Todos", shortLabel: "Todos", color: "#C9A84C" },
  { id: "comercializadora", label: "Com. Shuma", shortLabel: "C.S", color: "#0047AB" },
  { id: "acabados", label: "Acabados", shortLabel: "Acab", color: "#C0152A" },
  { id: "ferrecapital", label: "Ferrecapital", shortLabel: "Ferre", color: "#2C3338" },
];

interface OrgChartInnerProps {
  selectedCompany: string;
  layout: OrgChartLayout;
}

function OrgChartInner({ selectedCompany, layout }: OrgChartInnerProps) {
  const reactFlowInstance = useReactFlow();
  const employees = getEmployees();
  const companies = getCompanies().filter(c => !c.disabled);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on client side only
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Create nodes and edges with validation
  const hierarchyData = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create a Set of valid employee IDs in the current filtered set
    const empIds = new Set(filteredEmployees.map((e) => e.id));
    
    filteredEmployees.forEach((emp) => {
      const company = companies.find(c => c.id === emp.company);
      // Skip if company not found (defensive)
      if (!company) return;

      nodes.push({
        id: emp.id,
        type: "orgNode",
        position: { x: 0, y: 0 },
        data: {
          employee: emp,
          company,
          label: emp.name ?? 'Sin nombre',
          position: emp.position ?? '',
        },
      });

      // Only create edge if BOTH source and target exist in the current filtered set
      // This prevents cross-company edges when filtering by a single company
      if (emp.reportsTo && empIds.has(emp.reportsTo) && empIds.has(emp.id)) {
        edges.push({
          id: `edge-${emp.id}-${emp.reportsTo}`,
          source: emp.reportsTo,
          target: emp.id,
          type: "smoothstep",
          animated: false,
          style: { 
            stroke: 'rgba(255,255,255,0.14)', 
            strokeWidth: 1.5,
          },
        });
      }
    });

    return getLayoutedElements(nodes, edges, layout === 'horizontal' ? 'LR' : 'TB', isMobile);
  }, [filteredEmployees, companies, layout, isMobile]);

  // Fit view on layout/filter changes with defensive try-catch
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        reactFlowInstance.fitView({ padding: 0.15, duration: 400 });
      } catch (e) {
        console.warn('[v0] fitView failed:', e);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedCompany, layout, reactFlowInstance, hierarchyData.nodes]);

  return (
    <ReactFlow
      nodes={hierarchyData.nodes}
      edges={hierarchyData.edges}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      fitView
      fitViewOptions={{ padding: 0.12 }}
      minZoom={0.1}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      panOnDrag={true}
      panOnScroll={!isMobile}
      zoomOnScroll={!isMobile}
      zoomOnPinch={true}
      selectionOnDrag={false}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="#1E1E30"
        style={{ opacity: 0.8 }}
      />

      {/* Controls - hidden on mobile */}
      <Controls
        showInteractive={false}
        position="bottom-right"
        className="!bg-[--bg-surface]/90 !backdrop-blur-xl !border-border-subtle !shadow-xl !rounded-xl hidden md:flex"
      />

      {/* MiniMap - hidden on mobile */}
      <MiniMap
        nodeColor={(node) => {
          const data = node.data as { company: Company };
          return data?.company?.colors?.primary || "var(--irid-a)";
        }}
        maskColor="rgba(8, 8, 16, 0.8)"
        className="!bg-[--bg-surface]/80 !backdrop-blur-md !border-border-subtle !rounded-lg hidden md:block"
      />
    </ReactFlow>
  );
}

interface OrgChartProps {
  initialCompany?: string;
}

export function OrgChart({ initialCompany }: OrgChartProps) {
  const [selectedCompany, setSelectedCompany] = useState(initialCompany || "all");
  const [layout, setLayout] = useState<OrgChartLayout>("vertical");

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[--bg-base] md:rounded-xl md:border md:border-border-subtle">
      {/* Mobile Controls */}
      <div 
        className="md:hidden flex flex-col shrink-0 border-b border-border-subtle"
        style={{
          background: "rgba(15, 15, 26, 0.90)",
          WebkitBackdropFilter: "blur(12px)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Row 3: Company filter pills - horizontal scroll */}
        <div 
          className="flex gap-2 px-4 py-2 overflow-x-auto touch-scroll"
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
          {companyFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedCompany(filter.id)}
              className={cn(
                "px-3 py-1.5 rounded-full uppercase tracking-wider font-neuropol transition-all duration-[180ms] whitespace-nowrap shrink-0 touch-manipulation min-h-[32px] text-scale-xs",
                selectedCompany === filter.id 
                  ? "text-white shadow-lg" 
                  : "bg-white/5 text-white/50 border border-white/10"
              )}
              style={{
                backgroundColor: selectedCompany === filter.id ? filter.color : undefined,
                boxShadow: selectedCompany === filter.id ? `0 4px 12px ${filter.color}40` : undefined,
              }}
            >
              {filter.shortLabel}
            </button>
          ))}
        </div>

        {/* Row 4: Layout toggle - right aligned */}
        <div className="flex justify-end px-4 py-1.5">
          <div className="flex gap-1 bg-white/5 rounded-md p-0.5">
            <button
              onClick={() => setLayout("vertical")}
              className={cn(
                "px-2 py-1 rounded font-neuropol uppercase transition-colors touch-manipulation text-scale-xs",
                layout === "vertical" ? "bg-white/10 text-white" : "text-white/40"
              )}
            >
              Vertical
            </button>
            <button
              onClick={() => setLayout("horizontal")}
              className={cn(
                "px-2 py-1 rounded font-neuropol uppercase transition-colors touch-manipulation text-scale-xs",
                layout === "horizontal" ? "bg-white/10 text-white" : "text-white/40"
              )}
            >
              Horizontal
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Controls */}
      <div className="hidden md:block relative">
        {/* Company Filter Pills */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
          {companyFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedCompany(filter.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-neuropol transition-all duration-[180ms]",
                selectedCompany === filter.id 
                  ? "text-white shadow-lg" 
                  : "bg-[--bg-surface]/80 text-text-muted hover:text-text-primary border border-border-subtle"
              )}
              style={{
                backgroundColor: selectedCompany === filter.id ? filter.color : undefined,
                boxShadow: selectedCompany === filter.id ? `0 4px 12px ${filter.color}40` : undefined,
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Layout Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-[--bg-surface]/80 backdrop-blur-md border border-border-subtle rounded-lg p-1.5 shadow-lg flex gap-1">
            <button
              onClick={() => setLayout("vertical")}
              className={cn(
                "px-3 py-1 rounded-md font-neuropol text-[10px] uppercase transition-colors",
                layout === "vertical" ? "bg-[--bg-elevated] text-text-primary" : "text-text-faint hover:text-text-muted"
              )}
            >
              Vertical
            </button>
            <button
              onClick={() => setLayout("horizontal")}
              className={cn(
                "px-3 py-1 rounded-md font-neuropol text-[10px] uppercase transition-colors",
                layout === "horizontal" ? "bg-[--bg-elevated] text-text-primary" : "text-text-faint hover:text-text-muted"
              )}
            >
              Horizontal
            </button>
          </div>
        </div>
      </div>

      {/* ReactFlow Container */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <OrgChartInner selectedCompany={selectedCompany} layout={layout} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
