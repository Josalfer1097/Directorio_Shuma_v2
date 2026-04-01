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
  const { employee, company, hasChildren, onSelect } = data;

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
        className="!w-2 !h-2 !bg-primary/50"
      />

      <div
        onClick={onSelect}
        className={cn(
          "org-node-hover cursor-pointer min-w-[200px]",
          "bg-card/95 backdrop-blur-sm",
          "border-2 border-border rounded-xl p-4",
          "shadow-lg shadow-black/20",
          "hover:border-primary/50"
        )}
        style={{
          borderLeftColor: company.color,
          borderLeftWidth: "4px",
        }}
      >
        <div className="flex items-center gap-3">
          <Avatar className={cn(
            "w-12 h-12 border-2 border-border",
            getMonogramClass(employee.company)
          )}>
            <AvatarFallback
              className="text-sm font-semibold text-white"
            >
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {employee.name}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {employee.position}
            </p>
            <p className="text-[10px] text-muted-foreground/70 truncate">
              {employee.department}
            </p>
          </div>
        </div>

        {/* Company badge and children indicator */}
        <div className="mt-3 flex items-center justify-between">
          <span
            className="text-[10px] font-medium px-2 py-1 rounded-full"
            style={{
              backgroundColor: `${company.color}15`,
              color: company.color,
            }}
          >
            {company.shortName || company.name}
          </span>

          {hasChildren && (
            <span className="text-[10px] text-primary font-medium">
              + reportes
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-primary/50"
      />
    </>
  );
}

export const OrgChartNode = memo(OrgChartNodeComponent);
