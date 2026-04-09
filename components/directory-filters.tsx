"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileFiltersBottomSheet } from "./mobile-filters-bottom-sheet";
import type { Company, Employee } from "@/types";

// Company config for consistent colors
const companyConfigMap: Record<string, { primary: string; accent?: string }> = {
  comercializadora: { primary: '#0047AB' },
  acabados: { primary: '#C0152A' },
  ferrecapital: { primary: '#2C3338', accent: '#CC0000' },
  arkiramica: { primary: '#F5C400' },
};

// Spring animation for filter panel
const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

interface DirectoryFiltersProps {
  companies: Company[];
  departments: string[];
  selectedCompanies: string[];
  selectedDepartment: string;
  onCompanyChange: (companies: string[]) => void;
  onDepartmentChange: (department: string) => void;
  onClearFilters: () => void;
  filteredEmployees: Employee[];
}

export function DirectoryFilters({
  companies,
  departments,
  selectedCompanies,
  selectedDepartment,
  onCompanyChange,
  onDepartmentChange,
  onClearFilters,
  filteredEmployees,
}: DirectoryFiltersProps) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  
  const hasActiveFilters =
    selectedCompanies.length > 0 ||
    selectedDepartment !== "all";

  const activeFilterCount =
    selectedCompanies.length +
    (selectedDepartment !== "all" ? 1 : 0);

  const toggleCompany = (companyId: string) => {
    if (selectedCompanies.includes(companyId)) {
      onCompanyChange(selectedCompanies.filter((c) => c !== companyId));
    } else {
      onCompanyChange([...selectedCompanies, companyId]);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Nombre",
      "Puesto",
      "Departamento",
      "Empresa",
      "Email",
      "Teléfono",
    ];
    const rows = filteredEmployees.map((emp) => {
      const company = companies.find((c) => c.id === emp.company);
      return [
        emp.name,
        emp.position,
        emp.department,
        company?.name || emp.company,
        emp.email,
        emp.phone,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Add UTF-8 BOM for Excel compatibility with special characters
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `directorio_shuma_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Companies */}
      <div>
        <h4 className="font-medium text-foreground mb-3" style={{ fontFamily: "'Neuropol', sans-serif" }}>Empresas</h4>
        <div className="space-y-2">
          {companies.filter(c => !c.disabled).map((company) => {
            const companyColor = companyConfigMap[company.id]?.primary || company.colors.primary;
            const isChecked = selectedCompanies.includes(company.id);
            return (
              <label
                key={company.id}
                className="flex items-center gap-3 cursor-pointer group"
                style={{ fontFamily: "'Neuropol', sans-serif" }}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleCompany(company.id)}
                  style={{
                    borderColor: isChecked ? companyColor : undefined,
                    backgroundColor: isChecked ? (companyConfigMap[company.id]?.accent ? companyColor : companyColor) : undefined,
                  }}
                />
                <div className="flex items-center gap-2">
                  {/* Two-tone dot for Ferrecapital (industrial feel), solid dot for others */}
                  {companyConfigMap[company.id]?.accent ? (
                    <div 
                      className="w-3 h-3 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: companyColor,
                        border: `1.5px solid ${companyColor}`,
                      }}
                    >
                      <div 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: companyConfigMap[company.id].accent }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: companyColor }}
                    />
                  )}
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors" style={{ fontFamily: "'Neuropol', sans-serif" }}>
                    {company.shortName || company.name}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Departments */}
      <div>
        <h4 className="font-medium text-foreground mb-3" style={{ fontFamily: "'Neuropol', sans-serif" }}>Departamento</h4>
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger style={{ fontFamily: "'Neuropol', sans-serif" }}>
            <SelectValue placeholder="Todos los departamentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" style={{ fontFamily: "'Neuropol', sans-serif" }}>Todos los departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept} style={{ fontFamily: "'Neuropol', sans-serif" }}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear and Export */}
      <div className="flex flex-col gap-2 pt-4 border-t border-[--border-subtle]">
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Limpiar filtros
          </Button>
        )}
        <Button variant="outline" onClick={exportToCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV ({filteredEmployees.length})
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 rounded-xl border border-[--border-subtle] bg-[--bg-surface] p-6">
          <div className="flex items-center justify-between mb-6 font-neuropol">
            <h3 className="font-semibold text-foreground font-neuropol">Filtros</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-auto p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filters Button */}
      <Button
        onClick={() => setMobileSheetOpen(true)}
        variant="outline"
        className="lg:hidden gap-2 touch-target"
      >
        <Filter className="w-4 h-4" />
        Filtros
        {activeFilterCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center text-xs font-semibold">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* Mobile Filters Bottom Sheet */}
      <MobileFiltersBottomSheet
        isOpen={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        companies={companies.filter(c => !c.disabled)}
        departments={departments}
        selectedCompanies={selectedCompanies}
        selectedDepartment={selectedDepartment}
        onCompanyChange={onCompanyChange}
        onDepartmentChange={onDepartmentChange}
        onClearFilters={onClearFilters}
        onApply={() => {}}
      />

      {/* Desktop Sheet (legacy - kept for non-mobile) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="hidden lg:hidden gap-2">
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
