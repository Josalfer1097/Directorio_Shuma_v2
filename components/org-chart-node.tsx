"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Employee, Company } from "@/types";
import { cn } from "@/lib/utils";

interface OrgNodeData {
  employee: Employee;
  company: Company;
  isCollapsed?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
}

interface OrgChartNodeProps {
  data: OrgNodeData;
}

// Get monogram class based on company
const getMonogramClass = (companyId: string) => {
  const classMap: Record<string, string> = {
    "grupo-shuma": "monogram-corporativo",
    "comercializadora-shuma": "monogram-comercializadora",
    "acabados-shuma": "monogram-acabados",
    "ferrecapital": "monogram-ferrecapital",
    "arkiramica": "monogram-arkiramica",
  };
  return classMap[companyId] || "monogram-corporativo";
};

function OrgChartNodeComponent({ data }: OrgChartNodeProps) {
  const { employee, company, onSelect } = data;
  
  const companyColors = {
    "comercializadora-shuma": {
      primary: "#0066CC",
      secondary: "#004499",
      initial: "S"
    },
    "acabados-shuma": {
      primary: "#C0152A",
      secondary: "#8B0000",
      initial: "A"
    },
    "ferrecapital": {
      primary: "#2A2A2A",
      secondary: "#1A1A1A",
      initial: "F"
    },
    "arkiramica": {
      primary: "#F5C400",
      secondary: "#C49A00",
      initial: "A"
    }
  };

  const colors = companyColors[employee.company as keyof typeof companyColors] || {
    primary: "var(--irid-a)",
    secondary: "var(--irid-b)",
    initial: employee.company[0].toUpperCase()
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-primary/50 !border-none"
      />

        <div
          onClick={onSelect}
          className={cn(
            "relative overflow-hidden min-w-[240px] bg-[--bg-elevated] border border-[--border-subtle] rounded-xl p-4 transition-all hover:border-primary/50 group cursor-pointer",
            "shadow-xl shadow-black/20",
            employee.company === 'ferrecapital' ? "border-[#CC0000]/50" : ""
          )}
          style={{ 
            borderColor: employee.company === 'ferrecapital' ? '#CC0000' : undefined
          }}
        >
        {/* Left Accent Bar */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl transition-all duration-300 group-hover:w-[5px] z-20"
          style={{ 
            background: employee.company === 'ferrecapital' ? 'linear-gradient(180deg, #CC0000, #2A2A2A)' : `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})`
          }}
        />

        <div className="flex items-center gap-3 relative z-10 pl-1">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg"
            style={{ 
              background: employee.company === 'ferrecapital' ? "linear-gradient(135deg, #2A2A2A, #1A1A1A)" : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              border: employee.company === 'ferrecapital' ? '2px solid #CC0000' : 'none'
            }}
          >
            {getInitials(employee.name)}
          </div>

          <div className="min-w-0 flex-1">
            <h4 
              className="text-[13px] text-text-primary truncate"
              style={{ fontFamily: "'Neuropol', sans-serif" }}
            >
              {employee.name}
            </h4>
            <p className="font-dm-sans italic text-[11px] text-text-muted truncate mt-0.5">
              {employee.position}
            </p>
          </div>
        </div>

        {/* Company watermark in node */}
        <div 
          className="absolute bottom-[-10px] right-[-5px] font-neuropol text-[40px] opacity-[0.05] pointer-events-none select-none group-hover:opacity-[0.10] transition-opacity"
          style={{ color: colors.primary }}
        >
          {colors.initial}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-primary/50 !border-none"
      />
    </>
  );
}

export const OrgChartNode = memo(OrgChartNodeComponent);
