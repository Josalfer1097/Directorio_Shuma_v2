"use client";

import { motion } from "framer-motion";
import { Building2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Company } from "@/types";
import { getCompanyConfig, getAccentColor, alphaColor } from "@/lib/companyConfig";
import { useCountUp } from "@/hooks/use-count-up";
import { useCompanyTheme, type ActiveTheme } from "@/lib/CompanyThemeContext";

interface CompanyCardProps {
  company: Company & { employeeCount: number };
  index: number;
}

// Premium easing curve
const premiumEase = [0.25, 0.46, 0.45, 0.94];

export function CompanyCard({ company, index }: CompanyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const companyConfig = getCompanyConfig(company.id);
  const animatedCount = useCountUp(company.employeeCount, 800);
  const { setActiveTheme } = useCompanyTheme();

  const handleMouseEnter = () => {
    setIsHovered(true);
    setActiveTheme(company.id as ActiveTheme);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveTheme("default");
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: premiumEase }}
      className="will-change-transform gpu-accelerated"
    >
      <Link href={`/directorio?empresa=${company.id}`}>
        <div
          className="card-shimmer corner-bracket group relative overflow-hidden rounded-xl p-6 h-full min-h-[200px] flex flex-col"
          style={{
            ["--shimmer-color" as string]: getAccentColor(companyConfig),
            ["--bracket-color" as string]: getAccentColor(companyConfig),
            borderWidth: isHovered ? '1.5px' : '1px',
            borderStyle: 'solid',
            borderColor: isHovered ? getAccentColor(companyConfig) : 'var(--border)',
            boxShadow: isHovered ? `0 0 0 1px ${getAccentColor(companyConfig)}, 0 8px 32px ${companyConfig.glow}` : 'none',
            transform: isHovered ? 'translateY(-3px) scale(1.012)' : 'none',
            background: isHovered 
              ? `linear-gradient(160deg, ${alphaColor(companyConfig, "10")} 0%, transparent 60%), rgba(255,255,255,0.07)` 
              : `linear-gradient(135deg, ${alphaColor(companyConfig, "08")} 0%, transparent 50%), rgba(255,255,255,0.04)`,
            transitionProperty: 'all',
            transitionDuration: '180ms',
            transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Left accent bar */}
          <div 
            className="absolute left-0 top-0 bottom-0 transition-all duration-[180ms]"
            style={{
              width: isHovered ? '5px' : '3px',
              background: isHovered && companyConfig.accent 
                ? `linear-gradient(to bottom, ${companyConfig.accent}, ${getAccentColor(companyConfig)})`
                : getAccentColor(companyConfig),
              opacity: isHovered ? 1 : 0.7,
            }}
          />

          {/* Glow effect */}
          <div
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-[180ms] blur-3xl"
            style={{ backgroundColor: getAccentColor(companyConfig) }}
          />

          <div className="relative flex flex-col flex-1 pl-2">
            {/* Icon and Type */}
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-[180ms]"
                style={{ 
                  backgroundColor: alphaColor(companyConfig, "20"),
                  boxShadow: isHovered ? `0 0 12px ${companyConfig.glow}` : 'none',
                }}
              >
                <Building2
                  className="w-6 h-6"
                  style={{ color: getAccentColor(companyConfig) }}
                />
              </div>
              <span
                className="text-xs font-neuropol px-2 py-1 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: alphaColor(companyConfig, "15"),
                  color: getAccentColor(companyConfig),
                }}
              >
                Empresa
              </span>
            </div>

            {/* Name */}
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-[180ms] line-clamp-2">
              {company.shortName || company.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
              {company.description}
            </p>

            {/* Employee Count */}
            <div className="flex items-center gap-2 text-muted-foreground mt-auto">
              <Users className="w-4 h-4" />
              <span className="text-sm tabular-nums">
                {animatedCount}{" "}
                {company.employeeCount === 1 ? "empleado" : "empleados"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
