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

  const handleClose = () => {
    setCurrentAction(null);
    setSelectedEmployeeId(null);
  };

  return (
    <>
      {/* Floating Admin Toolbar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 p-2 bg-[--bg-surface]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl"
      >
        {/* Add Employee */}
        <button
          onClick={() => setCurrentAction("add")}
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-colors text-text-primary"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline font-dm-sans text-sm">Agregar empleado</span>
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-colors text-text-muted hover:text-text-primary"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline font-dm-sans text-sm">Salir</span>
        </button>
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
