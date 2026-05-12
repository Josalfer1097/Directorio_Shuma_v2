'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { createRoot } from 'react-dom/client';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { OrgChartNode } from './org-chart-node';
import type { Employee, Company } from '@/types';
import { cn } from '@/lib/utils';
import { getEmployees, getCompanies } from '@/lib/data';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 88;
const HORIZONTAL_GAP = 40;
const VERTICAL_GAP = 80;

interface HierarchyNode extends d3.HierarchyNode<Employee> {
  x: number;
  y: number;
}

interface OrgChartProps {
  initialCompany?: string;
}

export function OrgChart({ initialCompany }: OrgChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompany || 'all');
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  useEffect(() => {
    try {
      const emps = getEmployees();
      const comps = getCompanies().filter((c) => !c.disabled);
      setEmployees(emps);
      setCompanies(comps);
    } catch (error) {
      console.error('Error loading org chart data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter employees by company
  const filteredEmployees = useMemo(() => {
    if (selectedCompany === 'all') {
      return employees.filter((emp) => companies.some((c) => c.id === emp.company && !c.disabled));
    }
    return employees.filter((emp) => emp.company === selectedCompany);
  }, [employees, selectedCompany, companies]);

  // Build hierarchy
  const hierarchyRoot = useMemo(() => {
    if (filteredEmployees.length === 0) return null;

    // Find root nodes
    const empIds = new Set(filteredEmployees.map((e) => e.id));
    const roots = filteredEmployees.filter((emp) => !emp.reportsTo || !empIds.has(emp.reportsTo));

    // Create map for building tree
    const empMap = new Map(filteredEmployees.map((emp) => [emp.id, { ...emp }]));

    // If multiple roots, create virtual root
    let rootEmployee: Employee;
    if (roots.length > 1) {
      rootEmployee = {
        id: '__root__',
        name: 'Grupo Shuma',
        position: 'Holding',
        company: 'comercializadora',
        department: 'Corporativo',
        location: '',
        email: null,
        phone: null,
        extension: null,
        avatar: null,
        reportsTo: null,
      };
      // Reassign roots to point to virtual root
      roots.forEach((root) => {
        const emp = empMap.get(root.id);
        if (emp) {
          emp.reportsTo = '__root__';
        }
      });
    } else {
      rootEmployee = roots[0] || filteredEmployees[0];
    }

    // Build tree recursively
    const buildTree = (
      emp: Employee
    ): Employee & { children?: (Employee & { children?: any[] })[] } => {
      const children = filteredEmployees
        .filter((e) => e.reportsTo === emp.id)
        .map((child) => buildTree(child));

      return {
        ...emp,
        ...(children.length > 0 && { children }),
      };
    };

    const tree = buildTree(rootEmployee);
    return d3.hierarchy(tree);
  }, [filteredEmployees]);

  // Layout calculation
  const layoutData = useMemo(() => {
    if (!hierarchyRoot) return { nodes: [], links: [] };

    const treeLayout = d3
      .tree<Employee>()
      .nodeSize([NODE_WIDTH + HORIZONTAL_GAP, NODE_HEIGHT + VERTICAL_GAP]);

    const root = treeLayout(hierarchyRoot);
    const nodes = root.descendants() as HierarchyNode[];
    const links = root.links();

    return { nodes, links };
  }, [hierarchyRoot, layout]);

  // Setup zoom behavior
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .on('zoom', (event) => {
        d3.select(gRef.current).attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);
  }, []);

  // Render D3
  useEffect(() => {
    if (!svgRef.current || !gRef.current || !layoutData.nodes.length) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    const { nodes, links } = layoutData;

    // Clear previous
    g.selectAll('*').remove();

    // Draw links
    const linkGen =
      layout === 'horizontal'
        ? d3
            .linkHorizontal<any, HierarchyNode>()
            .x((d) => d.y)
            .y((d) => d.x)
        : d3
            .linkVertical<any, HierarchyNode>()
            .x((d) => d.x)
            .y((d) => d.y);

    g.selectAll('path.link')
      .data(links)
      .join('path')
      .attr('class', 'link')
      .attr('d', linkGen as any)
      .attr('stroke', 'var(--node-link)')
      .attr('stroke-width', 1.5)
      .attr('fill', 'none');

    // Draw nodes
    const nodeGroups = g
      .selectAll('g.node')
      .data(nodes, (d: any) => d.data.id)
      .join((enter) => {
        const g = enter.append('g').attr('class', 'node');
        g.append('foreignObject')
          .attr('width', NODE_WIDTH)
          .attr('height', NODE_HEIGHT)
          .attr('x', -NODE_WIDTH / 2)
          .attr('y', -NODE_HEIGHT / 2);
        return g;
      });

    nodeGroups.attr('transform', (d) =>
      layout === 'horizontal' ? `translate(${d.y},${d.x})` : `translate(${d.x},${d.y})`
    );

    // Render React components in foreignObject
    nodeGroups.select('foreignObject').each((d, i, nodes) => {
      const node = d as HierarchyNode;
      const company = companies.find((c) => c.id === node.data.company);
      if (!company) return;

      const container = nodes[i] as any;
      container.innerHTML = '';

      const div = document.createElement('div');
      div.className = 'flex items-center justify-center';
      div.style.width = NODE_WIDTH + 'px';
      div.style.height = NODE_HEIGHT + 'px';
      container.appendChild(div);

      const root = createRoot(div);
      root.render(
        <OrgChartNode
          employee={node.data}
          company={company}
          isHovered={hoveredNodeId === node.data.id}
          onHover={setHoveredNodeId}
        />
      );
    });

    // Auto-fit to view
    const bounds = g.node()?.getBBox();
    if (bounds && svgRef.current) {
      const fullWidth = svgRef.current.clientWidth;
      const fullHeight = svgRef.current.clientHeight;
      const midX = bounds.x + bounds.width / 2;
      const midY = bounds.y + bounds.height / 2;
      const scale = Math.min(
        (fullWidth - 80) / bounds.width,
        (fullHeight - 80) / bounds.height,
        2
      );

      svg
        .transition()
        .duration(750)
        .call(
          zoomRef.current!.transform as any,
          d3.zoomIdentity
            .translate(fullWidth / 2, fullHeight / 2)
            .scale(scale)
            .translate(-midX, -midY)
        );
    }
  }, [layoutData, layout, companies, hoveredNodeId]);

  const handleZoom = useCallback((direction: 'in' | 'out' | 'fit') => {
    if (!svgRef.current || !zoomRef.current) return;

    const svg = d3.select(svgRef.current);

    if (direction === 'fit') {
      const bounds = gRef.current?.getBBox();
      if (bounds) {
        const fullWidth = svgRef.current.clientWidth;
        const fullHeight = svgRef.current.clientHeight;
        const midX = bounds.x + bounds.width / 2;
        const midY = bounds.y + bounds.height / 2;
        const newScale = Math.min(
          (fullWidth - 80) / bounds.width,
          (fullHeight - 80) / bounds.height,
          2
        );
        svg
          .transition()
          .duration(750)
          .call(
            zoomRef.current.transform as any,
            d3.zoomIdentity
              .translate(fullWidth / 2, fullHeight / 2)
              .scale(newScale)
              .translate(-midX, -midY)
          );
      }
    } else {
      const factor = direction === 'in' ? 1.3 : 0.77;
      svg
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy as any, factor);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-muted-foreground">Cargando organigrama...</div>
      </div>
    );
  }

  const companyOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'comercializadora', label: 'Com. Shuma' },
    { id: 'acabados', label: 'Acabados' },
    { id: 'ferrecapital', label: 'Ferrecapital' },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background md:rounded-xl md:border md:border-border-subtle">
      {/* Mobile Controls */}
      <div className="md:hidden flex flex-col shrink-0 border-b border-border-subtle bg-bg-surface/90 backdrop-blur">
        {/* Company Filter */}
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-hide">
          {companyOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedCompany(option.id)}
              className={cn(
                'rounded-full px-3 py-1 text-scale-xs font-semibold whitespace-nowrap transition-all',
                selectedCompany === option.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Layout Toggle */}
        <div className="flex justify-end gap-1 px-3 py-1.5">
          <button
            onClick={() => setLayout('vertical')}
            className={cn(
              'rounded px-2 py-1 text-scale-xs font-semibold transition-all',
              layout === 'vertical' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            V
          </button>
          <button
            onClick={() => setLayout('horizontal')}
            className={cn(
              'rounded px-2 py-1 text-scale-xs font-semibold transition-all',
              layout === 'horizontal'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            H
          </button>
        </div>
      </div>

      {/* Desktop Controls */}
      <div className="hidden md:block relative h-12 border-b border-border-subtle bg-bg-surface/50 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Company Filter */}
          <div className="flex gap-1">
            {companyOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedCompany(option.id)}
                className={cn(
                  'rounded-lg px-3 py-1 text-scale-xs font-semibold transition-all',
                  selectedCompany === option.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Layout Toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setLayout('vertical')}
              className={cn(
                'rounded px-2 py-1 text-scale-xs font-semibold transition-all',
                layout === 'vertical'
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-muted-foreground'
              )}
            >
              Vertical
            </button>
            <button
              onClick={() => setLayout('horizontal')}
              className={cn(
                'rounded px-2 py-1 text-scale-xs font-semibold transition-all',
                layout === 'horizontal'
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-muted-foreground'
              )}
            >
              Horizontal
            </button>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative flex-1 overflow-hidden">
        <svg
          ref={svgRef}
          className="h-full w-full"
          style={{ display: 'block' }}
        >
          <g ref={gRef} />
        </svg>

        {/* Zoom Buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 rounded-xl border border-border-subtle bg-bg-surface/90 p-1 backdrop-blur">
          <button
            onClick={() => handleZoom('in')}
            className="rounded-lg p-2 text-muted-foreground hover:text-text-primary hover:bg-muted transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="rounded-lg p-2 text-muted-foreground hover:text-text-primary hover:bg-muted transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <div className="h-px bg-border-subtle" />
          <button
            onClick={() => handleZoom('fit')}
            className="rounded-lg p-2 text-muted-foreground hover:text-text-primary hover:bg-muted transition-colors"
            title="Fit to screen"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
