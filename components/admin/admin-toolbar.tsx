"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, LogOut, Users } from "lucide-react";
import { useAdmin } from "./admin-context";
import { Button } from "@/components/ui/button";
import { EmployeeFormModal } from "./employee-form-modal";
import { EmployeeSelectModal } from "./employee-select-modal";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import { cn } from "@/lib/utils";

type AdminAction = "add" | "edit" | "delete" | null;

export function AdminToolbar() {
  const { isAuthenticated, logout, isLoading } = useAdmin();
  const [currentAction, setCurrentAction] = useState<AdminAction>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  if (isLoading || !isAuthenticated) return null;

  const handleEditSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setCurrentAction("edit");
  };

  const handleDeleteSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setCurrentAction("delete");
  };

  const handleClose = () => {
    setCurrentAction(null);
    setSelectedEmployeeId(null);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Floating Admin Toolbar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "admin-toolbar fixed bottom-4 left-1/2 -translate-x-1/2 z-40",
          "flex items-center gap-2 p-2",
          "bg-card/95 backdrop-blur-xl border border-primary/20",
          "rounded-full shadow-2xl shadow-black/30"
        )}
      >
        {/* Admin indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mr-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary">Admin</span>
        </div>

        {/* Add Employee */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentAction("add")}
          className="gap-2 btn-press hover:bg-primary/10 hover:text-primary"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Agregar</span>
        </Button>

        {/* Edit Employee */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentAction("edit-select")}
          className="gap-2 btn-press hover:bg-primary/10 hover:text-primary"
        >
          <Edit className="w-4 h-4" />
          <span className="hidden sm:inline">Editar</span>
        </Button>

        {/* Delete Employee */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentAction("delete-select")}
          className="gap-2 btn-press hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Eliminar</span>
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-2 btn-press text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </motion.div>

      {/* Modals */}
      <EmployeeFormModal
        isOpen={currentAction === "add"}
        onClose={handleClose}
        mode="add"
      />

      <EmployeeSelectModal
        isOpen={currentAction === "edit-select"}
        onClose={handleClose}
        onSelect={handleEditSelect}
        title="Seleccionar empleado para editar"
      />

      <EmployeeFormModal
        isOpen={currentAction === "edit" && !!selectedEmployeeId}
        onClose={handleClose}
        mode="edit"
        employeeId={selectedEmployeeId || undefined}
      />

      <EmployeeSelectModal
        isOpen={currentAction === "delete-select"}
        onClose={handleClose}
        onSelect={handleDeleteSelect}
        title="Seleccionar empleado para eliminar"
      />

      <DeleteConfirmModal
        isOpen={currentAction === "delete" && !!selectedEmployeeId}
        onClose={handleClose}
        employeeId={selectedEmployeeId || undefined}
      />
    </>
  );
}
