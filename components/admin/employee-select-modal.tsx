"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getEmployees, getCompanyById } from "@/lib/data";
import { cn } from "@/lib/utils";
import { getCompanyConfig } from "@/lib/companyConfig";

interface EmployeeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (employeeId: string) => void;
  title: string;
}

export function EmployeeSelectModal({
  isOpen,
  onClose,
  onSelect,
  title,
}: EmployeeSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const employees = getEmployees();

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleSelect = (employeeId: string) => {
    onSelect(employeeId);
    setSearchQuery("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-md max-h-[80vh] overflow-hidden",
              "bg-card border border-border rounded-xl shadow-2xl",
              "flex flex-col"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empleado..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Employee List */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron empleados
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredEmployees.map((employee) => {
                    const company = getCompanyById(employee.company);
                    return (
                      <button
                        key={employee.id}
                        onClick={() => handleSelect(employee.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg",
                          "text-left transition-colors",
                          "hover:bg-muted/50"
                        )}
                      >
                        <Avatar className="w-10 h-10 border border-border">
                          <AvatarFallback
                            style={{
                              backgroundColor: `${company?.color}20`,
                              color: company?.color,
                            }}
                          >
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {employee.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {employee.position} · {employee.department}
                          </p>
                        </div>
                        {company && (
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: getCompanyConfig(company?.id).primary }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
