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
import { getCompanyConfig } from "@/lib/companyConfig";
import { getEmployees } from "@/lib/data";
import { useMemo } from "react";

// Spring animation for filter panel
const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

interface DirectoryFiltersProps {
  companies: Company[];
  departments: string[];
  locations: string[];
  selectedCompanies: string[];
  selectedDepartment: string;
  selectedLocations: string[];
  onCompanyChange: (companies: string[]) => void;
  onDepartmentChange: (department: string) => void;
  onLocationChange: (locations: string[]) => void;
  onClearFilters: () => void;
  filteredEmployees: Employee[];
}

export function DirectoryFilters({
  companies,
  departments,
  locations,
  selectedCompanies,
  selectedDepartment,
  selectedLocations,
  onCompanyChange,
  onDepartmentChange,
  onLocationChange,
  onClearFilters,
  filteredEmployees,
}: DirectoryFiltersProps) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const allEmployees = getEmployees();

  // Calculate counts for each filter option
  const filterCounts = useMemo(() => {
    const companyCounts: Record<string, number> = {};
    const deptCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};

    allEmployees.forEach(emp => {
      companyCounts[emp.company] = (companyCounts[emp.company] || 0) + 1;
      if (emp.department) {
        deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
      }
      if (emp.location) {
        locationCounts[emp.location] = (locationCounts[emp.location] || 0) + 1;
      }
    });

    return { companyCounts, deptCounts, locationCounts };
  }, [allEmployees]);
  
  const hasActiveFilters =
    selectedCompanies.length > 0 ||
    selectedDepartment !== "all" ||
    selectedLocations.length > 0;

  const activeFilterCount =
    selectedCompanies.length +
    (selectedDepartment !== "all" ? 1 : 0) +
    selectedLocations.length;

  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      onLocationChange(selectedLocations.filter((l) => l !== location));
    } else {
      onLocationChange([...selectedLocations, location]);
    }
  };

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
      "Sucursal",
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
        emp.location || "Sin sucursal",
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
            const companyConf = getCompanyConfig(company.id);
            const companyColor = companyConf.primary;
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
                    backgroundColor: isChecked ? companyColor : undefined,
                  }}
                />
                <div className="flex items-center gap-2">
                  {/* Two-tone dot for Ferrecapital (industrial feel), solid dot for others */}
                  {companyConf.accent ? (
                    <div 
                      className="w-3 h-3 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: companyColor,
                        border: `1.5px solid ${companyColor}`,
                      }}
                    >
                      <div 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: companyConf.accent }}
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
                    <span className="ml-1 text-xs text-white/30">[{filterCounts.companyCounts[company.id] || 0}]</span>
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
                {dept} [{filterCounts.deptCounts[dept] || 0}]
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Locations */}
      {locations.length > 0 && (
        <div>
          <h4 className="font-medium text-foreground mb-3" style={{ fontFamily: "'Neuropol', sans-serif" }}>Sucursal</h4>
          <div className="space-y-2">
            {locations.map((location) => {
              const isChecked = selectedLocations.includes(location);
              return (
                <label
                  key={location}
                  className="flex items-center gap-3 cursor-pointer group"
                  style={{ fontFamily: "'Neuropol', sans-serif" }}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleLocation(location)}
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors" style={{ fontFamily: "'Neuropol', sans-serif" }}>
                    {location}
                    <span className="ml-1 text-xs text-white/30">[{filterCounts.locationCounts[location] || 0}]</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

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
