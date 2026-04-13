"use client";

import { X, Filter, Download, Star, ChevronRight, Layers } from "lucide-react";
import { useFavorites } from "@/lib/useFavorites";
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



interface DirectoryFiltersProps {
  companies: Company[];
  departments: string[];
  locations: string[];
  selectedCompanies: string[];
  selectedDepartment: string;
  selectedLocations: string[];
  showFavoritesOnly: boolean;
  onCompanyChange: (companies: string[]) => void;
  onDepartmentChange: (department: string) => void;
  onLocationChange: (locations: string[]) => void;
  onFavoritesToggle: (show: boolean) => void;
  onDeptViewOpen: (department: string) => void;
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
  showFavoritesOnly,
  onCompanyChange,
  onDepartmentChange,
  onLocationChange,
  onFavoritesToggle,
  onDeptViewOpen,
  onClearFilters,
  filteredEmployees,
}: DirectoryFiltersProps) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const allEmployees = getEmployees();
  const { favorites, clearAllFavorites } = useFavorites();

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
      {/* Favorites Section - Only show if there are favorites */}
      {favorites.length > 0 && (
        <div>
          <button
            onClick={() => onFavoritesToggle(!showFavoritesOnly)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg transition-all duration-[180ms]"
            style={{
              background: showFavoritesOnly ? 'rgba(245,196,0,0.12)' : 'rgba(255,255,255,0.03)',
              border: showFavoritesOnly ? '1px solid rgba(245,196,0,0.30)' : '1px solid rgba(255,255,255,0.08)',
              color: showFavoritesOnly ? '#F5C400' : 'rgba(255,255,255,0.7)',
            }}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-[#F5C400]' : ''}`} />
              Mis Contactos
              <span 
                className="px-1.5 py-0.5 text-xs rounded"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {favorites.length}
              </span>
            </span>
          </button>
          {showFavoritesOnly && (
            <button
              onClick={() => {
                clearAllFavorites();
                onFavoritesToggle(false);
              }}
              className="mt-2 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Limpiar todos
            </button>
          )}
        </div>
      )}

      {/* Companies */}
      <div>
        <h4 className="font-medium text-foreground mb-3" style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}>Empresas</h4>
        <div className="space-y-2">
          {companies.filter(c => !c.disabled).map((company) => {
            const companyConf = getCompanyConfig(company.id);
            const companyColor = companyConf.primary;
            const isChecked = selectedCompanies.includes(company.id);
            return (
              <label
                key={company.id}
                className="flex items-center gap-3 cursor-pointer group"
                style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}
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
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors" style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}>
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
        <h4 className="font-medium text-foreground mb-3" style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}>Departamento</h4>
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}>
            <SelectValue placeholder="Todos los departamentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}>Todos los departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept} style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}>
                {dept} [{filterCounts.deptCounts[dept] || 0}]
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Department View Link - only when a specific department is selected */}
        {selectedDepartment !== "all" && (
          <button
            onClick={() => onDeptViewOpen(selectedDepartment)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer group text-scale-xs"
            style={{
              color: "#00C9A7",
              background: "rgba(0,201,167,0.06)",
              border: "1px solid rgba(0,201,167,0.20)",
              borderRadius: "8px",
              padding: "6px 12px",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,201,167,0.12)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,201,167,0.06)"}
          >
            <Layers className="w-3 h-3" />
            <span>Ver vista de {selectedDepartment}</span>
            <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}

        {/* Department Quick List with visible Ver buttons */}
        <div className="mt-4 space-y-1.5">
          {departments.slice(0, 8).map((dept) => (
            <div 
              key={dept}
              className="flex items-center gap-2"
              style={{ minHeight: "40px" }}
            >
              <label 
                className="flex items-center gap-2 cursor-pointer flex-1 py-1"
              >
                <Checkbox
                  checked={selectedDepartment === dept}
                  onCheckedChange={() => onDepartmentChange(selectedDepartment === dept ? "all" : dept)}
                />
                <span 
                  className="text-white/60 hover:text-white/80 truncate transition-colors text-scale-xs"
                  style={{ maxWidth: "120px" }}
                >
                  {dept}
                </span>
              </label>
              <button
                onClick={() => onDeptViewOpen(dept)}
                className="flex items-center gap-1 transition-all shrink-0 text-scale-xs"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  padding: "3px 8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#00C9A7";
                  e.currentTarget.style.borderColor = "rgba(0,201,167,0.35)";
                  e.currentTarget.style.background = "rgba(0,201,167,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                title={`Ver departamento ${dept}`}
              >
                <span>Ver</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Locations */}
      {locations.length > 0 && (
        <div>
          <h4 className="font-medium text-foreground mb-3" style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}>Sucursal</h4>
          <div className="space-y-2">
            {locations.map((location) => {
              const isChecked = selectedLocations.includes(location);
              return (
                <label
                  key={location}
                  className="flex items-center gap-3 cursor-pointer group"
                  style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleLocation(location)}
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors" style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}>
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
        locations={locations}
        selectedCompanies={selectedCompanies}
        selectedDepartment={selectedDepartment}
        selectedLocations={selectedLocations}
        onCompanyChange={onCompanyChange}
        onDepartmentChange={onDepartmentChange}
        onLocationChange={onLocationChange}
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
