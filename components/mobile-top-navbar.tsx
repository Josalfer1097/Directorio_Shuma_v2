"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Moon, Sun, Lock, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileTopNavbar() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo icon only */}
        <Link href="/" className="relative">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center group">
            <Building2 className="w-5 h-5 text-primary-foreground" />
            <div className="absolute inset-0 rounded-lg bg-primary/50 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-[180ms]" />
          </div>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="touch-target"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
          )}

          <Link href="/admin">
            <Button variant="ghost" size="icon" className="touch-target">
              <Lock className="w-4 h-4" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="touch-target"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground px-2">Menu secundario</p>
              <p className="text-xs text-muted-foreground px-2">Accesible desde la barra inferior</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
