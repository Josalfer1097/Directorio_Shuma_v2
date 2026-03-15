"use client";

import { motion } from "framer-motion";
import { Building2, Users } from "lucide-react";
import Link from "next/link";
import type { Company } from "@/types";

interface CompanyCardProps {
  company: Company & { employeeCount: number };
  index: number;
}

export function CompanyCard({ company, index }: CompanyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/directorio?empresa=${company.id}`}>
        <div
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
          style={{
            background: `linear-gradient(135deg, ${company.color}08 0%, transparent 50%)`,
          }}
        >
          {/* Accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
            style={{ backgroundColor: company.color }}
          />

          {/* Glow effect */}
          <div
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-3xl"
            style={{ backgroundColor: company.color }}
          />

          <div className="relative">
            {/* Icon and Type */}
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${company.color}20` }}
              >
                <Building2
                  className="w-6 h-6"
                  style={{ color: company.color }}
                />
              </div>
              <span
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  backgroundColor: `${company.color}15`,
                  color: company.color,
                }}
              >
                {company.type === "holding" ? "Holding" : "Subsidiaria"}
              </span>
            </div>

            {/* Name */}
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
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
