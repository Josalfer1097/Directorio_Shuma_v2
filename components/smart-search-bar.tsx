"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Users,
  Building2,
  Layers,
  MapPin,
  Briefcase,
  Phone,
  Mail,
} from "lucide-react";
import Fuse from "fuse.js";
import { getEmployees, getCompanies, getDepartments } from "@/lib/data";

interface SearchResult {
  type: "employee" | "company" | "department" | "location" | "position" | "extension";
  id: string;
  label: string;
  secondary?: string;
  data: any;
}

const GROUP_LABELS: Record<string, string> = {
  employee:   "Personas",
  company:    "Empresa",
  department: "Departamento",
  location:   "Localización",
  position:   "Puesto",
  extension:  "Extensión",
};

// Per-type accent color (CSS custom property–aware strings)
const ICON_COLOR: Record<SearchResult["type"], string> = {
  employee:   "text-sky-400",
  extension:  "text-emerald-400",
  company:    "text-amber-400",
  department: "text-violet-400",
  location:   "text-rose-400",
  position:   "text-orange-400",
};

const ICON_BG: Record<SearchResult["type"], string> = {
  employee:   "bg-sky-500/10",
  extension:  "bg-emerald-500/10",
  company:    "bg-amber-500/10",
  department: "bg-violet-500/10",
  location:   "bg-rose-500/10",
  position:   "bg-orange-500/10",
};

function ResultIcon({ type }: { type: SearchResult["type"] }) {
  const props = { className: "w-4 h-4" };
  switch (type) {
    case "employee":   return <Users   {...props} />;
    case "company":    return <Building2 {...props} />;
    case "department": return <Layers  {...props} />;
    case "location":   return <MapPin  {...props} />;
    case "position":   return <Briefcase {...props} />;
    case "extension":  return <Phone   {...props} />;
  }
}

