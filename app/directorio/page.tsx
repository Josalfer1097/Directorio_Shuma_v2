"use client";

import { useState, useMemo, useEffect, Suspense, useRef, useCallback, useDeferredValue } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import { Search, LayoutGrid, List, Users, Filter, Phone } from "lucide-react";
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
import { MobileFiltersBottomSheet } from "@/components/mobile-filters-bottom-sheet";
import { ExtensionDirectory } from "@/components/extension-directory";
import { FilterChips } from "@/components/filter-chips";
import { AgendaView } from "@/components/agenda-view";
import dynamic from "next/dynamic";
import type { ViewMode, Employee } from "@/types";
import { useFavorites } from "@/lib/useFavorites";
import { useCompanyTheme, ActiveTheme } from "@/lib/CompanyThemeContext";
import { safeGetItem, safeSetItem } from "@/lib/localStorage";

const DepartmentView = dynamic(
  () => import("@/components/department-view").then(mod => mod.DepartmentView),
  { ssr: false }
);

const ITEMS_PER_PAGE = 12;

// Premium easing curve
const premiumEase = [0.25, 0.46, 0.45, 0.94];

function DirectoryContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCompany = searchParams.get("empresa") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      // On mobile, default to agenda view
      if (window.innerWidth < 768) {
        return "agenda";
      }
      const saved = safeGetItem("directorio-viewMode");
      if (saved === "grid" || saved === "list" || saved === "extensions" || saved === "agenda") {
        return saved as ViewMode;
      }
    }
    return "grid";
  });

  // Detect viewport changes and auto-switch views
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-switch to agenda on mobile, or to grid on desktop if currently on agenda
      setViewMode((prev) => {
        if (mobile && prev !== "agenda" && prev !== "extensions") {
          return "agenda";
        }
        if (!mobile && prev === "agenda") {
          const saved = safeGetItem("directorio-viewMode");
          if (saved === "grid" || saved === "list") {
            return saved as ViewMode;
          }
          return "grid";
        }
        return prev;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Persist viewMode to localStorage (only desktop views)
  useEffect(() => {
    if (!isMobile && viewMode !== "agenda") {
      safeSetItem("directorio-viewMode", viewMode);
    }
  }, [viewMode, isMobile]);

  // Listen for view mode changes from navbar
  useEffect(() => {
    const handleViewModeChange = (e: CustomEvent<ViewMode>) => {
      setViewMode(e.detail);
    };
    window.addEventListener("view-mode-change", handleViewModeChange as EventListener);
    return () => window.removeEventListener("view-mode-change", handleViewModeChange as EventListener);
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(
      initialCompany ? [initialCompany] : []
  );
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [deptView, setDeptView] = useState<string | null>(null);
  const [showCardAnimation, setShowCardAnimation] = useState(true);
  const hasAnimated = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { favorites } = useFavorites();
  const { setActiveTheme } = useCompanyTheme();

  // Company theme immersion - single company filter triggers theme change
  useEffect(() => {
    if (selectedCompanies.length === 1) {
      const companyId = selectedCompanies[0];
      // Map company IDs to theme names
      const themeMap: Record<string, ActiveTheme> = {
        'comercializadora': 'comercializadora',
        'acabados': 'acabados',
        'ferrecapital': 'ferrecapital',
        'arkiramica': 'arkiramica',
      };
      setActiveTheme(themeMap[companyId] || 'default');
    } else {
      setActiveTheme('default');
    }
  }, [selectedCompanies, setActiveTheme]);

  const employees = getEmployees();
  const companies = getCompanies();
  const departments = getDepartments();

  // First load animation - only on initial mount
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (employees.length > 0 && !hasAnimated.current) {
      hasAnimated.current = true;
      setShowCardAnimation(true);
      // After cards animate, disable for subsequent renders
      timer = setTimeout(() => setShowCardAnimation(false), 1200);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [employees.length]);

  // Cmd+K / Ctrl+K keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setMobileFiltersOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Get available locations from employees
  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    employees.forEach(emp => {
      if (emp.location) locations.add(emp.location);
    });
    return Array.from(locations).sort();
  }, [employees]);

  // Fuse.js setup for fuzzy search
  const fuse = useMemo(
      () =>
          new Fuse(employees, {
            keys: ["name", "position", "department", "email", "extension", "phone"],
            threshold: 0.3,
            includeScore: true,
          }),
      [employees]
  );

  // Filter employees using deferred search for performance
  const filteredEmployees = useMemo(() => {
    let results: Employee[] = employees;

    if (deferredSearchQuery.trim()) {
      const searchResults = fuse.search(deferredSearchQuery);
      results = searchResults.map((result) => result.item);
    }

    if (selectedCompanies.length > 0) {
      results = results.filter((emp) =>
          selectedCompanies.includes(emp.company)
      );
    }

    if (selectedDepartment !== "all") {
      results = results.filter((emp) => emp.department === selectedDepartment);
    }

    if (selectedLocations.length > 0) {
      results = results.filter((emp) => emp.location && selectedLocations.includes(emp.location));
    }

    // Filter by favorites if enabled
    if (showFavoritesOnly) {
      results = results.filter((emp) => favorites.includes(emp.id));
    }

    if (!deferredSearchQuery.trim()) {
      results = [...results].sort((a, b) => a.name.localeCompare(b.name, "es"));
    }

    return results;
  }, [employees, deferredSearchQuery, selectedCompanies, selectedDepartment, selectedLocations, fuse, showFavoritesOnly, favorites]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCompanies, selectedDepartment, selectedLocations, selectedTags]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCompanies([]);
    setSelectedDepartment("all");
    setSelectedLocations([]);
    setSelectedTags([]);
    setShowFavoritesOnly(false);
  }, []);

  return (
      <div className="min-h-screen bg-background relative page-transition">
        <div className="geometric-pattern" />

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
                Encuentra y contacta a los colaboradores de Grupo Shuma
              </p>
            </motion.div>

            <div className="flex gap-8">
              {/* Filters Sidebar - Desktop only */}
              <aside className="hidden lg:block w-72 shrink-0">
                <DirectoryFilters
                    companies={companies}
                    departments={departments}
                    locations={availableLocations}
                    selectedCompanies={selectedCompanies}
                    selectedDepartment={selectedDepartment}
                    selectedLocations={selectedLocations}
                    showFavoritesOnly={showFavoritesOnly}
                    onCompanyChange={setSelectedCompanies}
                    onDepartmentChange={setSelectedDepartment}
                    onLocationChange={setSelectedLocations}
                    onFavoritesToggle={setShowFavoritesOnly}
                    onDeptViewOpen={setDeptView}
                    onClearFilters={clearFilters}
                    filteredEmployees={filteredEmployees}
                />
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Search Bar - Sticky on mobile */}
                <div className="sticky top-[64px] z-30 bg-background/95 backdrop-blur-sm pb-4 -mx-4 px-4 lg:static lg:bg-transparent lg:backdrop-blur-none lg:pb-0 lg:mx-0 lg:px-0">
                  <div className="flex flex-col sm:flex-row gap-4 mb-4 lg:mb-6">
                    <div className="relative flex-1" role="search">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <label htmlFor="employee-search" className="sr-only">Buscar empleados</label>
                      <Input
                          ref={searchInputRef}
                          id="employee-search"
                          type="search"
                          placeholder="Buscar por nombre, puesto, extensión... (Cmd+K)"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-full"
                          aria-describedby="search-description"
                          style={{ fontSize: '16px' }} // 16px minimum prevents iOS Safari auto-zoom on focus
                      />
                      <span id="search-description" className="sr-only">
                        Escribe para buscar empleados por nombre, puesto, departamento o extensión
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <Button
                          variant={viewMode === "grid" ? "secondary" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("grid")}
                          aria-label="Vista de tarjetas"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                      <Button
                          variant={viewMode === "list" ? "secondary" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("list")}
                          aria-label="Vista de lista"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                          variant={viewMode === "extensions" ? "secondary" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("extensions")}
                          aria-label="Vista de extensiones"
                          title="Directorio Rapido"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Active Filter Chips */}
                <FilterChips
                  selectedCompanies={selectedCompanies}
                  selectedDepartment={selectedDepartment}
                  selectedLocations={selectedLocations}
                  companies={companies}
                  onRemoveCompany={(companyId) =>
                    setSelectedCompanies((prev) =>
                      prev.filter((id) => id !== companyId)
                    )
                  }
                  onRemoveDepartment={() => setSelectedDepartment("all")}
                  onRemoveLocation={(location) =>
                    setSelectedLocations((prev) =>
                      prev.filter((loc) => loc !== location)
                    )
                  }
                  onClearAll={clearFilters}
                />

                {/* Extensions View - Full width table */}
                {viewMode === "extensions" ? (
                  <ExtensionDirectory
                    selectedCompanies={selectedCompanies}
                    selectedDepartment={selectedDepartment}
                    selectedLocations={selectedLocations}
                    searchQuery={searchQuery}
                  />
                ) : viewMode === "agenda" ? (
                  <>
                    {/* Results count for agenda view */}
                    <p className="text-sm text-muted-foreground mb-4" role="status" aria-live="polite" aria-atomic="true">
                      Mostrando {filteredEmployees.length} empleados
                    </p>
                    <AgendaView
                      employees={filteredEmployees}
                      companies={companies}
                      selectedCompanies={selectedCompanies}
                    />
                  </>
                ) : (
                  <>
                    {/* Results count - with live region for screen readers */}
                    <p className="text-sm text-muted-foreground mb-4" role="status" aria-live="polite" aria-atomic="true">
                      Mostrando {paginatedEmployees.length} de{" "}
                      {filteredEmployees.length} empleados
                    </p>

                    {/* Employee Grid/List - Single column on mobile */}
                    {paginatedEmployees.length > 0 ? (
                    <div
                        className={
                          viewMode === "grid"
                              ? "flex flex-col gap-4"
                              : "flex flex-col gap-3"
                        }
                        style={viewMode === "grid" ? {
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(calc(280px * var(--font-scale, 1)), 1fr))',
                          gap: 'calc(16px * var(--font-scale, 1))',
                        } : undefined}
                    >
                      {paginatedEmployees.map((employee, index) => {
                        const company = getCompanyById(employee.company);
                        if (!company) return null;
                        const hideCompanyBadge =
                            selectedCompanies.length === 1 &&
                            selectedCompanies.includes(employee.company);
                        return (
                            <EmployeeCard
                                key={employee.id}
                                employee={employee}
                                company={company}
                                view={viewMode as "grid" | "list"}
                                index={showCardAnimation ? index : -1}
                                hideCompanyBadge={hideCompanyBadge}
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
                          if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "secondary" : "ghost"}
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
                                <span key={page} className="text-muted-foreground px-2">
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
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Floating Filter Button */}
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 30 }}
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-6 py-3 rounded-full bg-[--bg-surface]/95 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20"
        >
          <Filter className="w-4 h-4 text-text-primary" />
          <span className="font-neuropol text-xs uppercase tracking-wider text-text-primary">Filtros</span>
          {(selectedCompanies.length > 0 || selectedDepartment !== "all" || selectedLocations.length > 0) && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
              {selectedCompanies.length + (selectedDepartment !== "all" ? 1 : 0) + selectedLocations.length}
            </span>
          )}
        </motion.button>

        {/* Mobile Filters Bottom Sheet */}
        <MobileFiltersBottomSheet
          isOpen={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          companies={companies.filter(c => !c.disabled)}
          departments={departments}
          locations={availableLocations}
          selectedCompanies={selectedCompanies}
          selectedDepartment={selectedDepartment}
          selectedLocations={selectedLocations}
          onCompanyChange={setSelectedCompanies}
          onDepartmentChange={setSelectedDepartment}
          onLocationChange={setSelectedLocations}
          onClearFilters={clearFilters}
          onApply={() => setMobileFiltersOpen(false)}
        />
        {/* Department View Panel */}
        <DepartmentView 
          department={deptView} 
          onClose={() => setDeptView(null)} 
        />
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
