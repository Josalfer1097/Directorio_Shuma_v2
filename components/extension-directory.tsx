"use client";

import { useState, useMemo, useCallback, memo, useRef, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Printer, Download, MapPin, Search, X, ClipboardList, Phone, RotateCcw } from "lucide-react";
import { getEmployees, getCompanies } from "@/lib/data";
import { getCompanyConfig, getAccentColor, alphaColor } from "@/lib/companyConfig";
import type { Employee } from "@/types";

type SubMode = "completo" | "solo-extensiones";

// Default column widths (in pixels for fixed, percentage for relative)
const DEFAULT_COL_WIDTHS = [72, 220, 180, 140, 120]; // EXT, NOMBRE, PUESTO, DEPT, SUCURSAL
const MIN_COL_WIDTHS = [50, 180, 100, 100, 80];
const STORAGE_KEY = "directorio-quick-col-widths";

// Memoized row component for performance
// Note: Column widths are controlled by <colgroup> + <col> elements, NOT by td styles
const ExtensionRow = memo(function ExtensionRow({
  employee,
  companyConfig,
  onClick,
  isOdd,
}: {
  employee: Employee;
  companyConfig: ReturnType<typeof getCompanyConfig>;
  onClick: () => void;
  isOdd: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition-all duration-150 hover:bg-muted/60 group active:scale-[0.99] ${
        isOdd ? "bg-muted/25" : "bg-transparent"
      }`}
      style={{
        height: "44px",
        minHeight: "44px",
        maxHeight: "44px",
      }}
    >
      {/* Extension */}
      <td 
        className="px-3 text-center"
        style={{ overflow: "hidden" }}
      >
        {employee.extension ? (
          <span
            className="inline-block font-mono font-bold text-scale-base"
            style={{
              color: getAccentColor(companyConfig),
              background: alphaColor(companyConfig, "1f"),
              borderRadius: "6px",
              padding: "2px 8px",
            }}
          >
            {employee.extension}
          </span>
        ) : (
          <span className="text-muted-foreground/50 text-scale-xs">--</span>
        )}
      </td>
      {/* Name */}
      <td
        className="px-3 font-medium text-foreground group-hover:text-foreground/90 text-scale-base truncate"
        title={employee.name}
      >
        {employee.name}
      </td>
      {/* Position */}
      <td
        className="px-3 hidden md:table-cell text-scale-sm text-foreground/90 truncate"
        title={employee.position ?? ""}
      >
        {employee.position ?? "--"}
      </td>
      {/* Department */}
      <td
        className="px-3 hidden lg:table-cell text-scale-sm text-foreground/75 truncate"
        title={employee.department ?? ""}
      >
        {employee.department ?? "--"}
      </td>
      {/* Location */}
      <td
        className="px-3 hidden xl:table-cell text-scale-xs text-muted-foreground truncate"
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
        background: alphaColor(companyConfig, "1a"),
        borderLeft: `3px solid ${getAccentColor(companyConfig)}`,
      }}
    >
      <td colSpan={5} className="px-4">
        <div className="flex items-center justify-between">
          <span
            className="font-neuropol uppercase tracking-widest text-scale-xs"
            style={{ color: getAccentColor(companyConfig) }}
          >
            {companyName}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-scale-xs bg-muted border border-border-subtle text-muted-foreground"
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
      className="h-7 border-t border-border-subtle"
    >
      <td colSpan={5} style={{ paddingLeft: "80px" }}>
        <span
          className="flex items-center gap-1 text-scale-xs text-muted-foreground"
        >
          <MapPin className="w-3 h-3" />
          {location}
        </span>
      </td>
    </tr>
  );
});

// Format name for display - shorten long names
function formatName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (fullName.length > 22 && parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }
  return fullName;
}

// Extension Card for Solo Extensiones mode - redesigned
const ExtensionCard = memo(function ExtensionCard({
  employee,
  companyConfig,
  onClick,
}: {
  employee: Employee;
  companyConfig: ReturnType<typeof getCompanyConfig>;
  onClick: () => void;
}) {
  const displayName = formatName(employee.name);
  
  return (
    <button
      onClick={onClick}
      title={employee.name}
      className="text-left w-full relative overflow-hidden cursor-pointer group touch-manipulation select-none"
      style={{
        minHeight: "96px",
        height: "auto",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeftWidth: "3px",
        borderLeftColor: getAccentColor(companyConfig),
        padding: "10px 12px",
        transition: "transform 80ms ease, box-shadow 150ms ease",
      }}
      onMouseEnter={(e) => {
        if (window.matchMedia('(hover: hover)').matches) {
          const el = e.currentTarget;
          const accent = getAccentColor(companyConfig);
          el.style.boxShadow = `0 0 0 1px rgba(${hexToRgb(accent)}, 0.20), 0 4px 16px rgba(${hexToRgb(accent)}, 0.10)`;
          el.style.background = "rgba(255,255,255,0.05)";
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "none";
        el.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      {/* Decorative watermark */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          right: "-6px",
          top: "-6px",
          fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', monospace",
          fontSize: "44px",
          fontWeight: 900,
          color: getAccentColor(companyConfig),
          opacity: 0.06,
          zIndex: 0,
        }}
      >
        {companyConfig.initial}
      </div>

      {/* Company dot */}
      <div
        className="absolute"
        style={{
          top: "8px",
          right: "10px",
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: getAccentColor(companyConfig),
          opacity: 0.5,
        }}
      />

      {/* Card content */}
      <div className="relative flex flex-col h-full" style={{ zIndex: 1 }}>
        {/* Employee name */}
        <p
          className="text-foreground leading-tight line-clamp-2 text-scale-sm font-semibold"
          style={{ wordBreak: "break-word" }}
        >
          {displayName}
        </p>

        {/* Extension pill */}
        {employee.extension ? (
          <div
            className="inline-flex items-center gap-[4px] w-fit mt-1.5"
            style={{
              background: `rgba(${hexToRgb(getAccentColor(companyConfig))}, 0.12)`,
              border: `1px solid rgba(${hexToRgb(getAccentColor(companyConfig))}, 0.25)`,
              borderRadius: "5px",
              padding: "2px 8px",
            }}
          >
            <Phone size={9} style={{ color: getAccentColor(companyConfig) }} />
            <span
              className="text-scale-base font-bold font-mono tracking-wide"
              style={{ color: getAccentColor(companyConfig) }}
            >
              {employee.extension}
            </span>
          </div>
        ) : (
          <span
            className="text-scale-xs italic mt-1.5 text-muted-foreground/40"
          >
            Sin ext.
          </span>
        )}
      </div>
    </button>
  );
});

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return "255, 255, 255";
}

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
    // Only save if different from defaults (compare values, not reference)
    const isDefault = colWidths.every((w, i) => w === DEFAULT_COL_WIDTHS[i]);
    if (!isDefault) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(colWidths));
    }
  }, [colWidths]);

  // Auto-focus search in solo-extensiones mode
  useEffect(() => {
    if (subMode === "solo-extensiones" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [subMode]);

  // Listen for quick-submode-change from navbar
  useEffect(() => {
    const handleQuickSubModeChange = (e: CustomEvent<SubMode>) => {
      setSubMode(e.detail);
    };
    window.addEventListener("quick-submode-change", handleQuickSubModeChange as EventListener);
    return () => window.removeEventListener("quick-submode-change", handleQuickSubModeChange as EventListener);
  }, []);

  // Load subMode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("directorio-quick-subMode");
    if (saved === "completo" || saved === "solo-extensiones") {
      setSubMode(saved);
    }
  }, []);

  // Persist subMode to localStorage
  useEffect(() => {
    localStorage.setItem("directorio-quick-subMode", subMode);
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
    const companyOrder = ['comercializadora', 'acabados', 'ferrecapital']
    
    const companyNames: Record<string, string> = {
      comercializadora: 'Comercializadora y Ferretería Shuma',
      acabados: 'Acabados Shuma',
      ferrecapital: 'Ferrecapital',
    }
    
    const companyColors: Record<string, string> = {
      comercializadora: '#0047AB',
      acabados: '#C0152A',
      ferrecapital: '#2C3338',
    }
  
    const date = new Date().toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  
    const grouped: Record<string, Employee[]> = {}
    companyOrder.forEach(id => {
      grouped[id] = employees
        .filter(e => e.company === id)
        .sort((a, b) => {
          if (!a.extension) return 1
          if (!b.extension) return -1
          return parseInt(a.extension) - parseInt(b.extension)
        })
    })
  
    const rowsHtml = companyOrder.map(companyId => {
      const emps = grouped[companyId]
      if (!emps || emps.length === 0) return ''
      
      const empRows = emps.map((emp, i) => `
        <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9f9f9'}">
          <td style="
            padding:5px 8px;
            font-family:'Courier New',monospace;
            font-weight:700;
            font-size:9pt;
            text-align:center;
            border-bottom:1px solid #e8e8e8;
            color:#000;
          ">${emp.extension ?? '—'}</td>
          <td style="
            padding:5px 8px;
            font-weight:600;
            font-size:8.5pt;
            border-bottom:1px solid #e8e8e8;
            color:#000;
          ">${emp.name}</td>
          <td style="
            padding:5px 8px;
            font-size:8pt;
            color:#333;
            border-bottom:1px solid #e8e8e8;
          ">${emp.position ?? '—'}</td>
          <td style="
            padding:5px 8px;
            font-size:8pt;
            color:#555;
            border-bottom:1px solid #e8e8e8;
          ">${emp.department ?? '—'}</td>
        </tr>
      `).join('')
  
      return `
        <tr>
          <td colspan="4" style="
            padding:8px 10px;
            background:#f0f0f0;
            border-left:4px solid ${companyColors[companyId]};
            font-weight:700;
            font-size:8.5pt;
            letter-spacing:0.08em;
            text-transform:uppercase;
            color:#000;
            padding-top:12px;
          ">
            ${companyNames[companyId]}
            <span style="font-weight:400;font-size:7.5pt;margin-left:8px;">
              (${emps.length} colaboradores)
            </span>
          </td>
        </tr>
        ${empRows}
      `
    }).join('')
  
    const html = `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Directorio de Extensiones — Grupo Shuma</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: Arial, sans-serif;
        background: white;
        color: #000;
        padding: 1.5cm 1.8cm;
        font-size: 9pt;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      col.col-ext  { width: 70px; }
      col.col-name { width: 28%; }
      col.col-pos  { width: 35%; }
      col.col-dept { width: 25%; }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 10px;
      }
      .header-title {
        font-size: 14pt;
        font-weight: 900;
        letter-spacing: 0.03em;
      }
      .header-sub {
        font-size: 8pt;
        color: #666;
        margin-top: 3px;
      }
      .header-date {
        font-size: 8pt;
        color: #666;
        text-align: right;
        line-height: 1.6;
      }
      .col-headers th {
        padding: 5px 8px;
        font-size: 7pt;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #000;
        border-bottom: 1.5px solid #000;
        text-align: left;
        background: white;
      }
      .footer {
        margin-top: 16px;
        padding-top: 8px;
        border-top: 1px solid #ccc;
        display: flex;
        justify-content: space-between;
        font-size: 7pt;
        color: #888;
      }
      .no-print { 
        position: fixed;
        top: 16px; right: 16px;
        background: #0047AB;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 13px;
        cursor: pointer;
        font-weight: 600;
        z-index: 999;
        font-family: Arial, sans-serif;
      }
      .no-print:hover { background: #002D6E; }
      @media print {
        .no-print { display: none !important; }
        @page { 
          size: Letter portrait; 
          margin: 1.5cm 1.8cm; 
        }
        body { 
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        tr { page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <button class="no-print" onclick="window.print()">
      🖨️ Imprimir / Guardar PDF
    </button>
  
    <div class="header">
      <div>
        <div class="header-title">GRUPO SHUMA — DIRECTORIO DE EXTENSIONES</div>
        <div class="header-sub">Uso interno · Confidencial</div>
      </div>
      <div class="header-date">
        ${date}<br>directorio.gruposhuma.com
      </div>
    </div>
  
    <table>
      <colgroup>
        <col class="col-ext">
        <col class="col-name">
        <col class="col-pos">
        <col class="col-dept">
      </colgroup>
      <thead>
        <tr class="col-headers">
          <th>Ext.</th>
          <th>Nombre</th>
          <th>Puesto</th>
          <th>Departamento</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  
    <div class="footer">
      <span>Confidencial — Uso interno Grupo Shuma</span>
      <span>Generado el ${date}</span>
    </div>
  </body>
  </html>`
  
    // Open popup window and print from it
    const popup = window.open('', '_blank', 
      'width=900,height=700,scrollbars=yes,resizable=yes')
    
    if (!popup) {
      alert('Tu navegador bloqueó la ventana emergente. ' +
            'Permite popups para directorio.gruposhuma.com')
      return
    }
  
    popup.document.write(html)
    popup.document.close()
    
    // Wait for content to render then print
    popup.onload = () => {
      setTimeout(() => popup.print(), 300)
    }
    
    // Fallback if onload doesn't fire
    setTimeout(() => {
      try { popup.print() } catch {}
    }, 800)
  }, [employees]);

  const handleRowClick = useCallback(
    (employeeId: string) => {
      router.push(`/directorio/${employeeId}`);
    },
    [router]
  );

  const columnHeaders = ["Ext.", "Nombre", "Puesto", "Departamento", "Sucursal"];

  return (
    <div className="w-full bg-background dark:bg-[#0A0C0F]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-border-subtle print-hidden">
        <span
          className="uppercase tracking-widest shrink-0 font-neuropol text-scale-xs text-muted-foreground"
          style={{ letterSpacing: "0.2em" }}
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
              <span className="hidden sm:inline text-scale-xs">Reset columnas</span>
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
            onClick={() => {
              const company = selectedCompanies.length === 1 ? selectedCompanies[0] : 'all';
              window.open(
                `/print?company=${company}`, 
                '_blank',
                'noopener,noreferrer'
              )
            }}
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
          <div 
            className="relative"
            style={{
              height: "52px",
            }}
          >
            <Search 
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5" 
              style={{ left: "18px", color: "rgba(255,255,255,0.22)" }}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar nombre o extension..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full h-full text-white focus:outline-none"
              style={{
                paddingLeft: "50px",
                paddingRight: internalSearch ? "48px" : "18px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid rgba(255,255,255,0.10)",
                fontSize: "16px", // 16px minimum prevents iOS Safari auto-zoom on focus
                transition: "border-color 150ms, box-shadow 150ms",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#00C9A7";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,201,167,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {internalSearch && (
              <button
                onClick={() => setInternalSearch("")}
                className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                style={{
                  right: "12px",
                  width: "24px",
                  height: "24px",
                }}
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            )}
          </div>
          {/* Result count pill */}
          <div
            className="inline-block mt-2 px-3 py-0.5 rounded-full text-scale-xs bg-muted border border-border-subtle text-muted-foreground"
          >
            {totalCount} resultado{totalCount !== 1 ? "s" : ""}
          </div>
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
              className="w-full h-10 pl-10 pr-10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "16px", // 16px minimum prevents iOS Safari auto-zoom on focus
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
            <thead className="print-thead sticky top-0 z-10 bg-background">
              <tr
                className="text-left border-b border-border-subtle print-thead-row"
                style={{ height: "36px" }}
              >
                {columnHeaders.map((header, idx) => {
                  const hiddenClasses = idx === 2 ? "hidden md:table-cell" : 
                                        idx === 3 ? "hidden lg:table-cell" : 
                                        idx === 4 ? "hidden xl:table-cell" : "";
                  return (
                    <th
                      key={header}
                      className={`px-3 relative select-none font-neuropol text-scale-xs tracking-wide text-muted-foreground uppercase truncate ${hiddenClasses} ${idx === 0 ? "text-center" : ""}`}
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
                    <Fragment key={locationGroup.location ?? `loc-${locIdx}`}>
                      {/* Show location sub-header only if multiple locations exist and location is defined */}
                      {group.locations.length > 1 && locationGroup.location && locIdx > 0 && (
                        <LocationSubHeader
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
                          />
                        );
                      })}
                    </Fragment>
                  ))}
                </tbody>
              );
            })}
          </table>
        </div>
      )}

      {/* SOLO EXTENSIONES MODE - Card Grid */}
      {subMode === "solo-extensiones" && (
        <div className="flex-1 min-w-0 overflow-hidden p-4">
          {totalCount > 0 ? (
            <div 
              className="w-full"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "10px",
              }}
            >
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
