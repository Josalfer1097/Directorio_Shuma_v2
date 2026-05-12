"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import Link from "next/link";
import type { Employee, Company } from "@/types";
import { cn } from "@/lib/utils";

// Premium easing curve for animations
const premiumEase = [0.25, 0.46, 0.45, 0.94];

// Limit stagger to first N items for performance
const MAX_ANIMATED_ITEMS = 30;

interface AgendaViewProps {
  employees: Employee[];
  companies: Company[];
  selectedCompanies: string[];
}

// Get company color for avatar background
function getCompanyColor(companyId: string, companies: Company[]): string {
  const company = companies.find((c) => c.id === companyId);
  return company?.colors?.primary || "#3B82F6";
}

// Get initials from name
function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || "?";
}

// Get last name for sorting (last word in name)
function getLastName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts[parts.length - 1] || "";
}

// Group employees by first letter of last name
function groupByLastNameInitial(employees: Employee[]) {
  const sorted = [...employees].sort((a, b) => {
    const lastA = getLastName(a.name).toLowerCase();
    const lastB = getLastName(b.name).toLowerCase();
    return lastA.localeCompare(lastB, "es");
  });

  const groups: { letter: string; employees: Employee[] }[] = [];
  let currentLetter = "";

  for (const employee of sorted) {
    const letter = getLastName(employee.name)[0]?.toUpperCase() || "#";
    if (letter !== currentLetter) {
      currentLetter = letter;
      groups.push({ letter, employees: [] });
    }
    groups[groups.length - 1].employees.push(employee);
  }

  return groups;
}

export function AgendaView({
  employees,
  companies,
  selectedCompanies,
}: AgendaViewProps) {
  const shouldGroup = employees.length >= 10;

  const groups = useMemo(() => {
    if (shouldGroup) {
      return groupByLastNameInitial(employees);
    }
    // If less than 10, just sort without grouping
    const sorted = [...employees].sort((a, b) => {
      const lastA = getLastName(a.name).toLowerCase();
      const lastB = getLastName(b.name).toLowerCase();
      return lastA.localeCompare(lastB, "es");
    });
    return [{ letter: "", employees: sorted }];
  }, [employees, shouldGroup]);

  const hideCompanyInfo = selectedCompanies.length === 1;

  return (
    <div className="w-full">
      {groups.map((group) => (
        <div key={group.letter || "all"}>
          {/* Sticky header for letter */}
          {shouldGroup && group.letter && (
            <div className="sticky top-[56px] md:top-[64px] z-10 py-2 px-3 bg-background/95 backdrop-blur-sm border-b border-border/50">
              <span className="text-scale-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {group.letter}
              </span>
            </div>
          )}

          {/* Employee items */}
          {group.employees.map((employee, index) => {
            const company = companies.find((c) => c.id === employee.company);
            const companyColor = getCompanyColor(employee.company, companies);
            
            // Track global index for animation limiting
            const globalIndex = groups
              .slice(0, groups.indexOf(group))
              .reduce((sum, g) => sum + g.employees.length, 0) + index;
            const shouldAnimate = globalIndex < MAX_ANIMATED_ITEMS;

            return (
              <motion.div
                key={employee.id}
                initial={shouldAnimate ? { opacity: 0, x: -8, scale: 0.98 } : { opacity: 1 }}
                animate={shouldAnimate ? { opacity: 1, x: 0, scale: 1 } : { opacity: 1 }}
                transition={shouldAnimate ? { 
                  duration: 0.2, 
                  delay: globalIndex * 0.02,
                  ease: premiumEase 
                } : undefined}
              >
                <Link
                  href={`/empleado/${employee.id}`}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 text-left",
                    "border-b border-border/30 last:border-b-0",
                    "hover:bg-muted/50 active:bg-muted/70 transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset"
                  )}
                  style={{ minHeight: "64px" }}
                >
                {/* Avatar */}
                {employee.avatar ? (
                  <img
                    src={employee.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    style={{
                      border: `2px solid ${companyColor}`,
                    }}
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-scale-sm font-medium"
                    style={{
                      background: `${companyColor}20`,
                      border: `2px solid ${companyColor}`,
                      color: companyColor,
                    }}
                  >
                    {getInitials(employee.name)}
                  </div>
                )}

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <div className="text-scale-base font-medium text-foreground truncate">
                    {employee.name}
                  </div>
                  <div className="text-scale-sm text-muted-foreground truncate">
                    {employee.position}
                    {!hideCompanyInfo && company && (
                      <span className="text-muted-foreground/60">
                        {" "}
                        · {company.shortName || company.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Company color indicator (subtle) */}
                <div
                  className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ background: companyColor }}
                  aria-hidden="true"
                />
                </Link>
              </motion.div>
            );
          })}
        </div>
      ))}

      {/* Empty state */}
      {employees.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-scale-base text-muted-foreground">
            No se encontraron empleados
          </p>
        </div>
      )}
    </div>
  );
}
