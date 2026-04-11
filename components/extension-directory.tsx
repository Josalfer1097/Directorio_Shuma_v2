"use client";

import { useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Printer, Download, MapPin } from "lucide-react";
import { getEmployees, getCompanies } from "@/lib/data";
import { getCompanyConfig } from "@/lib/companyConfig";
import type { Employee } from "@/types";

// Memoized row component for performance
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
      className="cursor-pointer transition-colors duration-150 hover:bg-white/[0.03] group"
      style={{
        height: "40px",
        background: isOdd ? "rgba(255,255,255,0.015)" : "transparent",
      }}
    >
      {/* Extension */}
      <td className="px-3 text-center" style={{ width: "80px" }}>
        {employee.extension ? (
          <span
            className="inline-block font-mono font-bold"
            style={{
              fontSize: "0.95rem",
              color: companyConfig.primary,
              background: `${companyConfig.primary}1f`,
              borderRadius: "6px",
              padding: "2px 8px",
            }}
          >
            {employee.extension}
          </span>
        ) : (
          <span className="text-white/20 text-xs">—</span>
        )}
      </td>
      {/* Name */}
      <td
        className="px-3 font-medium text-white group-hover:text-white/90"
        style={{ fontSize: "0.85rem", width: "220px" }}
      >
        {employee.name}
      </td>
      {/* Position */}
      <td
        className="px-3 hidden md:table-cell"
        style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", width: "200px" }}
      >
        {employee.position ?? "—"}
      </td>
      {/* Department */}
      <td
        className="px-3 hidden lg:table-cell"
        style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", width: "160px" }}
      >
        {employee.department ?? "—"}
      </td>
      {/* Location */}
      <td
        className="px-3 hidden xl:table-cell"
        style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", width: "130px" }}
      >
        {employee.location ?? "—"}
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
              fontFamily: "'Neuropol', sans-serif",
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
  searchQuery,
}: ExtensionDirectoryProps) {
  const router = useRouter();
  const employees = getEmployees();
  const companies = getCompanies();

  // Filter and group employees
  const groupedEmployees = useMemo(() => {
    let filtered = employees;

    // Apply filters
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

    // Group by company, then by location
    const companyOrder = ["comercializadora", "ferrecapital", "acabados", "arkiramica"];
    const grouped: {
      company: string;
      companyName: string;
      locations: { location: string | null; employees: Employee[] }[];
    }[] = [];

    companyOrder.forEach((companyId) => {
      const companyEmployees = filtered.filter((emp) => emp.company === companyId);
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
  }, [employees, companies, selectedCompanies, selectedDepartment, selectedLocations, searchQuery]);

  const totalCount = useMemo(
    () => groupedEmployees.reduce((acc, g) => acc + g.locations.reduce((a, l) => a + l.employees.length, 0), 0),
    [groupedEmployees]
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleRowClick = useCallback(
    (employeeId: string) => {
      router.push(`/directorio/${employeeId}`);
    },
    [router]
  );

  return (
    <div className="w-full" style={{ background: "#0A0C0F" }}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 print-hidden">
        <span
          className="font-neuropol uppercase tracking-widest"
          style={{
            fontFamily: "'Neuropol', sans-serif",
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          DIRECTORIO RAPIDO — EXTENSIONES
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 h-[34px] rounded-lg transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.8rem",
            }}
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 h-[34px] rounded-lg transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.8rem",
            }}
          >
            <Download className="w-4 h-4" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Print Header - only visible when printing */}
      <div className="hidden print-block mb-4 pb-2 border-b-2 border-black">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">GRUPO SHUMA — DIRECTORIO DE EXTENSIONES</h1>
          <span className="text-sm">{new Date().toLocaleDateString("es-MX")}</span>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead className="print-thead">
          <tr
            className="text-left border-b border-white/5 print-thead-row"
            style={{ height: "32px" }}
          >
            <th
              className="px-3 text-center font-neuropol uppercase"
              style={{
                fontFamily: "'Neuropol', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                width: "80px",
              }}
            >
              Ext.
            </th>
            <th
              className="px-3 font-neuropol uppercase"
              style={{
                fontFamily: "'Neuropol', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                width: "220px",
              }}
            >
              Nombre
            </th>
            <th
              className="px-3 font-neuropol uppercase hidden md:table-cell"
              style={{
                fontFamily: "'Neuropol', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                width: "200px",
              }}
            >
              Puesto
            </th>
            <th
              className="px-3 font-neuropol uppercase hidden lg:table-cell"
              style={{
                fontFamily: "'Neuropol', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                width: "160px",
              }}
            >
              Departamento
            </th>
            <th
              className="px-3 font-neuropol uppercase hidden xl:table-cell"
              style={{
                fontFamily: "'Neuropol', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                width: "130px",
              }}
            >
              Sucursal
            </th>
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

      {/* Empty state */}
      {totalCount === 0 && (
        <div className="text-center py-16 text-white/40">
          <p>No se encontraron empleados</p>
        </div>
      )}

      {/* Print footer */}
      <div className="hidden print-block mt-8 pt-2 border-t border-black text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>Confidencial — Uso interno Grupo Shuma</span>
          <span>Pagina 1</span>
        </div>
      </div>
    </div>
  );
}
