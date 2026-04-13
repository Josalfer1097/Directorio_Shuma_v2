"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { getEmployees, getCompanies } from "@/lib/data";
import { getCompanyConfig } from "@/lib/companyConfig";
import { EmployeeCard } from "./employee-card";
import type { Employee, Company } from "@/types";

interface DepartmentViewProps {
  department: string | null;
  onClose: () => void;
}

export function DepartmentView({ department, onClose }: DepartmentViewProps) {
  const router = useRouter();
  const employees = getEmployees();
  const companies = getCompanies();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    if (department) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when panel is open
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [department, onClose]);

  // Filter employees by department
  const departmentEmployees = useMemo(() => {
    if (!department) return [];
    return employees.filter(
      (emp) => emp.department?.toLowerCase() === department.toLowerCase()
    );
  }, [employees, department]);

  // Find manager (highest tier role)
  const manager = useMemo(() => {
    if (departmentEmployees.length === 0) return null;

    // Tier priority: Director > Gerente General > Gerente
    const tierPriority = (position: string | null | undefined): number => {
      if (!position) return 0;
      const pos = position.toLowerCase();
      if (pos.includes("director")) return 3;
      if (pos.includes("gerente general")) return 2;
      if (pos.includes("gerente")) return 1;
      return 0;
    };

    const sorted = [...departmentEmployees].sort(
      (a, b) => tierPriority(b.position) - tierPriority(a.position)
    );

    // Only return manager if they have a management role
    return tierPriority(sorted[0]?.position) > 0 ? sorted[0] : null;
  }, [departmentEmployees]);

  // Team members (excluding manager)
  const teamMembers = useMemo(() => {
    if (!manager) return departmentEmployees.sort((a, b) => a.name.localeCompare(b.name, "es"));
    return departmentEmployees
      .filter((emp) => emp.id !== manager.id)
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [departmentEmployees, manager]);

  // Group team by company if they span multiple companies
  const teamByCompany = useMemo(() => {
    const companyIds = new Set(teamMembers.map((emp) => emp.company));
    if (companyIds.size <= 1) return null;

    const grouped: { company: Company; employees: Employee[] }[] = [];
    companyIds.forEach((companyId) => {
      const company = companies.find((c) => c.id === companyId);
      if (company) {
        grouped.push({
          company,
          employees: teamMembers.filter((emp) => emp.company === companyId),
        });
      }
    });
    return grouped.sort((a, b) => a.company.name.localeCompare(b.company.name, "es"));
  }, [teamMembers, companies]);

  // Get company for an employee
  const getCompany = (employee: Employee) =>
    companies.find((c) => c.id === employee.company) || companies[0];

  const handleEmployeeClick = (id: string) => {
    router.push(`/directorio/${id}`);
  };

  if (!department) return null;

  return (
    <AnimatePresence>
      {department && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ 
            duration: 0.28, 
            ease: [0.16, 1, 0.3, 1],
          }}
          className="fixed inset-0 z-[200] flex flex-col"
          style={{
            background: "#0C0E11",
          }}
        >
          {/* Header */}
          <header
            className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6"
            style={{
              height: "64px",
              background: "#0C0E11",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Back button */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 transition-colors"
              style={{ 
                color: "rgba(255,255,255,0.6)",
                fontSize: "var(--font-sm)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "white"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            {/* Department name */}
            <h1
              className="absolute left-1/2 -translate-x-1/2 font-neuropol uppercase truncate max-w-[50%]"
              style={{
                fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', monospace",
                fontSize: "var(--font-xl)",
                letterSpacing: "0.05em",
                color: "white",
              }}
            >
              {department}
            </h1>

            {/* Employee count */}
            <div
              className="flex items-center gap-1.5"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: "var(--font-xs)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{departmentEmployees.length} colaborador{departmentEmployees.length !== 1 ? "es" : ""}</span>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {departmentEmployees.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Users 
                  className="w-12 h-12"
                  style={{ color: "rgba(255,255,255,0.15)" }}
                />
                <p style={{ fontSize: "var(--font-base)", color: "rgba(255,255,255,0.30)" }}>
                  No hay colaboradores en este departamento
                </p>
              </div>
            ) : (
              <>
                {/* Manager Section */}
                {manager && (
                  <section
                    style={{
                      padding: "24px",
                      background: "rgba(255,255,255,0.015)",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* Label */}
                    <p
                      className="mb-3"
                      style={{
                        fontSize: "var(--font-xs)",
                        letterSpacing: "0.18em",
                        color: getCompanyConfig(manager.company).primary,
                        textTransform: "uppercase",
                      }}
                    >
                      RESPONSABLE DEL AREA
                    </p>

                    {/* Manager card - featured */}
                    <div className="max-w-[480px] mx-auto">
                      <EmployeeCard
                        employee={manager}
                        company={getCompany(manager)}
                        view="grid"
                        index={0}
                        hideCompanyBadge={false}
                      />
                    </div>
                  </section>
                )}

                {/* Divider */}
                {manager && teamMembers.length > 0 && (
                  <div 
                    className="relative flex items-center justify-center"
                    style={{ 
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      margin: "0 24px",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        fontSize: "var(--font-xs)",
                        letterSpacing: "0.15em",
                        color: "rgba(255,255,255,0.25)",
                        background: "#0C0E11",
                        padding: "0 16px",
                        textTransform: "uppercase",
                      }}
                    >
                      EQUIPO
                    </span>
                  </div>
                )}

                {/* Team Grid */}
                <section style={{ padding: "24px" }}>
                  {teamByCompany ? (
                    /* Grouped by company */
                    teamByCompany.map(({ company, employees: companyEmployees }) => {
                      const config = getCompanyConfig(company.id);
                      return (
                        <div key={company.id} className="mb-6 last:mb-0">
                          {/* Company header */}
                          <div
                            className="mb-2"
                            style={{
                              background: `${config.primary}1a`,
                              borderLeft: `3px solid ${config.primary}`,
                              padding: "8px 16px",
                            }}
                          >
                            <span
                              className="font-neuropol uppercase"
                              style={{
                                fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', monospace",
                                fontSize: "var(--font-xs)",
                                letterSpacing: "0.1em",
                                color: config.primary,
                              }}
                            >
                              {company.shortName || company.name}
                            </span>
                          </div>

                          {/* Grid */}
                          <div
                            className="grid gap-3"
                            style={{
                              gridTemplateColumns: "repeat(auto-fill, minmax(calc(260px * var(--font-scale, 1)), 1fr))",
                              gap: "calc(12px * var(--font-scale, 1))",
                            }}
                          >
                            {companyEmployees.map((emp, idx) => (
                              <EmployeeCard
                                key={emp.id}
                                employee={emp}
                                company={company}
                                view="grid"
                                index={idx}
                                hideCompanyBadge
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Single grid */
                    <div
                      className="grid gap-3"
                      style={{
                        gridTemplateColumns: "repeat(auto-fill, minmax(calc(260px * var(--font-scale, 1)), 1fr))",
                        gap: "calc(12px * var(--font-scale, 1))",
                      }}
                    >
                      {teamMembers.map((emp, idx) => (
                        <EmployeeCard
                          key={emp.id}
                          employee={emp}
                          company={getCompany(emp)}
                          view="grid"
                          index={idx}
                          hideCompanyBadge={false}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
