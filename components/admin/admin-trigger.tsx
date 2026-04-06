"use client";

import { useEffect, useRef } from "react";
import { useAdmin } from "./admin-context";

export function AdminTrigger() {
  const { openPinModal, isAuthenticated } = useAdmin();

  // Keyboard shortcut: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        if (!isAuthenticated) {
          openPinModal();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openPinModal, isAuthenticated]);

  // Handle custom event from Navbar (for long-press)
  useEffect(() => {
    const handleCustomTrigger = () => {
      if (!isAuthenticated) openPinModal();
    };
    window.addEventListener("trigger-pin-overlay", handleCustomTrigger);
    return () => window.removeEventListener("trigger-pin-overlay", handleCustomTrigger);
  }, [openPinModal, isAuthenticated]);

  return null;
}
