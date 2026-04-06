"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import type { Employee, Company } from "@/types";
import { cn } from "@/lib/utils";

interface EmployeeCardProps {
  employee: Employee;
  company?: Company;
  index: number;
}

// Premium easing curve
const premiumEase = [0.25, 0.46, 0.45, 0.94];

// Get company initial for watermark
const getCompanyInitial = (companyId: string) => {
  const initials: Record<string, string> = {
    "comercializadora-shuma": "S",
    "acabados-shuma": "A",
    ferrecapital: "F",
    arkiramica: "A",
  };
  return initials[companyId] || "S";
};

export function EmployeeCard({
  employee,
  company,
  index,
}: EmployeeCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const isTodos = !company;
  
  // Specific company colors as requested
  const companyColors = {
    "comercializadora-shuma": {
      primary: "#0066CC",
      secondary: "#004499",
      highlight: "#00AAFF",
      glow: "rgba(0,102,204,0.20)",
      badge: "bg-[rgba(0,102,204,0.12)] border-[rgba(0,102,204,0.25)] text-[#00AAFF]"
    },
    "acabados-shuma": {
      primary: "#C0152A",
      secondary: "#8B0000",
      glow: "rgba(192,21,42,0.18)",
      badge: "bg-[rgba(192,21,42,0.15)] border-[rgba(192,21,42,0.30)] text-[#FF4D5E]"
    },
    "ferrecapital": {
      primary: "#2A2A2A",
      secondary: "#1A1A1A",
      glow: "rgba(204,0,0,0.12)",
      badge: "bg-[rgba(204,0,0,0.10)] border-[rgba(204,0,0,0.25)] text-[#CC0000]"
    },
    "arkiramica": {
      primary: "#F5C400",
      secondary: "#C49A00",
      glow: "rgba(245,196,0,0.18)",
      badge: "bg-[rgba(245,196,0,0.15)] border-[rgba(245,196,0,0.30)] text-[#2A1E00]"
    }
  };

  const colors = companyColors[employee.company as keyof typeof companyColors] || {
    primary: "var(--irid-a)",
    secondary: "var(--irid-b)",
    glow: "rgba(59,130,246,0.15)",
    badge: "bg-[rgba(99,102,241,0.10)] border-[rgba(99,102,241,0.20)] text-[#818CF8]"
  };

  const barGradient = isTodos 
    ? (index % 2 === 0 ? "linear-gradient(180deg, #3B82F6, #8B5CF6)" : "linear-gradient(180deg, #8B5CF6, #EC4899)")
    : employee.company === 'ferrecapital'
      ? "linear-gradient(180deg, #CC0000, #2A2A2A)"
      : `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})`;

  const monogramGradient = isTodos
    ? (index % 2 === 0 ? "linear-gradient(135deg, #3B82F6, #8B5CF6)" : "linear-gradient(135deg, #8B5CF6, #EC4899)")
    : employee.company === 'comercializadora-shuma'
      ? `linear-gradient(135deg, ${colors.primary}, ${colors.highlight || colors.secondary})`
      : employee.company === 'ferrecapital'
        ? "linear-gradient(135deg, #2A2A2A, #1A1A1A)"
        : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`;

  const companyInitial = getCompanyInitial(employee.company);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.3, delay: index * 0.035, ease: premiumEase }}
      className="group relative h-full"
    >
      <Link href={`/directorio/${employee.id}`} className="block h-full">
        <div
          className={cn(
            "relative overflow-hidden rounded-[14px] border border-[--border-subtle] bg-[--bg-surface] p-5 h-full",
            "transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_12px_40px_-12px_var(--glow)] active:scale-[0.96]"
          )}
          style={{ 
            "--glow": colors.glow 
          } as React.CSSProperties}
        >
          {/* Left Accent Bar */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[14px] transition-all duration-300 group-hover:w-[5px] z-20"
            style={{ 
              background: barGradient
            }}
          />

          {/* Watermark */}
          <div 
            className="absolute bottom-[-20px] right-[-10px] font-neuropol text-[96px] leading-none pointer-events-none select-none transition-all duration-300 opacity-[0.05] group-hover:opacity-[0.10] z-0"
            style={{ color: colors.primary }}
          >
            {companyInitial}
          </div>

          <div className="relative flex flex-col h-full z-10">
            {/* Monogram circle */}
            <div className="flex items-start gap-4 mb-4">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 text-white shadow-lg"
                style={{ 
                  background: monogramGradient,
                  border: employee.company === 'ferrecapital' ? "2px solid #CC0000" : "none"
                }}
              >
                <span style={{ fontFamily: "'Neuropol', sans-serif" }}>{getInitials(employee.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-base text-text-primary leading-tight truncate"
                  style={{ fontFamily: "'Neuropol', sans-serif" }}
                >
                  <span style={{ fontFamily: "'Neuropol', sans-serif" }}>{employee.name || "—"}</span>
                </h3>
                <p className="font-dm-sans italic text-[13px] text-text-muted truncate mt-0.5" style={{ fontFamily: "inherit" }}>
                  {employee.position || "—"}
                </p>
              </div>
            </div>

            {/* Department Badge & Location */}
            <div className="mb-auto flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <span 
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border",
                  )}
                  style={{ 
                    fontFamily: "'Neuropol', sans-serif",
                    backgroundColor: employee.company === 'ferrecapital' ? 'rgba(204,0,0,0.10)' : colors.primary + '1f',
                    borderColor: employee.company === 'ferrecapital' ? 'rgba(204,0,0,0.25)' : colors.primary + '40',
                    color: employee.company === 'ferrecapital' ? '#CC0000' : (employee.company === 'comercializadora-shuma' ? '#00AAFF' : colors.primary)
                  }}
                >
                  {employee.department || "—"}
                </span>
              </div>
              {employee.location && (
                <div className="flex items-center gap-1.5 text-text-muted">
                  <MapPin className="w-3 h-3" />
                  <span className="font-dm-sans text-[11px] truncate">{employee.location}</span>
                </div>
              )}
            </div>

            {/* Contact Row */}
            <div className="flex items-center gap-4 mt-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `tel:${employee.phone}`;
                  }}
                  className="p-2 rounded-full bg-[--bg-elevated] hover:bg-[--border-subtle] transition-colors"
                  title="Llamar"
                >
                  <Phone className="w-4 h-4 text-text-muted" />
                </button>
                {employee.extension && (
                  <span className="font-dm-sans text-[11px] text-text-muted">Ext. {employee.extension}</span>
                )}
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `mailto:${employee.email}`;
                }}
                className="p-2 rounded-full bg-[--bg-elevated] hover:bg-[--border-subtle] transition-colors"
                title="Enviar correo"
              >
                <Mail className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
