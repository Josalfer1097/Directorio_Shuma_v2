"use client";

import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Employee } from "@/types";
import { cn } from "@/lib/utils";
import { getCompanyConfig } from "@/lib/companyConfig";

interface OrgNodeData {
  employee: Employee;
  isCollapsed?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
}

interface OrgChartNodeProps {
  data: OrgNodeData;
}

function OrgChartNodeComponent({ data }: OrgChartNodeProps) {
  const { employee, onSelect } = data;
  const [isHovered, setIsHovered] = useState(false);
  
  const colors = getCompanyConfig(employee.company);

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

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={onSelect}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={cn(
                "relative overflow-hidden bg-[--bg-elevated] rounded-xl transition-all duration-[180ms] group cursor-pointer touch-manipulation",
                "shadow-xl shadow-black/20",
                "p-2 md:p-3"
              )}
              style={{ 
                minWidth: '150px',
                maxWidth: '190px',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderLeftWidth: '3px',
                borderLeftColor: colors.accent || colors.primary,
                borderColor: isHovered ? colors.primary : 'var(--border-subtle)',
                boxShadow: isHovered ? `0 8px 32px ${colors.glow}` : undefined,
                transform: isHovered ? 'scale(1.03)' : 'none',
                background: isHovered 
                  ? `linear-gradient(180deg, ${colors.glow} 0%, var(--bg-elevated) 40%)`
                  : 'var(--bg-elevated)',
                padding: '8px 10px',
              }}
            >
              {/* Left Accent Bar */}
              <div 
                className="absolute left-0 top-0 bottom-0 rounded-l-xl transition-all duration-[180ms] z-20"
                style={{ 
                  width: isHovered ? '5px' : '3px',
                  background: colors.accent 
                    ? `linear-gradient(180deg, ${colors.accent}, ${colors.primary})` 
                    : `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})`
                }}
              />

              <div className="flex items-center gap-3 relative z-10 pl-1">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg transition-all duration-[180ms]"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    border: colors.accent ? `2px solid ${colors.accent}` : 'none',
                    transform: isHovered ? 'scale(1.1)' : 'none',
                  }}
                >
                  {getInitials(employee.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 
                    className="text-text-primary leading-tight line-clamp-2 text-scale-xs font-neuropol"
                    style={{ 
                      wordWrap: 'break-word',
                      whiteSpace: 'normal',
                    }}
                  >
                    {employee.name}
                  </h4>
                  <p 
                    className="font-dm-sans italic text-text-muted mt-0.5 leading-tight text-scale-xs"
                  >
                    {employee.position}
                  </p>
                </div>
              </div>

              {/* Company watermark in node */}
              <div 
                className="absolute bottom-[-10px] right-[-5px] font-neuropol text-[40px] pointer-events-none select-none transition-opacity duration-[180ms]"
                style={{ 
                  color: colors.primary,
                  opacity: isHovered ? 0.08 : 0.04,
                }}
              >
                {colors.initial}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-[--bg-surface] border-border-subtle">
            <div className="text-xs">
              <p className="font-medium text-text-primary">{employee.department}</p>
              <p className="text-text-muted">{employee.email}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-primary/50 !border-none"
      />
    </>
  );
}

export const OrgChartNode = memo(OrgChartNodeComponent);
