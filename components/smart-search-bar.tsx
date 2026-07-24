"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Ghost, Users, Building2, Layers, MapPin, Briefcase, Phone, Mail } from "lucide-react";
import Fuse from "fuse.js";
import { getEmployees, getCompanies, getDepartments } from "@/lib/data";

interface SearchResult {
  type: "employee" | "company" | "department" | "location" | "position" | "extension";
  id: string;
  label: string;
  secondary?: string;
  data: any;
}

export function SmartSearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const employees = getEmployees();
  const companies = getCompanies();
  const departments = getDepartments();

  // Build search index with Fuse.js
  const fuseIndex = useMemo(() => {
    const searchableEmployees = employees.map((emp) => ({
      id: emp.id,
      nombreCompleto: emp.name,
      apellidos: emp.name.split(' ').slice(-2).join(' '),
      primerNombre: emp.name.split(' ')[0],
      puesto: emp.position,
      departamento: emp.department || "",
      empresa: emp.company,
      sucursal: emp.location || "",
      extension: emp.extension || "",
      type: "employee",
      data: emp,
    }));

    return new Fuse(searchableEmployees, {
      keys: [
        { name: "nombreCompleto", weight: 0.3 },
        { name: "apellidos", weight: 0.35 },
        { name: "primerNombre", weight: 0.15 },
        { name: "puesto", weight: 0.10 },
        { name: "departamento", weight: 0.05 },
        { name: "empresa", weight: 0.03 },
        { name: "sucursal", weight: 0.02 },
      ],
      threshold: 0.2,
      distance: 100,
      minMatchCharLength: 2,
      useExtendedSearch: false,
      includeMatches: true,
      shouldSort: true,
    });
  }, [employees]);

  // Normalize search query (remove accents)
  const normalizeQuery = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const handleSearch = useCallback((q: string) => {
    if (q.length < 2) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    const normalizedQ = normalizeQuery(q);

    // Search employees - deduplicate raw Fuse results by employee ID first
    const rawFuseResults = fuseIndex.search(q);
    
    // Deduplicate at Fuse result level (before mapping) - keep first occurrence only
    const seenEmployeeIds = new Set<string>();
    const dedupedFuseResults = rawFuseResults.filter((result) => {
      const empId = result.item.id;
      if (seenEmployeeIds.has(empId)) {
        return false;
      }
      seenEmployeeIds.add(empId);
      return true;
    });

    // Now map to SearchResult format - this array is already deduplicated
    const employeeMatches = dedupedFuseResults.map((result) => ({
      type: "employee" as const,
      id: result.item.id,
      label: result.item.nombreCompleto,
      secondary: `${result.item.empresa} • ${result.item.puesto}`,
      data: result.item.data,
    }));

    // Search for exact extension match
    const extensionMatches: SearchResult[] = [];
    const extensionQuery = normalizedQ.replace(/\D/g, "");
    if (extensionQuery.length >= 2) {
      employees.forEach((emp) => {
        if (
          emp.extension &&
          normalizeQuery(emp.extension).includes(extensionQuery)
        ) {
          const exists = employeeMatches.find((m) => m.id === emp.id);
          if (!exists) {
            extensionMatches.push({
              type: "extension",
              id: emp.id,
              label: emp.name,
              secondary: `Ext: ${emp.extension} • ${emp.company}`,
              data: emp,
            });
          }
        }
      });
    }

    // Search companies
    const companyMatches: SearchResult[] = companies
      .filter(
        (company) =>
          !company.disabled &&
          (normalizeQuery(company.name).includes(normalizedQ) ||
            normalizeQuery(company.shortName || "").includes(normalizedQ))
      )
      .map((company) => {
        const companyEmployees = employees.filter((e) => e.company === company.id);
        return {
          type: "company" as const,
          id: company.id,
          label: company.shortName || company.name,
          secondary: `${companyEmployees.length} colaboradores`,
          data: company,
        };
      });

    // Search departments
    const departmentMatches: SearchResult[] = departments
      .filter((dept) =>
        normalizeQuery(dept).includes(normalizedQ)
      )
      .map((dept) => {
        const deptEmployees = employees.filter(
          (e) => e.department && normalizeQuery(e.department).includes(normalizedQ)
        );
        return {
          type: "department" as const,
          id: dept,
          label: dept,
          secondary: `${deptEmployees.length} colaboradores`,
          data: { department: dept },
        };
      });

    // Search locations
    const locations = new Map<string, number>();
    employees.forEach((emp) => {
      if (emp.location && normalizeQuery(emp.location).includes(normalizedQ)) {
        locations.set(emp.location, (locations.get(emp.location) || 0) + 1);
      }
    });

    const locationMatches: SearchResult[] = Array.from(locations).map(
      ([location, count]) => ({
        type: "location" as const,
        id: location,
        label: location,
        secondary: `${count} colaboradores`,
        data: { location },
      })
    );

    // Search positions
    const positions = new Map<string, number>();
    employees.forEach((emp) => {
      if (normalizeQuery(emp.position).includes(normalizedQ)) {
        positions.set(emp.position, (positions.get(emp.position) || 0) + 1);
      }
    });

    const positionMatches: SearchResult[] = Array.from(positions).map(
      ([position, count]) => ({
        type: "position" as const,
        id: position,
        label: position,
        secondary: `${count} colaboradores`,
        data: { position },
      })
    );

    // Combine and limit results - employeeMatches already deduplicated
    const allResults = [
      ...employeeMatches.slice(0, 5),
      ...extensionMatches.slice(0, 3),
      ...companyMatches.slice(0, 3),
      ...departmentMatches.slice(0, 3),
      ...locationMatches.slice(0, 3),
      ...positionMatches.slice(0, 3),
    ].slice(0, 20);

    setResults(allResults);
    setSelectedIndex(-1);
    setIsLoading(false);
  }, [fuseIndex, employees, companies, departments]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // Handle keyboard shortcuts and navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to focus
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (!isOpen || results.length === 0) return;

      // Arrow keys
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectResult(results[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    switch (result.type) {
      case "employee":
        router.push(`/directorio/${result.id}`);
        break;
      case "company":
        router.push(`/directorio?empresa=${result.id}`);
        break;
      case "department":
        router.push(`/directorio?departamento=${result.id}`);
        break;
      case "location":
        router.push(`/directorio?sucursal=${result.data.location}`);
        break;
      case "position":
        router.push(`/directorio?puesto=${result.data.position}`);
        break;
      case "extension":
        router.push(`/directorio/${result.id}`);
        break;
    }
    setIsOpen(false);
    setQuery("");
  };

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "employee":
        return <Users className="w-4 h-4" />;
      case "company":
        return <Building2 className="w-4 h-4" />;
      case "department":
        return <Layers className="w-4 h-4" />;
      case "location":
        return <MapPin className="w-4 h-4" />;
      case "position":
        return <Briefcase className="w-4 h-4" />;
      case "extension":
        return <Phone className="w-4 h-4" />;
    }
  };

  const getGroupedResults = () => {
    const grouped: Record<string, SearchResult[]> = {
      employee: [],
      company: [],
      department: [],
      location: [],
      position: [],
      extension: [],
    };

    results.forEach((result) => {
      grouped[result.type].push(result);
    });

    return grouped;
  };

  const groupedResults = getGroupedResults();
  const groupLabels: Record<string, string> = {
    employee: "👤 Personas",
    company: "🏢 Empresa",
    department: "🏬 Departamento",
    location: "📍 Localización",
    position: "💼 Puesto",
    extension: "📞 Extensión",
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[600px] mx-auto">
      <div className="relative group">
        {/* Input field */}
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder="Buscar por nombre, empresa, puesto, departamento, extensión..."
            className="w-full px-4 py-3 pl-12 pr-24 bg-[--bg-surface] border border-border-subtle rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary/40 transition-all text-scale-base"
          />

          {/* Left icon */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />

          {/* Right side: keyboard shortcut or loading */}
          {!isLoading && !query && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded bg-muted border border-border-subtle text-xs text-muted-foreground">
              <kbd className="font-mono">⌘K</kbd>
            </div>
          )}

          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
          )}

          {query && !isLoading && results.length > 0 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-muted border border-border-subtle text-xs text-foreground font-medium">
              {results.length} resultados
            </div>
          )}
        </div>
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 z-50 backdrop-blur-lg border border-border-subtle rounded-xl shadow-2xl max-h-[400px] overflow-y-auto"
            style={{ background: "rgba(10,10,20,0.96)" }}
          >
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Ghost className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">Sin resultados para "{query}"</p>
              </div>
            ) : (
              <div className="py-2">
                {Object.entries(groupedResults).map(([type, items], groupIndex) => {
                  if (items.length === 0) return null;

                  return (
                    <div key={type}>
                      {groupIndex > 0 && (
                        <div className="my-1 mx-2 border-t border-border-subtle" />
                      )}
                      <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "#8888AA" }}>
                        {groupLabels[type]}
                      </div>
                      {items.map((result, index) => {
                        const globalIndex = results.indexOf(result);
                        const isSelected = selectedIndex === globalIndex;
                        const hasContactInfo = result.type === "employee" && 
                          (result.data?.extension || result.data?.email);

                        return (
                          <motion.button
                            key={`${result.type}-${result.id}`}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: index * 0.01,
                              duration: 0.2,
                            }}
                            onClick={() => handleSelectResult(result)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full px-3 py-2.5 flex items-start gap-3 transition-all text-left group ${
                              isSelected
                                ? "bg-muted"
                                : "hover:bg-muted/50"
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors mt-0.5 ${
                                isSelected
                                  ? "bg-blue-500/30 text-blue-300"
                                  : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                              }`}
                            >
                              {getResultIcon(result.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground text-sm truncate">
                                {result.label}
                              </div>
                              {result.secondary && (
                                <div className="text-xs truncate" style={{ color: "#A8A8C0" }}>
                                  {result.secondary}
                                </div>
                              )}
                              {hasContactInfo && (
                                <div className="mt-1.5 flex items-center gap-4 text-xs" style={{ color: "#A8A8C0" }}>
                                  {result.data?.extension && (
                                    <div className="flex items-center gap-1.5">
                                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                      <span>Ext. {result.data.extension}</span>
                                    </div>
                                  )}
                                  {result.data?.email && (
                                    <div className="flex items-center gap-1.5 truncate">
                                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                      <span className="truncate">{result.data.email}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
