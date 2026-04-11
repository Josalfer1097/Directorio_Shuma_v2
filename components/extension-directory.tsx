"use client";

import { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Printer, Download, MapPin, Search, X, ClipboardList, Phone, RotateCcw } from "lucide-react";
import { getEmployees, getCompanies } from "@/lib/data";
import { getCompanyConfig } from "@/lib/companyConfig";
import type { Employee } from "@/types";

type SubMode = "completo" | "solo-extensiones";

// Default column widths (in pixels for fixed, percentage for relative)
const DEFAULT_COL_WIDTHS = [72, 220, 180, 140, 120]; // EXT, NOMBRE, PUESTO, DEPT, SUCURSAL
const MIN_COL_WIDTHS = [50, 180, 100, 100, 80];
const STORAGE_KEY = "directorio-quick-col-widths";

// Memoized row component for performance
const ExtensionRow = memo(function ExtensionRow({
  employee,
  companyConfig,
  onClick,
  isOdd,
  colWidths,
}: {
  employee: Employee;
  companyConfig: ReturnType<typeof getCompanyConfig>;
  onClick: () => void;
  isOdd: boolean;
  colWidths: number[];
}) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer transition-all duration-150 hover:bg-white/[0.04] group active:scale-[0.99]"
      style={{
        height: "44px",
        minHeight: "44px",
        maxHeight: "44px",
        background: isOdd ? "rgba(255,255,255,0.015)" : "transparent",
      }}
    >
      {/* Extension */}
      <td 
        className="px-3 text-center" 
        style={{ width: colWidths[0], minWidth: MIN_COL_WIDTHS[0] }}
      >
        {employee.extension ? (
          <span
            className="inline-block font-mono font-bold"
            style={{
              fontSize: "0.9rem",
              color: companyConfig.primary,
              background: `${companyConfig.primary}1f`,
              borderRadius: "6px",
              padding: "2px 8px",
            }}
          >
            {employee.extension}
          </span>
        ) : (
          <span className="text-white/20 text-xs">--</span>
        )}
      </td>
      {/* Name */}
      <td
        className="px-3 font-medium text-white group-hover:text-white/90"
        style={{ 
          width: colWidths[1], 
          minWidth: MIN_COL_WIDTHS[1],
          fontSize: "0.85rem", 
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={employee.name}
      >
        {employee.name}
      </td>
      {/* Position */}
      <td
        className="px-3 hidden md:table-cell"
        style={{ 
          width: colWidths[2], 
          minWidth: MIN_COL_WIDTHS[2],
          fontSize: "0.78rem", 
          color: "rgba(255,255,255,0.65)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={employee.position ?? ""}
      >
        {employee.position ?? "--"}
      </td>
      {/* Department */}
      <td
        className="px-3 hidden lg:table-cell"
        style={{ 
          width: colWidths[3], 
          minWidth: MIN_COL_WIDTHS[3],
          fontSize: "0.75rem", 
          color: "rgba(255,255,255,0.45)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={employee.department ?? ""}
      >
        {employee.department ?? "--"}
      </td>
      {/* Location */}
      <td
        className="px-3 hidden xl:table-cell"
        style={{ 
          width: colWidths[4], 
          minWidth: MIN_COL_WIDTHS[4],
          fontSize: "0.72rem", 
          color: "rgba(255,255,255,0.35)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={employee.location ?? ""}
      >
        {employee.location ?? "--"}
      </td>
    </tr>
  );
});

// Company header row
const CompanyHeader = memo(function CompanyHeader({
  companyName,
  companyConfig,
  employeeCount,
}: {
  companyName: string;
  companyConfig: ReturnType<typeof getCompanyConfig>;
  employeeCount: number;
}) {
  return (
    <tr
      style={{
        height: "36px",
        background: `${companyConfig.primary}1a`,
        borderLeft: `3px solid ${companyConfig.primary}`,
      }}
    >
      <td colSpan={5} className="px-4">
        <div className="flex items-center justify-between">
          <span
            className="font-neuropol uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              color: companyConfig.primary,
            }}
          >
            {companyName}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.65rem",
            }}
          >
            {employeeCount}
          </span>
        </div>
      </td>
    </tr>
  );
});

// Location sub-header
const LocationSubHeader = memo(function LocationSubHeader({
  location,
}: {
  location: string;
}) {
  return (
    <tr
      style={{
        height: "28px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <td colSpan={5} style={{ paddingLeft: "80px" }}>
        <span
          className="flex items-center gap-1"
          style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}
        >
          <MapPin className="w-3 h-3" />
          {location}
        </span>
      </td>
    </tr>
  );
});

// Extension Card for Solo Extensiones mode
const ExtensionCard = memo(function ExtensionCard({
  employee,
  companyConfig,
  onClick,
}: {
  employee: Employee;
  companyConfig: ReturnType<typeof getCompanyConfig>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full h-[72px] rounded-[10px] p-3 transition-all duration-150 hover:scale-[1.03] active:scale-[0.98] group"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderLeftWidth: "3px",
        borderLeftColor: companyConfig.primary,
      }}
    >
      <p 
        className="text-[0.8rem] text-white font-semibold line-clamp-2 leading-tight mb-1 group-hover:text-white/90"
      >
        {employee.name}
      </p>
      {employee.extension ? (
        <p 
          className="font-mono font-bold text-[1.1rem]"
          style={{ color: companyConfig.primary }}
        >
          {employee.extension}
        </p>
      ) : (
        <p className="text-[0.7rem] text-white/25">Sin ext.</p>
      )}
    </button>
  );
});

// Resize handle component
const ResizeHandle = memo(function ResizeHandle({
  onMouseDown,
  isResizing,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute right-0 top-0 bottom-0 w-[6px] cursor-col-resize group/resize"
      style={{ 
        background: isResizing ? "rgba(0,71,171,0.4)" : "transparent",
        transition: "background 150ms ease",
      }}
    >
      <div 
        className="absolute right-[2px] top-1/4 bottom-1/4 w-[2px] rounded-full transition-all duration-150"
        style={{
          background: isResizing ? "rgba(0,71,171,0.8)" : "rgba(255,255,255,0.1)",
        }}
      />
    </div>
  );
});

interface ExtensionDirectoryProps {
  selectedCompanies: string[];
  selectedDepartment: string;
  selectedLocations: string[];
  searchQuery: string;
}

export function ExtensionDirectory({
  selectedCompanies,
  selectedDepartment,
  selectedLocations,
  searchQuery: externalSearchQuery,
}: ExtensionDirectoryProps) {
  const router = useRouter();
  const employees = getEmployees();
  const companies = getCompanies();
  const [subMode, setSubMode] = useState<SubMode>("completo");
  const [internalSearch, setInternalSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  
  // Column widths state - load from localStorage on mount
  const [colWidths, setColWidths] = useState<number[]>(DEFAULT_COL_WIDTHS);
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Load column widths from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 5) {
          setColWidths(parsed);
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }, []);

  // Save column widths to localStorage when they change
  useEffect(() => {
    if (colWidths !== DEFAULT_COL_WIDTHS) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(colWidths));
    }
  }, [colWidths]);

  // Auto-focus search in solo-extensiones mode
  useEffect(() => {
    if (subMode === "solo-extensiones" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [subMode]);

  // Use internal search for both modes now
  const searchQuery = internalSearch || externalSearchQuery;

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    setResizingCol(colIndex);
    startXRef.current = e.clientX;
    startWidthRef.current = colWidths[colIndex];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startXRef.current;
      const newWidth = Math.max(MIN_COL_WIDTHS[colIndex], startWidthRef.current + diff);
      setColWidths(prev => {
        const updated = [...prev];
        updated[colIndex] = newWidth;
        return updated;
      });
    };

    const handleMouseUp = () => {
      setResizingCol(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [colWidths]);

  // Reset columns to default
  const handleResetColumns = useCallback(() => {
    setColWidths(DEFAULT_COL_WIDTHS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Filter and group employees
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Apply company/department/location filters from parent
    if (selectedCompanies.length > 0) {
      filtered = filtered.filter((emp) => selectedCompanies.includes(emp.company));
    }
    if (selectedDepartment !== "all") {
      filtered = filtered.filter((emp) => emp.department === selectedDepartment);
    }
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(
        (emp) => emp.location && selectedLocations.includes(emp.location)
      );
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          emp.position?.toLowerCase().includes(q) ||
          emp.department?.toLowerCase().includes(q) ||
          emp.extension?.toLowerCase().includes(q) ||
          emp.email?.toLowerCase().includes(q) ||
          emp.location?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [employees, selectedCompanies, selectedDepartment, selectedLocations, searchQuery]);

  // Group by company for "completo" mode
  const groupedEmployees = useMemo(() => {
    const companyOrder = ["comercializadora", "ferrecapital", "acabados", "arkiramica"];
    const grouped: {
      company: string;
      companyName: string;
      locations: { location: string | null; employees: Employee[] }[];
    }[] = [];

    companyOrder.forEach((companyId) => {
      const companyEmployees = filteredEmployees.filter((emp) => emp.company === companyId);
      if (companyEmployees.length === 0) return;

      const company = companies.find((c) => c.id === companyId);
      const companyName = company?.name || companyId;

      // Group by location within company
      const locationMap = new Map<string | null, Employee[]>();
      companyEmployees.forEach((emp) => {
        const loc = emp.location || null;
        if (!locationMap.has(loc)) locationMap.set(loc, []);
        locationMap.get(loc)!.push(emp);
      });

      // Sort employees within each location by extension (nulls last)
      const locations = Array.from(locationMap.entries())
        .sort(([a], [b]) => {
          if (a === null) return 1;
          if (b === null) return -1;
          return a.localeCompare(b);
        })
        .map(([location, emps]) => ({
          location,
          employees: emps.sort((a, b) => {
            if (!a.extension && !b.extension) return 0;
            if (!a.extension) return 1;
            if (!b.extension) return -1;
            return a.extension.localeCompare(b.extension, undefined, { numeric: true });
          }),
        }));

      grouped.push({ company: companyId, companyName, locations });
    });

    return grouped;
  }, [filteredEmployees, companies]);

  // Sort for "solo-extensiones" mode
  const sortedForCards = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      // Sort by extension ascending, nulls last
      if (!a.extension && !b.extension) return a.name.localeCompare(b.name);
      if (!a.extension) return 1;
      if (!b.extension) return -1;
      const extCompare = a.extension.localeCompare(b.extension, undefined, { numeric: true });
      if (extCompare !== 0) return extCompare;
      return a.name.localeCompare(b.name);
    });
  }, [filteredEmployees]);

  const totalCount = filteredEmployees.length;
  const totalEmployees = employees.length;

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleRowClick = useCallback(
    (employeeId: string) => {
      router.push(`/directorio/${employeeId}`);
    },
    [router]
  );

  const columnHeaders = ["Ext.", "Nombre", "Puesto", "Departamento", "Sucursal"];

  return (
    <div className="w-full" style={{ background: "#0A0C0F" }}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-white/5 print-hidden">
        <span
          className="uppercase tracking-widest shrink-0"
          style={{
            fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          DIRECTORIO RAPIDO -- EXTENSIONES
        </span>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sub-mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button
              onClick={() => setSubMode("completo")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                subMode === "completo" 
                  ? "bg-white/10 text-white" 
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Completo
            </button>
            <button
              onClick={() => setSubMode("solo-extensiones")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                subMode === "solo-extensiones" 
                  ? "bg-white/10 text-white" 
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              Solo Ext.
            </button>
          </div>

          {/* Reset columns button - only in completo mode */}
          {subMode === "completo" && (
            <button
              onClick={handleResetColumns}
              className="flex items-center gap-1 px-2 py-1 text-xs transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
              title="Resetear anchos de columnas"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline" style={{ fontSize: "0.7rem" }}>Reset columnas</span>
            </button>
          )}

          {/* Print/Export buttons */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Search Bar - only for solo-extensiones mode */}
      {subMode === "solo-extensiones" && (
        <div className="px-4 py-3 border-b border-white/5 print-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar nombre o extension..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full h-12 md:h-[52px] pl-11 pr-10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "1rem",
              }}
            />
            {internalSearch && (
              <button
                onClick={() => setInternalSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            )}
          </div>
          <p className="text-xs text-white/40 mt-2">
            {totalCount} resultado{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Completo Mode - Search Bar */}
      {subMode === "completo" && (
        <div className="px-4 py-3 border-b border-white/5 print-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar por nombre, extension o puesto..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            {internalSearch && (
              <button
                onClick={() => setInternalSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-3 h-3 text-white/60" />
              </button>
            )}
          </div>
          <p className="text-xs text-white/40 mt-2">
            Mostrando {totalCount} de {totalEmployees}
          </p>
        </div>
      )}

      {/* Print Header - only visible when printing */}
      <div className="hidden print-block mb-4 pb-2 border-b-2 border-black">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">GRUPO SHUMA -- DIRECTORIO DE EXTENSIONES</h1>
          <span className="text-sm">{new Date().toLocaleDateString("es-MX")}</span>
        </div>
      </div>

      {/* COMPLETO MODE - Table View with Resizable Columns */}
      {subMode === "completo" && (
        <div 
          className="overflow-x-auto overflow-y-auto"
          style={{ 
            maxHeight: "calc(100vh - 220px)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.15) transparent",
          }}
        >
          <table 
            ref={tableRef}
            className="w-full border-collapse"
            style={{ tableLayout: "fixed", minWidth: "600px" }}
          >
            <colgroup>
              {colWidths.map((width, i) => (
                <col 
                  key={i} 
                  style={{ 
                    width: `${width}px`,
                    minWidth: `${MIN_COL_WIDTHS[i]}px`,
                  }} 
                />
              ))}
            </colgroup>
            <thead className="print-thead sticky top-0 z-10" style={{ background: "#0A0C0F" }}>
              <tr
                className="text-left border-b border-white/5 print-thead-row"
                style={{ height: "36px" }}
              >
                {columnHeaders.map((header, idx) => {
                  const hiddenClasses = idx === 2 ? "hidden md:table-cell" : 
                                        idx === 3 ? "hidden lg:table-cell" : 
                                        idx === 4 ? "hidden xl:table-cell" : "";
                  return (
                    <th
                      key={header}
                      className={`px-3 relative select-none ${hiddenClasses} ${idx === 0 ? "text-center" : ""}`}
                      style={{
                        fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', monospace",
                        fontSize: "0.6rem",
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.35)",
                        textTransform: "uppercase",
                        width: colWidths[idx],
                        minWidth: MIN_COL_WIDTHS[idx],
                      }}
                    >
                      {header}
                      {idx < 4 && (
                        <ResizeHandle
                          onMouseDown={(e) => handleResizeStart(e, idx)}
                          isResizing={resizingCol === idx}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {groupedEmployees.map((group) => {
                const companyConfig = getCompanyConfig(group.company);
                const employeeCount = group.locations.reduce((a, l) => a + l.employees.length, 0);
                let rowIndex = 0;

                return (
                  <tbody
                    key={group.company}
                    className="print-no-break"
                  >
                    <CompanyHeader
                      companyName={group.companyName}
                      companyConfig={companyConfig}
                      employeeCount={employeeCount}
                    />
                    {group.locations.map((locationGroup, locIdx) => (
                      <>
                        {/* Show location sub-header only if multiple locations exist and location is defined */}
                        {group.locations.length > 1 && locationGroup.location && locIdx > 0 && (
                          <LocationSubHeader
                            key={`loc-${locationGroup.location}`}
                            location={locationGroup.location}
                          />
                        )}
                        {locationGroup.employees.map((employee) => {
                          const isOdd = rowIndex % 2 === 1;
                          rowIndex++;
                          return (
                            <ExtensionRow
                              key={employee.id}
                              employee={employee}
                              companyConfig={companyConfig}
                              onClick={() => handleRowClick(employee.id)}
                              isOdd={isOdd}
                              colWidths={colWidths}
                            />
                          );
                        })}
                      </>
                    ))}
                  </tbody>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SOLO EXTENSIONES MODE - Card Grid */}
      {subMode === "solo-extensiones" && (
        <div className="p-4">
          {totalCount > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {sortedForCards.map((employee) => {
                const companyConfig = getCompanyConfig(employee.company);
                return (
                  <ExtensionCard
                    key={employee.id}
                    employee={employee}
                    companyConfig={companyConfig}
                    onClick={() => handleRowClick(employee.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p className="text-white/40 mb-3">Sin resultados</p>
              <button
                onClick={() => setInternalSearch("")}
                className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white transition-colors"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                Limpiar busqueda
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state for completo mode */}
      {subMode === "completo" && totalCount === 0 && (
        <div className="text-center py-16 text-white/40">
          <p>No se encontraron empleados</p>
        </div>
      )}

      {/* Print footer */}
      <div className="hidden print-block mt-8 pt-2 border-t border-black text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>Confidencial -- Uso interno Grupo Shuma</span>
          <span>Pagina 1</span>
        </div>
      </div>
    </div>
  );
}
