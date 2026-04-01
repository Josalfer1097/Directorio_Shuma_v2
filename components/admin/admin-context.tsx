"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface AdminContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  showPinModal: boolean;
  openPinModal: () => void;
  closePinModal: () => void;
  authenticate: (pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+A to open PIN modal
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setShowPinModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/pin");
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setShowPinModal(false);
        return { success: true };
      }

      return { success: false, error: data.error || "PIN incorrecto" };
    } catch (error) {
      return { success: false, error: "Error de conexión" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/pin", { method: "DELETE" });
    } finally {
      setIsAuthenticated(false);
    }
  }, []);

  const openPinModal = useCallback(() => setShowPinModal(true), []);
  const closePinModal = useCallback(() => setShowPinModal(false), []);

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        showPinModal,
        openPinModal,
        closePinModal,
        authenticate,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
