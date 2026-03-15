"use client";

import { X, Filter, Download } from "lucide-react";
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
import type { Company, Employee } from "@/types";

interface DirectoryFiltersProps {
  companies: Company[];
  departments: string[];
  tags: string[];
  selectedCompanies: string[];
  selectedDepartment: string;
  selectedTags: string[];
  onCompanyChange: (companies: string[]) => void;
  onDepartmentChange: (department: string) => void;
  onTagChange: (tags: string[]) => void;
  onClearFilters: () => void;
  filteredEmployees: Employee[];
}

export function DirectoryFilters({
  companies,
  departments,
  tags,
  selectedCompanies,
  selectedDepartment,
  selectedTags,
  onCompanyChange,
  onDepartmentChange,
  onTagChange,
  onClearFilters,
  filteredEmployees,
}: DirectoryFiltersProps) {
  const hasActiveFilters =
    selectedCompanies.length > 0 ||
    selectedDepartment !== "all" ||
    selectedTags.length > 0;

  const toggleCompany = (companyId: string) => {
    if (selectedCompanies.includes(companyId)) {
      onCompanyChange(selectedCompanies.filter((c) => c !== companyId));
    } else {
      onCompanyChange([...selectedCompanies, companyId]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagChange([...selectedTags, tag]);
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
      "Extensión",
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
        emp.extension,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `directorio_shuma_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Companies */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Empresas</h4>
        <div className="space-y-2">
          {companies.map((company) => (
            <label
              key={company.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={selectedCompanies.includes(company.id)}
                onCheckedChange={() => toggleCompany(company.id)}
              />
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: company.color }}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {company.shortName || company.name}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Departments */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Departamento</h4>
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todos los departamentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Etiquetas</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Clear and Export */}
      <div className="flex flex-col gap-2 pt-4 border-t border-border">
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
        <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Filtros</h3>
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

      {/* Mobile Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden gap-2">
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {selectedCompanies.length +
                  (selectedDepartment !== "all" ? 1 : 0) +
                  selectedTags.length}
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
