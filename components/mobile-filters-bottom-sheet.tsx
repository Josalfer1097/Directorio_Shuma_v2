"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Company } from "@/types";

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
  selectedCompanies: string[];
  selectedDepartment: string;
  onCompanyChange: (companies: string[]) => void;
  onDepartmentChange: (department: string) => void;
  onClearFilters: () => void;
  onApply: () => void;
}

export function MobileFiltersBottomSheet({
  isOpen,
  onClose,
  companies,
  departments,
  selectedCompanies,
  selectedDepartment,
  onCompanyChange,
  onDepartmentChange,
  onClearFilters,
  onApply,
}: MobileFiltersBottomSheetProps) {
  const [localCompanies, setLocalCompanies] = useState(selectedCompanies);
  const [localDepartment, setLocalDepartment] = useState(selectedDepartment);

  useEffect(() => {
    setLocalCompanies(selectedCompanies);
    setLocalDepartment(selectedDepartment);
  }, [selectedCompanies, selectedDepartment]);

  const activeFilterCount =
    localCompanies.length +
    (localDepartment !== "all" ? 1 : 0);

  const toggleCompany = (companyId: string) => {
    setLocalCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((c) => c !== companyId)
        : [...prev, companyId]
    );
  };

  const handleApply = () => {
    onCompanyChange(localCompanies);
    onDepartmentChange(localDepartment);
    onApply();
    onClose();
  };

  const handleClearAll = () => {
    setLocalCompanies([]);
    setLocalDepartment("all");
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
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card rounded-t-2xl border-t border-border shadow-2xl"
            style={{ height: "65vh", maxHeight: "65vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card rounded-t-2xl">
              {/* Drag handle */}
              <div className="flex-1 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

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
            <div className="overflow-y-auto flex-1 p-4 space-y-6">
              {/* Empresas - Horizontal pills */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Empresa</h3>
                <div className="flex flex-wrap gap-2">
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => toggleCompany(company.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                        localCompanies.includes(company.id)
                          ? "text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                      style={{
                        backgroundColor: localCompanies.includes(company.id)
                          ? company.color
                          : undefined,
                      }}
                    >
                      {company.shortName || company.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Departamento - Vertical list with checkboxes */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Departamento
                </h3>
                <div className="space-y-1">
                  <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <Checkbox
                      checked={localDepartment === "all"}
                      onCheckedChange={() => setLocalDepartment("all")}
                    />
                    <span className="text-sm text-foreground">
                      Todos los departamentos
                    </span>
                  </label>
                  {departments.map((dept) => (
                    <label
                      key={dept}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    >
                      <Checkbox
                        checked={localDepartment === dept}
                        onCheckedChange={() => setLocalDepartment(dept)}
                      />
                      <span className="text-sm text-foreground">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>
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
