"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Company } from "@/types";

interface FilterChipsProps {
  selectedCompanies: string[];
  selectedDepartment: string;
  selectedLocations: string[];
  companies: Company[];
  onRemoveCompany: (companyId: string) => void;
  onRemoveDepartment: () => void;
  onRemoveLocation: (location: string) => void;
  onClearAll: () => void;
}

export function FilterChips({
  selectedCompanies,
  selectedDepartment,
  selectedLocations,
  companies,
  onRemoveCompany,
  onRemoveDepartment,
  onRemoveLocation,
  onClearAll,
}: FilterChipsProps) {
  const hasActiveFilters =
    selectedCompanies.length > 0 ||
    selectedDepartment !== "all" ||
    selectedLocations.length > 0;

  if (!hasActiveFilters) return null;

  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.shortName || company?.name || companyId;
  };

  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible md:flex-wrap scrollbar-hide">
      <AnimatePresence mode="popLayout">
        {/* Company chips */}
        {selectedCompanies.map((companyId) => (
          <motion.button
            key={`company-${companyId}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => onRemoveCompany(companyId)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors group flex-shrink-0"
            aria-label={`Remover filtro de empresa: ${getCompanyName(companyId)}`}
          >
            <span aria-hidden="true">🏢</span>
            <span className="font-neuropol tracking-wide">{getCompanyName(companyId)}</span>
            <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}

        {/* Department chip */}
        {selectedDepartment !== "all" && (
          <motion.button
            key={`dept-${selectedDepartment}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={onRemoveDepartment}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium hover:bg-secondary/70 transition-colors group flex-shrink-0"
            aria-label={`Remover filtro de departamento: ${selectedDepartment}`}
          >
            <span aria-hidden="true">🏬</span>
            <span>{selectedDepartment}</span>
            <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}

        {/* Location chips */}
        {selectedLocations.map((location) => (
          <motion.button
            key={`location-${location}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => onRemoveLocation(location)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors group flex-shrink-0"
            aria-label={`Remover filtro de sucursal: ${location}`}
          >
            <span aria-hidden="true">📍</span>
            <span>{location}</span>
            <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Clear all button */}
      <button
        onClick={onClearAll}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 flex-shrink-0 whitespace-nowrap"
        aria-label="Limpiar todos los filtros"
      >
        Limpiar todo
      </button>
    </div>
  );
}
