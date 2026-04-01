"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getEmployeeById, getCompanyById } from "@/lib/data";
import { cn } from "@/lib/utils";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  employeeId,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const employee = employeeId ? getEmployeeById(employeeId) : null;
  const company = employee ? getCompanyById(employee.company) : null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleDelete = async () => {
    if (!employee) return;

    setIsDeleting(true);

    try {
      // In a real app, this would DELETE to an API
      // For now, we just show a success message
      toast.success("Empleado eliminado correctamente", {
        description: "Los cambios se reflejarán después de actualizar los datos.",
      });

      console.log("[v0] Employee deleted:", employee.id);

      onClose();
    } catch (error) {
      toast.error("Error al eliminar el empleado");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!employee) return null;

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
              "relative w-full max-w-sm",
              "bg-card border border-border rounded-xl shadow-2xl p-6"
            )}
          >
            {/* Warning icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-foreground text-center mb-2">
              Eliminar empleado
            </h2>

            <p className="text-sm text-muted-foreground text-center mb-6">
              ¿Estás seguro de que deseas eliminar a este empleado? Esta acción
              no se puede deshacer.
            </p>

            {/* Employee card */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-6">
              <Avatar className="w-12 h-12 border border-border">
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
                  {employee.position}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
