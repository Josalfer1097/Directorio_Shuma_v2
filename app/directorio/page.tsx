"use client";

import { useState, useMemo, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { Search, LayoutGrid, List, Users, X } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { EmployeeCard } from "@/components/employee-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getEmployees,
  getCompanies,
  getDepartments,
  getCompanyById,
  getEmployeesByCompany,
} from "@/lib/data";
import type { ViewMode, Employee, Company } from "@/types";
import { cn } from "@/lib/utils";

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
  const [selectedCompany, setSelectedCompany] = useState<string>(
    initialCompany || "all"
  );
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);

  const employees = getEmployees();
  const companies = getCompanies();
  const departments = getDepartments();

  const tabsRef = useRef<HTMLDivElement>(null);

  // Get the active company's primary color
  const activeCompany = companies.find((c) => c.id === selectedCompany);
  const activeColor = activeCompany?.colors?.primary || "#C9A84C";

  // Fuse.js setup for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(employees, {
        keys: ["name", "position", "department", "email"],
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
    if (selectedCompany !== "all") {
      results = results.filter((emp) => emp.company === selectedCompany);
    }

    // Apply department filter
    if (selectedDepartment !== "all") {
      results = results.filter((emp) => emp.department === selectedDepartment);
    }

    return results;
  }, [employees, searchQuery, selectedCompany, selectedDepartment, fuse]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCompany, selectedDepartment]);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (tabsRef.current && selectedCompany !== "all") {
      const activeTab = tabsRef.current.querySelector(
        `[data-company="${selectedCompany}"]`
      );
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedCompany]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCompany("all");
    setSelectedDepartment("all");
  };

  // Get employee count per company
  const getCompanyCount = (companyId: string) => {
    if (companyId === "all") return employees.length;
    return getEmployeesByCompany(companyId).length;
  };

  return (
    <div className="min-h-screen bg-[--bg-base] relative">
      {/* Background effects */}
      <div className="dot-grid" />
      <div className="noise-overlay" />

      {/* Ambient glow blobs - color changes based on active company */}
      <div
        className="ambient-glow ambient-glow-top"
        style={{ background: activeColor }}
      />
      <div
        className="ambient-glow ambient-glow-bottom"
        style={{ background: activeColor }}
      />

      <Navbar />

      <main className="pt-16 md:pt-20 pb-24 md:pb-16 relative z-10 bottom-tab-safe">
        {/* Header */}
        <header className="header-sticky">
          <div className="container mx-auto h-full px-4 flex items-center justify-between">
            {/* Wordmark */}
            <h1 className="font-display text-lg md:text-xl tracking-wider">
              <span className="text-[--text-primary]">DIRECTO</span>
              <span style={{ color: activeColor }}>RIO</span>
            </h1>

            {/* Search - desktop inline, mobile expandable */}
            <div className="flex items-center gap-2">
              {/* Desktop search */}
              <div className="hidden md:block relative w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-faint]" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent border-0 border-b border-[--border-subtle] rounded-none focus:border-[--gold] transition-colors"
                />
              </div>

              {/* Mobile search toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden tap-target"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                {searchOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </Button>

              {/* View toggle */}
              <div className="hidden sm:flex items-center gap-1 ml-2">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="tap-target"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="tap-target"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile search overlay */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 p-4 bg-[--bg-base] border-b border-[--border-subtle] md:hidden"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-faint]" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, puesto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Empresa Tabs */}
        <div className="border-b border-[--border-subtle]">
          <div
            ref={tabsRef}
            className="empresa-tabs container mx-auto px-4"
          >
            {/* TODOS tab */}
            <button
              data-company="all"
              onClick={() => setSelectedCompany("all")}
              className={cn(
                "empresa-tab relative",
                selectedCompany === "all" && "active"
              )}
              style={
                {
                  "--tab-color": "#C9A84C",
                } as React.CSSProperties
              }
            >
              TODOS
              <span className="ml-2 text-[10px] opacity-60">
                {getCompanyCount("all")}
              </span>
              {selectedCompany === "all" && (
                <motion.div
                  layoutId="tab-indicator"
                  className="empresa-tab-indicator"
                  style={{ background: "#C9A84C" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>

            {companies.map((company) => (
              <button
                key={company.id}
                data-company={company.id}
                onClick={() => setSelectedCompany(company.id)}
                className={cn(
                  "empresa-tab relative",
                  selectedCompany === company.id && "active"
                )}
                style={
                  {
                    "--tab-color": company.colors?.primary,
                  } as React.CSSProperties
                }
              >
                {company.shortName || company.name}
                <span className="ml-2 text-[10px] opacity-60">
                  {getCompanyCount(company.id)}
                </span>
                {selectedCompany === company.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="empresa-tab-indicator"
                    style={{ background: company.colors?.primary }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="py-4 border-b border-[--border-subtle]">
          <div className="container mx-auto px-4">
            <div className="department-pills">
              {/* TODOS pill */}
              <button
                onClick={() => setSelectedDepartment("all")}
                className={cn(
                  "department-pill",
                  selectedDepartment === "all" && "active"
                )}
                style={
                  {
                    "--pill-color": activeColor,
                  } as React.CSSProperties
                }
              >
                Todos
              </button>

              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={cn(
                    "department-pill",
                    selectedDepartment === dept && "active"
                  )}
                  style={
                    {
                      "--pill-color": activeColor,
                    } as React.CSSProperties
                  }
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pt-6">
          {/* Results count */}
          <p className="text-sm text-[--text-muted] mb-4 font-display text-display-xs">
            {filteredEmployees.length} EMPLEADOS
          </p>

          {/* Employee Grid/List */}
          <AnimatePresence mode="wait">
            {paginatedEmployees.length > 0 ? (
              <motion.div
                key={`${selectedCompany}-${selectedDepartment}-${currentPage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "flex flex-col gap-3"
                }
                style={{
                  gridTemplateColumns:
                    viewMode === "grid"
                      ? "repeat(auto-fill, minmax(300px, 1fr))"
                      : undefined,
                }}
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
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-state"
              >
                <div className="w-16 h-16 rounded-full bg-[--bg-elevated] flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[--text-faint]" />
                </div>
                <h3 className="text-display-md text-[--text-primary] mb-2">
                  No se encontraron empleados
                </h3>
                <p className="text-sm text-[--text-muted] mb-4">
                  Intenta ajustar los filtros o la busqueda
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="press-scale"
                >
                  Limpiar filtros
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="press-scale"
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
                        className="w-10 press-scale"
                      >
                        {page}
                      </Button>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="text-[--text-faint] px-2">
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
                className="press-scale"
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DirectoryLoading() {
  return (
    <div className="min-h-screen bg-[--bg-base]">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl skeleton" />
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
