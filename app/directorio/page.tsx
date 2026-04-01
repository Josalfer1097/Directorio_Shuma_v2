"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import { Search, LayoutGrid, List, Users } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { EmployeeCard } from "@/components/employee-card";
import { DirectoryFilters } from "@/components/directory-filters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getEmployees,
  getCompanies,
  getDepartments,
  getCompanyById,
} from "@/lib/data";
import type { ViewMode, Employee } from "@/types";

const ITEMS_PER_PAGE = 12;

// Premium easing curve
const premiumEase = [0.25, 0.46, 0.45, 0.94];

function DirectoryContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCompany = searchParams.get("empresa") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(
    initialCompany ? [initialCompany] : []
  );
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const employees = getEmployees();
  const companies = getCompanies();
  const departments = getDepartments();

  // Fuse.js setup for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(employees, {
        keys: ["name", "position", "department", "email", "tags"],
        threshold: 0.3,
        includeScore: true,
      }),
    [employees]
  );

  // Filter employees
  const filteredEmployees = useMemo(() => {
    let results: Employee[] = employees;

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      results = searchResults.map((result) => result.item);
    }

    // Apply company filter
    if (selectedCompanies.length > 0) {
      results = results.filter((emp) =>
        selectedCompanies.includes(emp.company)
      );
    }

    // Apply department filter
    if (selectedDepartment !== "all") {
      results = results.filter((emp) => emp.department === selectedDepartment);
    }

    return results;
  }, [
    employees,
    searchQuery,
    selectedCompanies,
    selectedDepartment,
    fuse,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCompanies, selectedDepartment]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCompanies([]);
    setSelectedDepartment("all");
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Premium background effects */}
      <div className="depth-gradient" />
      <div className="grid-pattern" />
      <div className="noise-overlay" />
      
      <Navbar />

      <main className="md:pt-24 pt-20 pb-24 md:pb-16 px-4 relative z-10 bottom-tab-safe">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: premiumEase }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Directorio de Empleados
            </h1>
            <p className="text-muted-foreground">
              Encuentra y contacta a los colaboradores de Shuma
            </p>
          </motion.div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <DirectoryFilters
              companies={companies}
              departments={departments}
              selectedCompanies={selectedCompanies}
              selectedDepartment={selectedDepartment}
              onCompanyChange={setSelectedCompanies}
              onDepartmentChange={setSelectedDepartment}
              onClearFilters={clearFilters}
              filteredEmployees={filteredEmployees}
            />

          {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Search and View Toggle */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, puesto, departamento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Results count */}
              <p className="text-sm text-muted-foreground mb-4">
                Mostrando {paginatedEmployees.length} de{" "}
                {filteredEmployees.length} empleados
              </p>

              {/* Employee Grid/List - Responsive columns */}
              {paginatedEmployees.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4"
                      : "flex flex-col gap-3"
                  }
                >
                  {paginatedEmployees.map((employee, index) => {
                    const company = getCompanyById(employee.company);
                    if (!company) return null;
                    return (
                      <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        company={company}
                        view={viewMode}
                        index={index}
                      />
                    );
                  })}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No se encontraron empleados
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Intenta ajustar los filtros o la búsqueda
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </motion.div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      // Show first, last, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "secondary" : "ghost"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        );
                      }
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span
                            key={page}
                            className="text-muted-foreground px-2"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DirectoryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<DirectoryLoading />}>
      <DirectoryContent />
    </Suspense>
  );
}
