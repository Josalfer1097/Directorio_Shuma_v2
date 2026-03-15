"use client";

import { motion } from "framer-motion";
import type { MouseEvent } from "react";
import { ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Employee, Company } from "@/types";

interface FeaturedEmployeesProps {
  employees: Employee[];
  companies: Company[];
}

export function FeaturedEmployees({
  employees,
  companies,
}: FeaturedEmployeesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const currentEmployees = employees.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const getCompanyColor = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.color || "#7C3AED";
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.shortName || company?.name || companyId;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Equipo Directivo
          </h2>
          <p className="text-muted-foreground">
            Conoce a los líderes de Grupo Shuma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentIndex(Math.min(totalPages - 1, currentIndex + 1))
            }
            disabled={currentIndex >= totalPages - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentEmployees.map((employee, index) => {
          const companyColor = getCompanyColor(employee.company);
          return (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                {/* Top gradient line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: companyColor }}
                />

                <div className="flex flex-col items-center text-center">
                  <Link href={`/directorio/${employee.id}`}>
                    <Avatar className="w-20 h-20 mb-4 border-2 border-border group-hover:border-primary/50 transition-colors cursor-pointer">
                      <AvatarFallback
                        className="text-lg font-semibold"
                        style={{
                          backgroundColor: `${companyColor}20`,
                          color: companyColor,
                        }}
                      >
                        {getInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <Link href={`/directorio/${employee.id}`} className="hover:text-primary transition-colors">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {employee.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {employee.position}
                  </p>

                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full mb-4"
                    style={{
                      backgroundColor: `${companyColor}15`,
                      color: companyColor,
                    }}
                  >
                    {getCompanyName(employee.company)}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      window.location.href = `mailto:${employee.email}`;
                    }}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      window.location.href = `tel:${employee.phone}`;
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex
                  ? "w-6 bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
