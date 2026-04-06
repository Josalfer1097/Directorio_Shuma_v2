"use client";

import { useState, useMemo, useEffect, Suspense, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { Search, LayoutGrid, List, Users, X, Command } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { EmployeeCard } from "@/components/employee-card";
import { CompactEmployeeRow } from "@/components/compact-employee-row";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCompany = searchParams.get("empresa") || "";

  // 1. All useState declarations first
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<string>(
    initialCompany || "all"
  );
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // 2. All useRef declarations
  const tabsRef = useRef<HTMLDivElement>(null);

  // 3. All useMemo declarations
  const employees = useMemo(() => getEmployees(), []);
  const companies = useMemo(() => getCompanies(), []);
  const departments = useMemo(() => getDepartments(), []);

  // Fuse.js setup for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(employees, {
        keys: [
          { name: 'name',       weight: 0.35 },
          { name: 'position',   weight: 0.25 },
          { name: 'department', weight: 0.20 },
          { name: 'extension',  weight: 0.15 },
          { name: 'phone',      weight: 0.05 },
        ],
        threshold: 0.35,
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 1,
        ignoreLocation: true,
      }),
    [employees]
  );

  // Search results logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    // Check if query is a number to prioritize extensions
    const isNumeric = /^\d+$/.test(searchQuery.trim());
    const results = fuse.search(searchQuery);

    if (isNumeric) {
      return results.sort((a, b) => {
        const aExtMatch = a.item.extension === searchQuery.trim();
        const bExtMatch = b.item.extension === searchQuery.trim();
        if (aExtMatch && !bExtMatch) return -1;
        if (!aExtMatch && bExtMatch) return 1;
        return 0;
      }).slice(0, 8);
    }

    return results.slice(0, 8);
  }, [searchQuery, fuse]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    let results: Employee[] = employees.filter(emp => {
      const company = companies.find(c => c.id === emp.company);
      return company && !company.disabled;
    });

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
  }, [employees, searchQuery, selectedCompany, selectedDepartment, fuse, companies]);

  // Get the active company's primary color
  const activeCompany = useMemo(() => companies.find((c) => c.id === selectedCompany), [companies, selectedCompany]);
  const isTodos = selectedCompany === "all";
  const activeColor = activeCompany?.colors?.primary || "var(--irid-a)";

  // Ambient blobs colors
  const blobTopColor = useMemo(() => isTodos ? "rgba(59,130,246,0.15)" : (activeCompany?.id === "comercializadora-shuma" ? "rgba(0,102,204,0.15)" : (activeCompany?.id === "acabados-shuma" ? "rgba(192,21,42,0.18)" : (activeCompany?.id === "ferrecapital" ? "rgba(204,0,0,0.08)" : "rgba(0,0,0,0)"))), [isTodos, activeCompany]);
  const blobBottomColor = useMemo(() => isTodos ? "rgba(139,92,246,0.15)" : (activeCompany?.id === "comercializadora-shuma" ? "rgba(0,102,204,0.15)" : (activeCompany?.id === "acabados-shuma" ? "rgba(192,21,42,0.18)" : (activeCompany?.id === "ferrecapital" ? "rgba(204,0,0,0.08)" : "rgba(0,0,0,0)"))), [isTodos, activeCompany]);

  // 4. All useCallback declarations
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
      const searchInput = document.getElementById("search-input");
      searchInput?.focus();
    }

    if (searchOpen && searchResults.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        router.push(`/directorio/${searchResults[selectedIndex].item.id}`);
        setSearchOpen(false);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
    }
  }, [searchOpen, searchResults, selectedIndex, router]);

  // 5. All useEffect declarations
  const placeholders = [
    "Buscar por nombre...",
    "Buscar por extensión...",
    "Buscar por departamento..."
  ];

  useEffect(() => {
    setIsLoaded(true);
    const savedViewMode = localStorage.getItem("shuma-view-mode") as ViewMode;
    if (savedViewMode) setViewMode(savedViewMode);

    const handleViewChange = (e: any) => {
      setViewMode(e.detail);
    };
    window.addEventListener("view-mode-change", handleViewChange);

    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("view-mode-change", handleViewChange);
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, [handleKeyDown, placeholders.length]);

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

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCompany("all");
    setSelectedDepartment("all");
  }, []);

  // Get employee count per company
  const getCompanyCount = useCallback((companyId: string) => {
    if (companyId === "all") return filteredEmployees.length;
    return filteredEmployees.filter(emp => emp.company === companyId).length;
  }, [filteredEmployees]);

  return (
    <div className="min-h-screen bg-[--bg-base] relative overflow-x-hidden">
      {/* Background effects */}
      <div className="dot-grid pointer-events-none" />
      <div className="noise-overlay pointer-events-none" />

      {/* Ambient glow blobs - color changes based on active company */}
      <motion.div
        animate={{ backgroundColor: blobTopColor }}
        transition={{ duration: 0.4 }}
        className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] z-[-1] pointer-events-none"
      />
      <motion.div
        animate={{ backgroundColor: blobBottomColor }}
        transition={{ duration: 0.4 }}
        className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] z-[-1] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <Navbar />
      </motion.div>

      <main className="pt-16 md:pt-20 pb-24 md:pb-16 relative z-10 bottom-tab-safe">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: 10 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative h-[64px] border-b border-[--border-subtle] bg-[--bg-base] backdrop-blur-xl z-30"
          style={{
            backgroundColor: 'rgba(var(--bg-base-rgb), 0.88)'
          } as any}
        >
          <div className="container mx-auto h-full px-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-lg md:text-xl tracking-wider cursor-pointer" 
              style={{ fontFamily: "'Neuropol', sans-serif" }}
            >
              <span className="text-[#F2F0EC]" style={{ fontFamily: "'Neuropol', sans-serif" }}>SHU</span>
              <span className={cn(
                isTodos ? "animate-gradient-text" : ""
              )} style={{ 
                fontFamily: "'Neuropol', sans-serif",
                color: isTodos ? undefined : activeColor,
                background: isTodos ? 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899)' : undefined,
                backgroundSize: isTodos ? '300% 300%' : undefined,
                WebkitBackgroundClip: isTodos ? 'text' : undefined,
                WebkitTextFillColor: isTodos ? 'transparent' : undefined
              }}>MA</span>
            </Link>

            {/* Search - desktop inline, mobile expandable */}
            <div className="flex items-center gap-4">
              {/* Desktop search */}
              <div className="hidden md:block relative">
                <motion.div
                  animate={{ width: searchQuery || searchOpen ? 320 : 280 }}
                  className="relative group"
                >
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint group-focus-within:text-irid-a transition-colors" />
                  <input
                    id="search-input"
                    type="text"
                    placeholder={placeholders[placeholderIndex]}
                    value={searchQuery}
                    onFocus={() => setSearchOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedIndex(-1);
                    }}
                    className="w-full bg-transparent border-0 border-b border-border-subtle rounded-none py-2 pl-8 pr-12 focus:border-irid-a transition-all text-xs uppercase outline-none font-neuropol"
                    style={{ fontFamily: "'Neuropol', sans-serif" }}
                  />
                  
                  {/* Keyboard shortcut hint */}
                  {!searchQuery && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-text-faint pointer-events-none">
                      <Command className="w-3 h-3" />
                      <span>K</span>
                    </div>
                  )}

                  {/* Clear button */}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-text-faint hover:text-text-primary transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>

                {/* Search Results Panel */}
                <AnimatePresence>
                  {searchOpen && searchQuery.trim().length > 0 && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setSearchOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute top-full left-0 right-0 mt-4 bg-[#0F0F1A]/97 backdrop-blur-xl border border-[--border-subtle] rounded-xl shadow-2xl z-50 overflow-hidden min-w-[340px]"
                      >
                        <div className="p-3 border-b border-[--border-subtle] flex items-center justify-between">
                          <p className="text-[10px] text-text-muted uppercase tracking-wider font-neuropol">
                            {searchResults.length} resultados para "{searchQuery}"
                          </p>
                          <kbd className="text-[9px] text-text-faint bg-white/5 px-1.5 py-0.5 rounded">ESC</kbd>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                          {searchResults.length > 0 ? (
                            searchResults.map((result, idx) => {
                              const company = getCompanyById(result.item.company);
                              const isSelected = idx === selectedIndex;
                              
                              return (
                                <button
                                  key={result.item.id}
                                  onClick={() => {
                                    router.push(`/directorio/${result.item.id}`);
                                    setSearchOpen(false);
                                  }}
                                  onMouseEnter={() => setSelectedIndex(idx)}
                                  className={cn(
                                    "w-full flex items-center gap-3 p-3 transition-colors text-left group",
                                    isSelected ? "bg-white/10" : "hover:bg-white/5"
                                  )}
                                >
                                  {/* Result Monogram */}
                                  <div 
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-lg"
                                    style={{ 
                                      background: company?.id === 'ferrecapital' 
                                        ? "linear-gradient(135deg, #1A1A1A, #2A2A2A)" 
                                        : `linear-gradient(135deg, ${company?.colors?.primary || '#3B82F6'}, ${company?.colors?.secondary || '#8B5CF6'})`,
                                      border: company?.id === 'ferrecapital' ? '1.5px solid #CC0000' : 'none'
                                    }}
                                  >
                                    <span style={{ fontFamily: "'Neuropol', sans-serif" }}>
                                      {result.item.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                                    </span>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h5 
                                      className="text-[14px] text-text-primary truncate font-neuropol"
                                      style={{ fontFamily: "'Neuropol', sans-serif" }}
                                    >
                                      {result.item.name}
                                    </h5>
                                    <p className="text-[11px] text-text-muted truncate font-dm-sans italic">
                                      {result.item.position}
                                    </p>
                                  </div>

                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                    {result.item.extension && (
                                      <span 
                                        className="text-[9px] px-1.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-text-muted font-neuropol"
                                        style={{ fontFamily: "'Neuropol', sans-serif" }}
                                      >
                                        EXT. {result.item.extension}
                                      </span>
                                    )}
                                    <div 
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: company?.colors?.primary || '#3B82F6' }}
                                    />
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <div className="p-8 text-center">
                              <Users className="w-8 h-8 text-text-faint mx-auto mb-3" />
                              <p className="text-sm text-text-muted font-dm-sans">
                                No se encontró ningún empleado
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile search toggle */}
              <button
                className="md:hidden p-2 text-text-muted hover:text-text-primary transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
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
        </motion.header>

        {/* Empresa Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border-b border-border-subtle bg-[--bg-base]/80 backdrop-blur-md sticky top-[64px] z-20"
        >
          <div
            ref={tabsRef}
            className="flex items-center gap-8 container mx-auto px-4 overflow-x-auto no-scrollbar py-4"
          >
            {/* TODOS tab */}
            <button
              onClick={() => setSelectedCompany("all")}
              className={cn(
                "relative text-[12px] uppercase tracking-[0.1em] pb-2 transition-colors",
                isTodos ? "" : "text-[#3A3A52] hover:text-text-muted"
              )}
              style={{ 
                fontFamily: "'Neuropol', sans-serif",
                color: isTodos ? (activeCompany?.colors?.primary || "var(--irid-a)") : undefined
              }}
            >
              <span style={{ fontFamily: "'Neuropol', sans-serif" }}>TODOS</span>
              <span className="ml-2 text-[10px] opacity-60" style={{ fontFamily: "'Neuropol', sans-serif" }}>
                {getCompanyCount("all")}
              </span>
              {isTodos && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-irid-a to-irid-b"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>

            {companies.filter(c => !c.disabled).map((company) => (
              <button
                key={company.id}
                data-company={company.id}
                onClick={() => setSelectedCompany(company.id)}
                className={cn(
                  "relative text-[12px] uppercase tracking-[0.1em] pb-2 transition-colors",
                  selectedCompany === company.id ? "" : "text-[#3A3A52] hover:text-text-muted"
                )}
                style={{ 
                  fontFamily: "'Neuropol', sans-serif",
                  color: selectedCompany === company.id 
                    ? (company.id === 'ferrecapital' ? '#CC0000' : company.colors.primary) 
                    : undefined
                }}
              >
                <span style={{ fontFamily: "'Neuropol', sans-serif" }}>
                  {company.shortName || company.name}
                </span>
                <span className="ml-2 text-[10px] opacity-60" style={{ fontFamily: "'Neuropol', sans-serif" }}>
                  {getCompanyCount(company.id)}
                </span>
                {selectedCompany === company.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: company.id === 'ferrecapital' ? '#CC0000' : company.colors?.primary }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Department Filter Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="py-4 border-b border-border-subtle bg-[--bg-base]/60 backdrop-blur-sm sticky top-[118px] z-10 overflow-x-auto no-scrollbar"
        >
          <div className="container mx-auto px-4 flex items-center gap-3">
            {/* TODOS pill */}
            <button
              onClick={() => setSelectedDepartment("all")}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider transition-all border shrink-0",
                selectedDepartment === "all" 
                  ? "" 
                  : "border-[--border-subtle] text-[#3A3A52] hover:text-text-muted"
              )}
              style={{
                fontFamily: "'Neuropol', sans-serif",
                backgroundColor: selectedDepartment === "all" ? (isTodos ? "rgba(99,102,241,0.15)" : (activeCompany?.id === 'ferrecapital' ? 'rgba(204,0,0,0.10)' : `${activeColor}26`)) : undefined,
                borderColor: selectedDepartment === "all" ? (isTodos ? "rgba(99,102,241,0.3)" : (activeCompany?.id === 'ferrecapital' ? 'rgba(204,0,0,0.30)' : `${activeColor}4d`)) : undefined,
                color: selectedDepartment === "all" ? (isTodos ? "#818CF8" : (activeCompany?.id === 'ferrecapital' ? '#CC0000' : activeColor)) : undefined
              }}
            >
              TODOS
            </button>

            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider transition-all border shrink-0",
                  selectedDepartment === dept 
                    ? "" 
                    : "border-[--border-subtle] text-[#3A3A52] hover:text-text-muted"
                )}
                style={{
                  fontFamily: "'Neuropol', sans-serif",
                  backgroundColor: selectedDepartment === dept ? (isTodos ? "rgba(99,102,241,0.15)" : (activeCompany?.id === 'ferrecapital' ? 'rgba(204,0,0,0.10)' : `${activeColor}26`)) : undefined,
                  borderColor: selectedDepartment === dept ? (isTodos ? "rgba(99,102,241,0.3)" : (activeCompany?.id === 'ferrecapital' ? 'rgba(204,0,0,0.30)' : `${activeColor}4d`)) : undefined,
                  color: selectedDepartment === dept ? (isTodos ? "#818CF8" : (activeCompany?.id === 'ferrecapital' ? '#CC0000' : activeColor)) : undefined
                }}
              >
                {dept}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pt-6">
          <p 
            className="text-sm text-text-muted mb-4 uppercase tracking-wider"
            style={{ fontFamily: "'Neuropol', sans-serif" }}
          >
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
                  
                  if (viewMode === "grid") {
                    return (
                      <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        company={company}
                        index={index}
                      />
                    );
                  }

                  return (
                    <div
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        borderLeft: `3px solid ${company?.colors.primary}`,
                        borderBottom: '1px solid #1E1E30',
                        background: 'var(--bg-surface)',
                        cursor: 'pointer',
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#161625'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                    >
                      {/* Monogram */}
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${company?.colors.primary}, ${company?.colors.secondary})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Neuropol', sans-serif", color: '#fff', fontSize: 13, fontWeight: 600
                      }}>
                        {employee.name.split(' ').slice(0,2).map(n => n[0]).join('')}
                      </div>
                      {/* Name + role */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Neuropol', sans-serif", fontSize: 13, 
                                      color: '#F2F0EC', whiteSpace: 'nowrap', 
                                      overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {employee.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#64647A', marginTop: 2 }}>
                          {employee.position}
                        </div>
                      </div>
                      {/* Extension */}
                      {employee.extension && (
                        <div style={{
                          padding: '2px 8px', borderRadius: 4, flexShrink: 0,
                          background: `${company?.colors.primary}22`,
                          border: `1px solid ${company?.colors.primary}44`,
                          fontFamily: "'Neuropol', sans-serif",
                          fontSize: 11, color: company?.colors.primary
                        }}>
                          Ext. {employee.extension}
                        </div>
                      )}
                      {/* Dept badge */}
                      <div style={{
                        padding: '2px 8px', borderRadius: 4, flexShrink: 0,
                        background: 'rgba(255,255,255,0.05)',
                        fontSize: 10, color: '#64647A',
                      }} className="hidden md:block">
                        {employee.department}
                      </div>
                      {/* Company dot */}
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: company?.colors.primary
                      }} />
                    </div>
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
