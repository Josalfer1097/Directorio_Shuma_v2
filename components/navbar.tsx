"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { LayoutGrid, List, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ViewMode } from "@/types";
import { cn } from "@/lib/utils";
import { getEmployees } from "@/lib/data";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const employeeCount = useMemo(() => getEmployees().length, []);

  useEffect(() => {
    setMounted(true);
    const savedViewMode = localStorage.getItem("shuma-view-mode") as ViewMode;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleViewMode = () => {
    const nextView = viewMode === "grid" ? "compact" : "grid";
    setViewMode(nextView);
    localStorage.setItem("shuma-view-mode", nextView);
    window.dispatchEvent(new CustomEvent("view-mode-change", { detail: nextView }));
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("trigger-pin-overlay"));
    }, 1500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  if (!mounted) return null;

  return (
    <>
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[64px] flex items-center",
        scrolled
          ? "bg-[--bg-base]/88 backdrop-blur-xl border-b border-white/8 saturate-[180%]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <nav className="container mx-auto px-4 flex items-center justify-between">
          <Link
            href="/"
            style={{ fontFamily: "'Neuropol', sans-serif" }}
            className="text-lg tracking-wider"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
          >
            <span className="text-[#F2F0EC]" style={{ fontFamily: "'Neuropol', sans-serif" }}>DIRECTO</span>
            <span className="animate-gradient-text" style={{ fontFamily: "'Neuropol', sans-serif" }}>RIO</span>
          </Link>

        <div className="flex items-center gap-6">
          {/* Desktop Navigation Links */}
          <Link 
            href="/directorio" 
            className={cn(
              "hidden md:flex items-center gap-2 font-neuropol text-[12px] uppercase tracking-wider transition-colors active:scale-95 relative",
              pathname === "/directorio" ? "text-text-primary" : "text-text-muted hover:text-text-primary"
            )}
          >
            Directorio
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-white/8 border border-white/12 text-white/60">
              {employeeCount}
            </span>
            {pathname === "/directorio" && (
              <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C9A84C] to-[#E0C060] rounded-full" />
            )}
          </Link>
          <Link 
            href="/organigrama" 
            className={cn(
              "hidden md:block font-neuropol text-[12px] uppercase tracking-wider transition-colors active:scale-95 relative",
              pathname === "/organigrama" ? "text-text-primary" : "text-text-muted hover:text-text-primary"
            )}
          >
            Organigrama
            {pathname === "/organigrama" && (
              <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C9A84C] to-[#E0C060] rounded-full" />
            )}
          </Link>

          {/* View Toggle - Always visible */}
          <button
            onClick={toggleViewMode}
            className="p-2 text-text-muted hover:text-text-primary transition-all active:scale-95 group relative"
            title={viewMode === "grid" ? "Vista compacta" : "Vista tarjetas"}
          >
            {viewMode === "grid" ? (
              <LayoutGrid className="w-5 h-5 transition-transform group-hover:scale-110" />
            ) : (
              <List className="w-5 h-5 transition-transform group-hover:scale-110" />
            )}
            <div className="absolute inset-0 rounded-full blur-[8px] opacity-0 group-hover:opacity-100 bg-gradient-to-r from-irid-a to-irid-b transition-opacity -z-10" />
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text-primary transition-all active:scale-95 relative z-[60]"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <motion.div
              animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.div>
          </button>
        </div>
      </nav>
    </header>

    {/* Mobile Menu Dropdown */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-[64px] left-0 right-0 z-50 md:hidden bg-[--bg-surface]/95 backdrop-blur-xl border-b border-white/8"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
              <Link 
                href="/directorio"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "font-neuropol text-base uppercase tracking-wider py-3 px-4 rounded-lg transition-all",
                  pathname === "/directorio" 
                    ? "text-text-primary bg-white/5" 
                    : "text-text-muted hover:text-text-primary hover:bg-white/5"
                )}
              >
                Directorio
              </Link>
              <Link 
                href="/organigrama"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "font-neuropol text-base uppercase tracking-wider py-3 px-4 rounded-lg transition-all",
                  pathname === "/organigrama" 
                    ? "text-text-primary bg-white/5" 
                    : "text-text-muted hover:text-text-primary hover:bg-white/5"
                )}
              >
                Organigrama
              </Link>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
