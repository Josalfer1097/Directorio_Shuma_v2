"use client";

import { motion } from "framer-motion";
import { Building2, Users } from "lucide-react";
import Link from "next/link";
import type { Company } from "@/types";

interface CompanyCardProps {
  company: Company & { employeeCount: number };
  index: number;
}

// Premium easing curve
const premiumEase = [0.25, 0.46, 0.45, 0.94];

export function CompanyCard({ company, index }: CompanyCardProps) {
  const primaryColor = company.colors.primary;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: premiumEase }}
      className="will-change-transform gpu-accelerated"
    >
      <Link href={`/directorio?empresa=${company.id}`}>
        <div
          className="card-shimmer corner-bracket group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-[180ms] hover:scale-[1.02] hover:shadow-lg"
          style={{
            ["--shimmer-color" as string]: primaryColor,
            ["--bracket-color" as string]: primaryColor,
            background: `linear-gradient(135deg, ${primaryColor}08 0%, transparent 50%)`,
            transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 8px 30px -10px ${primaryColor}40`;
            e.currentTarget.style.borderColor = `${primaryColor}50`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "";
            e.currentTarget.style.borderColor = "";
          }}
        >
          {/* Glow effect */}
          <div
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-[180ms] blur-3xl"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="relative">
            {/* Icon and Type */}
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Building2
                  className="w-6 h-6"
                  style={{ color: primaryColor }}
                />
              </div>
              <span
                className="text-xs font-neuropol px-2 py-1 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                }}
              >
                Empresa
              </span>
            </div>

            {/* Name */}
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-[180ms] line-clamp-2">
              {company.shortName || company.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {company.description}
            </p>

            {/* Employee Count */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {company.employeeCount}{" "}
                {company.employeeCount === 1 ? "empleado" : "empleados"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
