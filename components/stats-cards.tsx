"use client";

import { motion } from "framer-motion";
import { Users, Building2, Briefcase } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";

interface StatsCardsProps {
  totalEmployees: number;
  totalCompanies: number;
  totalDepartments: number;
}

const stats = [
  {
    key: "employees",
    label: "Empleados",
    icon: Users,
    color: "#7C3AED",
    getValue: (s: StatsCardsProps) => s.totalEmployees,
  },
  {
    key: "companies",
    label: "Empresas",
    icon: Building2,
    color: "#06B6D4",
    getValue: (s: StatsCardsProps) => s.totalCompanies,
  },
  {
    key: "departments",
    label: "Departamentos",
    icon: Briefcase,
    color: "#16A34A",
    getValue: (s: StatsCardsProps) => s.totalDepartments,
  },
];

function AnimatedStatValue({ value }: { value: number }) {
  const animated = useCountUp(value, 800);
  return <>{animated}</>;
}

export function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="relative overflow-hidden rounded-xl border border-border bg-card p-6"
        >
          {/* Background gradient */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: `radial-gradient(circle at top right, ${stat.color}, transparent 70%)`,
            }}
          />

          <div className="relative flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground tabular-nums">
                <AnimatedStatValue value={stat.getValue(props)} />
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
