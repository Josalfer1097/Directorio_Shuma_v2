"use client";

import { useAdmin } from "./admin-context";
import { cn } from "@/lib/utils";

export function AdminTrigger() {
  const { openPinModal, isAuthenticated } = useAdmin();

  // Don't show if already authenticated
  if (isAuthenticated) return null;

  return (
    <button
      onClick={openPinModal}
      className={cn(
        "fixed bottom-20 right-4 z-30 md:hidden",
        "w-10 h-10 rounded-full",
        "bg-card/50 border border-border/30",
        "flex items-center justify-center",
        "opacity-20 hover:opacity-60 transition-opacity",
        "touch-target"
      )}
      aria-label="Acceso administrativo"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
    </button>
  );
}
