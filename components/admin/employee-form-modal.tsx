"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEmployeeById, getEmployees, getCompanies, getDepartments } from "@/lib/data";
import type { Employee } from "@/types";
import { cn } from "@/lib/utils";

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  employeeId?: string;
}

interface FormData {
  id: string;
  name: string;
  position: string;
  department: string;
  company: string;
  email: string;
  phone: string;
  reportsTo: string;
}

const initialFormData: FormData = {
  id: "",
  name: "",
  position: "",
  department: "",
  company: "comercializadora-shuma",
  email: "",
  phone: "",
  reportsTo: "",
};

export function EmployeeFormModal({
  isOpen,
  onClose,
  mode,
  employeeId,
}: EmployeeFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companies = getCompanies().filter(c => !c.disabled);
  const departments = getDepartments();
  const employees = getEmployees();

  useEffect(() => {
    if (mode === "edit" && employeeId) {
      const employee = getEmployeeById(employeeId);
      if (employee) {
        setFormData({
          id: employee.id,
          name: employee.name,
          position: employee.position,
          department: employee.department,
          company: employee.company,
          email: employee.email,
          phone: employee.phone,
          reportsTo: employee.reportsTo || "",
        });
      }
    } else {
      // Generate new ID for add mode
      const newId = `emp${Date.now()}`;
      setFormData({ ...initialFormData, id: newId });
    }
  }, [mode, employeeId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.name || !formData.position || !formData.department || !formData.email) {
      toast.error("Por favor completa todos los campos requeridos");
      setIsSubmitting(false);
      return;
    }

    try {
      // In a real app, this would POST to an API
      // For now, we just show a success message
      if (mode === "add") {
        toast.success("Empleado agregado correctamente", {
          description: "Los cambios se reflejarán después de actualizar los datos.",
        });
      } else {
        toast.success("Empleado actualizado correctamente", {
          description: "Los cambios se reflejarán después de actualizar los datos.",
        });
      }

      // Log the data that would be saved
      console.log("[v0] Employee data to save:", {
        ...formData,
        reportsTo: formData.reportsTo || null,
        avatar: null,
      });

      onClose();
    } catch (error) {
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Filter potential managers (exclude self in edit mode)
  const potentialManagers = employees.filter((emp) => emp.id !== formData.id);

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
              "relative w-full max-w-lg max-h-[90vh] overflow-y-auto",
              "bg-card border border-border rounded-xl shadow-2xl"
            )}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur-sm rounded-t-xl">
              <h2 className="text-lg font-semibold text-foreground">
                {mode === "add" ? "Agregar Empleado" : "Editar Empleado"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Juan Pérez García"
                  required
                />
              </div>

              {/* Position (free text) */}
              <div className="space-y-2">
                <Label htmlFor="position">Puesto *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  placeholder="Gerente de Ventas"
                  required
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleChange("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Empresa *</Label>
                <Select
                  value={formData.company}
                  onValueChange={(value) => handleChange("company", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: company.colors.primary }}
                          />
                          {company.shortName || company.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="juan.perez@empresa.mx"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+52 55 1234 5678"
                />
              </div>

              {/* Reports To */}
              <div className="space-y-2">
                <Label htmlFor="reportsTo">Reporta a</Label>
                <Select
                  value={formData.reportsTo}
                  onValueChange={(value) => handleChange("reportsTo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin supervisor directo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin supervisor directo</SelectItem>
                    {potentialManagers.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} - {emp.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
