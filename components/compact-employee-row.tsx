"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import type { Employee, Company } from "@/types";
import { cn } from "@/lib/utils";

interface CompactEmployeeRowProps {
  employee: Employee;
  company: Company;
  index: number;
}

export function CompactEmployeeRow({
  employee,
  company,
  index,
}: CompactEmployeeRowProps) {
  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const colors = company.colors;
  const isFerrecapital = company.id === "ferrecapital";

  const monogramGradient = isFerrecapital
    ? "linear-gradient(135deg, #1A1A1A, #2A2A2A)"
    : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`;

  const badgeStyles = isFerrecapital
    ? {
        backgroundColor: "rgba(204, 0, 0, 0.10)",
        borderColor: "rgba(204, 0, 0, 0.30)",
        color: "#CC0000",
      }
    : {
        backgroundColor: `${colors.primary}1f`, // 12% opacity
        borderColor: `${colors.primary}40`, // 25% opacity
        color: colors.primary,
      };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ backgroundColor: "#161625", x: 2 }}
      className={cn(
        "group h-[52px] w-full flex items-center gap-4 px-4 border-b border-[--border-subtle] transition-all relative overflow-hidden",
        index % 2 === 0 ? "bg-[#0F0F1A]" : "bg-[#111120]"
      )}
    >
      {/* Left accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: colors.primary }}
      />

      {/* Monogram avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-lg"
        style={{ 
          background: monogramGradient,
          border: isFerrecapital ? "1.5px solid #CC0000" : "none"
        }}
      >
        <span style={{ fontFamily: "'Neuropol', sans-serif" }}>
          {getInitials(employee.name)}
        </span>
      </div>

      {/* Name and Role */}
      <div className="flex flex-col min-w-0 flex-1">
        <h4 
          className="text-[14px] text-text-primary truncate"
          style={{ fontFamily: "'Neuropol', sans-serif" }}
        >
          {employee.name}
        </h4>
        <p className="text-[12px] text-text-muted truncate font-dm-sans italic">
          {employee.position}
        </p>
      </div>

      {/* Extension Badge */}
      <div 
        className="hidden sm:flex px-2 py-0.5 rounded-full border text-[11px] shrink-0"
        style={{ 
          fontFamily: "'Neuropol', sans-serif",
          borderColor: `${colors.primary}40`,
          color: colors.primary,
          backgroundColor: `${colors.primary}12`
        }}
      >
        {employee.extension ? `EXT. ${employee.extension}` : "—"}
      </div>

      {/* Department Badge */}
      <div 
        className="hidden md:flex px-2 py-0.5 rounded-full border text-[9px] uppercase tracking-wider shrink-0"
        style={{ 
          fontFamily: "'Neuropol', sans-serif",
          ...badgeStyles
        }}
      >
        {employee.department}
      </div>

      {/* Company Color Dot */}
      <div 
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: colors.primary }}
      />

      {/* Phone Action */}
      <a
        href={`tel:${employee.phone}`}
        className="p-2 text-text-muted hover:text-text-primary transition-colors shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Phone className="w-4 h-4" />
      </a>
    </motion.div>
  );
}
