'use client';

import { memo } from 'react';
import type { Employee, Company } from '@/types';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 88;

interface OrgChartNodeProps {
  employee: Employee;
  company: Company;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

const getCompanyColor = (companyId: string): string => {
  const colors: Record<string, string> = {
    comercializadora: '#2563eb',
    acabados: '#dc2626',
    ferrecapital: '#7c3aed',
    grupo: '#059669',
  };
  return colors[companyId] || '#6b7280';
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const OrgChartNode = memo(function OrgChartNode({
  employee,
  company,
  isHovered,
  onHover,
}: OrgChartNodeProps) {
  const bgColor = getCompanyColor(company.id);

  return (
    <div
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      }}
      className="node-card"
      onMouseEnter={() => onHover(employee.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className="flex h-full gap-2 rounded-xl border bg-[--node-bg] p-2 transition-all duration-[180ms]"
        style={{
          borderColor: 'var(--node-border)',
          boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {/* Avatar */}
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: bgColor }}
        >
          {getInitials(employee.name)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="line-clamp-1 text-scale-xs font-semibold text-[--node-text]">
            {employee.name}
          </div>
          <div className="line-clamp-1 text-scale-xs text-[--node-text-muted]">
            {employee.position}
          </div>
          <div className="line-clamp-1 text-scale-xs text-[--node-text-muted]">
            • {company.shortName || company.name}
          </div>
        </div>
      </div>
    </div>
  );
});
