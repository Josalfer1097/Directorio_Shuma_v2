"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Company } from "@/types";
import { getCompanyConfig } from "@/lib/companyConfig";

// Spring animation for bottom sheet
const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 35,
};

interface MobileFiltersBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  departments: string[];
  locations: string[];
  selectedCompanies: string[];
  selectedDepartment: string;
  selectedLocations: string[];
  onCompanyChange: (companies: string[]) => void;
  onDepartmentChange: (department: string) => void;
  onLocationChange: (locations: string[]) => void;
  onClearFilters: () => void;
  onApply: () => void;
}

export function MobileFiltersBottomSheet({
  isOpen,
  onClose,
  companies,
  departments,
  locations,
  selectedCompanies,
  selectedDepartment,
  selectedLocations,
  onCompanyChange,
  onDepartmentChange,
  onLocationChange,
  onClearFilters,
  onApply,
}: MobileFiltersBottomSheetProps) {
  const [localCompanies, setLocalCompanies] = useState(selectedCompanies || []);
  const [localDepartment, setLocalDepartment] = useState(selectedDepartment || "all");
  const [localLocations, setLocalLocations] = useState(selectedLocations || []);

  useEffect(() => {
    setLocalCompanies(selectedCompanies);
    setLocalDepartment(selectedDepartment);
    setLocalLocations(selectedLocations);
  }, [selectedCompanies, selectedDepartment, selectedLocations]);

  const activeFilterCount =
    (localCompanies?.length || 0) +
    (localDepartment !== "all" ? 1 : 0) +
    (localLocations?.length || 0);

  const toggleCompany = (companyId: string) => {
    setLocalCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((c) => c !== companyId)
        : [...prev, companyId]
    );
  };

  const toggleLocation = (location: string) => {
    setLocalLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleApply = () => {
    onCompanyChange(localCompanies);
    onDepartmentChange(localDepartment);
    onLocationChange(localLocations);
    onApply();
    onClose();
  };

  const handleClearAll = () => {
    onClearFilters();
    setLocalCompanies([]);
    setLocalDepartment("all");
    setLocalLocations([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={springTransition}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, { velocity }) => {
              if (velocity.y > 20) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden shadow-2xl safe-bottom bg-card border border-border"
            style={{ 
              height: "70vh", 
              maxHeight: "70vh",
              borderRadius: "20px 20px 0 0",
              WebkitBackdropFilter: "blur(20px)",
              backdropFilter: "blur(20px)",
              borderBottom: "none",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="rounded-full bg-foreground/20" style={{ width: "32px", height: "4px" }} />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-[--border-subtle]">
              <div className="flex-1" />

              <h2 className="text-lg font-semibold text-foreground flex-1 text-center">
                Filtros
              </h2>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Clear all link */}
            {activeFilterCount > 0 && (
              <div className="px-4 pt-3 flex justify-end">
                <button
                  onClick={handleClearAll}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Limpiar todo
                </button>
              </div>
            )}

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6 touch-scroll" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
              {/* Empresas - Horizontal pills */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Empresa</h3>
                <div className="flex flex-wrap gap-2">
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => toggleCompany(company.id)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-150 touch-manipulation min-h-[44px] ${
                        localCompanies.includes(company.id)
                          ? "text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                      style={{
                        backgroundColor: localCompanies.includes(company.id)
                          ? getCompanyConfig(company.id).primary
                          : undefined,
                      }}
                    >
                      {company.shortName || company.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Departamento - Vertical list with radio buttons for single selection */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Departamento
                </h3>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setLocalDepartment("all")}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors min-h-[44px] touch-manipulation ${
                      localDepartment === "all" 
                        ? "bg-primary/10 border border-primary/30" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      localDepartment === "all" 
                        ? "border-primary" 
                        : "border-muted-foreground"
                    }`}>
                      {localDepartment === "all" && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      localDepartment === "all" 
                        ? "text-foreground font-medium" 
                        : "text-foreground"
                    }`}>
                      Todos los departamentos
                    </span>
                  </button>
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setLocalDepartment(dept)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors min-h-[44px] touch-manipulation ${
                        localDepartment === dept 
                          ? "bg-primary/10 border border-primary/30" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        localDepartment === dept 
                          ? "border-primary" 
                          : "border-muted-foreground"
                      }`}>
                        {localDepartment === dept && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        localDepartment === dept 
                          ? "text-foreground font-medium" 
                          : "text-foreground"
                      }`}>
                        {dept}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sucursal - Horizontal pills like empresas */}
              {locations && locations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Sucursal</h3>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => toggleLocation(location)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-150 touch-manipulation min-h-[44px] ${
                          localLocations.includes(location)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fixed footer button */}
            <div className="sticky bottom-0 p-4 border-t border-border bg-card rounded-b-2xl">
              <Button
                onClick={handleApply}
                size="lg"
                className="w-full gap-2 bg-primary text-primary-foreground"
              >
                Aplicar filtros {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
