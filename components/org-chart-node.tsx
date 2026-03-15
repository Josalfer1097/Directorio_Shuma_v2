"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Employee, Company } from "@/types";

interface OrgNodeData {
  employee: Employee;
  company: Company;
  isCollapsed?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
}

function OrgChartNodeComponent({ data }: NodeProps<OrgNodeData>) {
  const { employee, company, hasChildren, onSelect } = data as OrgNodeData;

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
        className="!w-2 !h-2 !bg-muted-foreground/50"
      />

      <div
        onClick={onSelect}
        className="group cursor-pointer bg-card border border-border rounded-lg p-4 shadow-md hover:shadow-lg hover:border-primary/50 transition-all min-w-[180px]"
        style={{
          borderTopColor: company.color,
          borderTopWidth: "3px",
        }}
      >
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarFallback
              className="text-sm font-medium"
              style={{
                backgroundColor: `${company.color}20`,
                color: company.color,
              }}
            >
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {employee.name}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {employee.position}
            </p>
          </div>
        </div>

        {/* Company badge */}
        <div className="mt-2 flex items-center justify-between">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${company.color}15`,
              color: company.color,
            }}
          >
            {company.shortName || company.name}
          </span>

          {hasChildren && (
            <span className="text-[10px] text-muted-foreground">
              + reportes
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-muted-foreground/50"
      />
    </>
  );
}

export const OrgChartNode = memo(OrgChartNodeComponent);