// Normalize search query (remove accents, lowercase)
function normalizeQuery(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function SmartSearchBar() {
  const [query, setQuery]               = useState("");
  const [isOpen, setIsOpen]             = useState(false);
  const [results, setResults]           = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading]       = useState(false);
  const [searchError, setSearchError]   = useState(false);

  const router        = useRouter();
  const containerRef  = useRef<HTMLDivElement>(null);
  const inputRef      = useRef<HTMLInputElement>(null);

  // Static data — stable references from module-level JSON, memoized once
  const employees   = useMemo(() => getEmployees(),   []);
  const companies   = useMemo(() => getCompanies(),   []);
  const departments = useMemo(() => getDepartments(), []);

  // Build Fuse search index once
  const fuseIndex = useMemo(() => {
    const searchableEmployees = employees.map((emp) => ({
      id: emp.id,
      nombreCompleto: emp.name,
      apellidos:      emp.name.split(" ").slice(-2).join(" "),
      primerNombre:   emp.name.split(" ")[0],
      puesto:         emp.position,
      departamento:   emp.department || "",
      empresa:        emp.company,
      sucursal:       emp.location || "",
      extension:      emp.extension || "",
      type:           "employee",
      data:           emp,
    }));

    return new Fuse(searchableEmployees, {
      keys: [
        { name: "nombreCompleto", weight: 0.30 },
        { name: "apellidos",      weight: 0.35 },
        { name: "primerNombre",   weight: 0.15 },
        { name: "puesto",         weight: 0.10 },
        { name: "departamento",   weight: 0.05 },
        { name: "empresa",        weight: 0.03 },
        { name: "sucursal",       weight: 0.02 },
      ],
      threshold:         0.2,
      distance:          100,
      minMatchCharLength: 2,
      useExtendedSearch:  false,
      includeMatches:     true,
      shouldSort:         true,
    });
  }, [employees]);

  const handleSearch = useCallback(
    (q: string) => {
      if (q.length < 2) {
        setResults([]);
        setSelectedIndex(-1);
        setSearchError(false);
        return;
      }

      setIsLoading(true);
      setSearchError(false);

      try {
        const normalizedQ = normalizeQuery(q);

        // --- Employees (Fuse, deduplicated) ---
        const rawFuseResults = fuseIndex.search(q);
        const seenIds        = new Set<string>();
        const employeeMatches: SearchResult[] = rawFuseResults
          .filter((r) => {
            if (seenIds.has(r.item.id)) return false;
            seenIds.add(r.item.id);
            return true;
          })
          .slice(0, 5)
          .map((r) => ({
            type:      "employee" as const,
            id:        r.item.id,
            label:     r.item.nombreCompleto,
            secondary: `${r.item.empresa} · ${r.item.puesto}`,
            data:      r.item.data,
          }));

        // --- Extensions ---
        const extQ = normalizedQ.replace(/\D/g, "");
        const extensionMatches: SearchResult[] = [];
        if (extQ.length >= 2) {
          employees.forEach((emp) => {
            if (
              emp.extension &&
              normalizeQuery(emp.extension).includes(extQ) &&
              !employeeMatches.find((m) => m.id === emp.id)
            ) {
              extensionMatches.push({
                type:      "extension",
                id:        emp.id,
                label:     emp.name,
                secondary: `Ext: ${emp.extension} · ${emp.company}`,
                data:      emp,
              });
            }
          });
        }

        // --- Companies ---
        const companyMatches: SearchResult[] = companies
          .filter(
            (c) =>
              !c.disabled &&
              (normalizeQuery(c.name).includes(normalizedQ) ||
                normalizeQuery(c.shortName || "").includes(normalizedQ))
          )
          .slice(0, 3)
          .map((c) => {
            const count = employees.filter((e) => e.company === c.id).length;
            return {
              type:      "company" as const,
              id:        c.id,
              label:     c.shortName || c.name,
              secondary: `${count} colaboradores`,
              data:      c,
            };
          });

        // --- Departments ---
        const departmentMatches: SearchResult[] = departments
          .filter((d) => normalizeQuery(d).includes(normalizedQ))
          .slice(0, 3)
          .map((d) => {
            const count = employees.filter(
              (e) => e.department && normalizeQuery(e.department).includes(normalizedQ)
            ).length;
            return {
              type:      "department" as const,
              id:        d,
              label:     d,
              secondary: `${count} colaboradores`,
              data:      { department: d },
            };
          });

        // --- Locations ---
        const locMap = new Map<string, number>();
        employees.forEach((emp) => {
          if (emp.location && normalizeQuery(emp.location).includes(normalizedQ)) {
            locMap.set(emp.location, (locMap.get(emp.location) || 0) + 1);
          }
        });
        const locationMatches: SearchResult[] = Array.from(locMap)
          .slice(0, 3)
          .map(([loc, count]) => ({
            type:      "location" as const,
            id:        loc,
            label:     loc,
            secondary: `${count} colaboradores`,
            data:      { location: loc },
          }));

        // --- Positions ---
        const posMap = new Map<string, number>();
        employees.forEach((emp) => {
          if (normalizeQuery(emp.position).includes(normalizedQ)) {
            posMap.set(emp.position, (posMap.get(emp.position) || 0) + 1);
          }
        });
        const positionMatches: SearchResult[] = Array.from(posMap)
          .slice(0, 3)
          .map(([pos, count]) => ({
            type:      "position" as const,
            id:        pos,
            label:     pos,
            secondary: `${count} colaboradores`,
            data:      { position: pos },
          }));

        const allResults = [
          ...employeeMatches,
          ...extensionMatches.slice(0, 3),
          ...companyMatches,
          ...departmentMatches,
          ...locationMatches,
          ...positionMatches,
        ].slice(0, 20);

        setResults(allResults);
        setSelectedIndex(-1);
      } catch (_err) {
        setSearchError(true);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [fuseIndex, employees, companies, departments]
  );

  // Debounced search — 300 ms
  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (!isOpen || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((p) => (p < results.length - 1 ? p + 1 : p));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((p) => (p > 0 ? p - 1 : -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0) handleSelectResult(results[selectedIndex]);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, results, selectedIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    switch (result.type) {
      case "employee":
      case "extension":
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
    }
    setIsOpen(false);
    setQuery("");
  };

  // Group results preserving order
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      employee: [], extension: [], company: [],
      department: [], location: [], position: [],
    };
    results.forEach((r) => groups[r.type]?.push(r));
    return groups;
  }, [results]);

  const hasResults = results.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-[600px] mx-auto">
      {/* Input */}
      <div className="relative flex items-center group">
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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />

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
        {query && !isLoading && hasResults && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-muted border border-border-subtle text-xs text-foreground font-medium">
            {results.length}
          </div>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl shadow-2xl max-h-[400px] overflow-y-auto"
            style={{
              background: "rgba(10, 12, 16, 0.92)",
              backdropFilter: "blur(16px) saturate(150%)",
              WebkitBackdropFilter: "blur(16px) saturate(150%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Error state */}
            {searchError && (
              <div className="flex flex-col items-center justify-center py-12 px-4 gap-2">
                <Search className="w-7 h-7 text-muted-foreground" />
                <p className="text-muted-foreground text-sm text-center">
                  Ocurrió un error al buscar. Intenta de nuevo.
                </p>
              </div>
            )}

            {/* Empty state */}
            {!searchError && !isLoading && !hasResults && (
              <div className="flex flex-col items-center justify-center py-12 px-4 gap-2">
                <Search className="w-7 h-7 text-muted-foreground" />
                <p className="text-foreground text-sm font-medium">
                  Sin resultados
                </p>
                <p className="text-muted-foreground text-xs text-center">
                  No encontramos coincidencias para{" "}
                  <span className="text-foreground font-medium">&ldquo;{query}&rdquo;</span>
                </p>
              </div>
            )}

            {/* Results */}
            {!searchError && hasResults && (
              <div className="py-1.5">
                {Object.entries(groupedResults).map(([type, items], groupIdx) => {
                  if (items.length === 0) return null;
                  const isFirstGroup = Object.entries(groupedResults)
                    .slice(0, groupIdx)
                    .every(([, v]) => v.length === 0);

                  return (
                    <div key={type}>
                      {!isFirstGroup && (
                        <div
                          className="my-1 mx-3"
                          style={{ height: 1, background: "rgba(255,255,255,0.05)" }}
                        />
                      )}
                      {/* Group label */}
                      <div className="px-3 pt-2 pb-1 flex items-center gap-1.5">
                        <span
                          className={`inline-flex ${ICON_COLOR[type as SearchResult["type"]]}`}
                          style={{ opacity: 0.7 }}
                        >
                          <ResultIcon type={type as SearchResult["type"]} />
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          {GROUP_LABELS[type]}
                        </span>
                      </div>

                      {items.map((result, idx) => {
                        const globalIndex = results.indexOf(result);
                        const isSelected  = selectedIndex === globalIndex;
                        const hasContact  =
                          result.type === "employee" &&
                          (result.data?.extension || result.data?.email);

                        return (
                          <motion.button
                            key={`${result.type}-${result.id}`}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.008, duration: 0.18 }}
                            onClick={() => handleSelectResult(result)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full px-3 py-2 flex items-start gap-3 transition-colors text-left ${
                              isSelected
                                ? "bg-white/[0.06]"
                                : "hover:bg-white/[0.04]"
                            }`}
                          >
                            {/* Icon badge */}
                            <div
                              className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${
                                ICON_BG[result.type]
                              } ${ICON_COLOR[result.type]}`}
                            >
                              <ResultIcon type={result.type} />
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-foreground leading-tight truncate">
                                {result.label}
                              </div>
                              {result.secondary && (
                                <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                                  {result.secondary}
                                </div>
                              )}
                              {hasContact && (
                                <div className="mt-1.5 flex items-center gap-4">
                                  {result.data?.extension && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                      <Phone className="w-3 h-3 flex-shrink-0" />
                                      Ext. {result.data.extension}
                                    </span>
                                  )}
                                  {result.data?.email && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                                      <Mail className="w-3 h-3 flex-shrink-0" />
                                      <span className="truncate">{result.data.email}</span>
                                    </span>
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
