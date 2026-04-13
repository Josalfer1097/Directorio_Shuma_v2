"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { LayoutGrid, List, Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ViewMode } from "@/types";
import { cn } from "@/lib/utils";
import { getEmployees } from "@/lib/data";
import { FontScaleControl } from "./font-scale-control";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [phoneTooltipVisible, setPhoneTooltipVisible] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const employeeCount = useMemo(() => getEmployees().length, []);

  // Check if currently on directory with quick+solo mode
  const isQuickSoloActive = pathname === "/directorio" && typeof window !== "undefined" && 
    localStorage.getItem("directorio-viewMode") === "extensions" &&
    localStorage.getItem("directorio-quick-subMode") === "solo-extensiones";

  // Navigate to extensions quick view
  const handlePhoneClick = useCallback(() => {
    // Set the view mode and sub-mode in localStorage
    localStorage.setItem("directorio-viewMode", "extensions");
    localStorage.setItem("directorio-quick-subMode", "solo-extensiones");
    
    if (pathname === "/directorio") {
      // Already on directory - dispatch events to update view
      window.dispatchEvent(new CustomEvent("view-mode-change", { detail: "extensions" }));
      window.dispatchEvent(new CustomEvent("quick-submode-change", { detail: "solo-extensiones" }));
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Focus search bar after a delay
      setTimeout(() => {
        const searchInput = document.querySelector('input[placeholder*="Buscar nombre o extension"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }, 300);
    } else {
      // Navigate to directory
      router.push("/directorio");
      // Focus search bar after navigation completes
      setTimeout(() => {
        const searchInput = document.querySelector('input[placeholder*="Buscar nombre o extension"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }, 500);
    }
  }, [pathname, router]);

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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[56px] md:h-[64px] flex items-center safe-top",
        scrolled
          ? "bg-[--bg-base]/88 -webkit-backdrop-filter-blur-xl backdrop-blur-xl border-b border-white/8 saturate-[180%]"
          : "bg-transparent border-b border-transparent"
      )}
      style={{
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : undefined,
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : undefined,
      }}
    >
      {/* Company Theme Tint Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'var(--theme-navbar-tint, rgba(0,0,0,0))',
          transition: 'background 600ms ease',
        }}
        aria-hidden="true"
      />
      <nav className="container mx-auto px-4 flex items-center justify-between">
          <Link
            href="/"
            style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}
            className="text-base md:text-lg tracking-wider max-w-[50%] truncate"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
          >
            <span className="text-[#F2F0EC]" style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}>DIRECTO</span>
            <span className="animate-gradient-text" style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}>RIO</span>
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

          {/* Font Scale Control */}
          <FontScaleControl />

          {/* Quick Extensions Button */}
          <div className="relative">
            <button
              onClick={handlePhoneClick}
              onMouseEnter={() => setPhoneTooltipVisible(true)}
              onMouseLeave={() => setPhoneTooltipVisible(false)}
              className="relative flex items-center justify-center transition-all duration-150 active:scale-95"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: isQuickSoloActive ? "rgba(0,201,167,0.15)" : "rgba(255,255,255,0.05)",
                border: isQuickSoloActive ? "1px solid #00C9A7" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isQuickSoloActive ? "0 0 8px rgba(0,201,167,0.25)" : "none",
              }}
              onMouseOver={(e) => {
                if (!isQuickSoloActive) {
                  e.currentTarget.style.background = "rgba(0,201,167,0.12)";
                  e.currentTarget.style.borderColor = "rgba(0,201,167,0.35)";
                  const icon = e.currentTarget.querySelector("svg");
                  if (icon) (icon as SVGElement).style.color = "#00C9A7";
                }
              }}
              onMouseOut={(e) => {
                if (!isQuickSoloActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  const icon = e.currentTarget.querySelector("svg");
                  if (icon) (icon as SVGElement).style.color = "rgba(255,255,255,0.6)";
                }
              }}
            >
              <Phone 
                className="w-4 h-4" 
                style={{ color: isQuickSoloActive ? "#00C9A7" : "rgba(255,255,255,0.6)" }} 
              />
            </button>
            
            {/* Tooltip */}
            {phoneTooltipVisible && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 whitespace-nowrap pointer-events-none z-50"
                style={{
                  background: "#1A1A1A",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "6px",
                  fontSize: "var(--font-xs)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Extensiones rapidas
                {/* Arrow */}
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                  style={{
                    background: "#1A1A1A",
                    borderTop: "1px solid rgba(255,255,255,0.10)",
                    borderLeft: "1px solid rgba(255,255,255,0.10)",
                  }}
                />
              </div>
            )}
          </div>

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
            className="fixed top-[56px] md:top-[64px] left-0 right-0 z-50 md:hidden"
            style={{
              background: "rgba(15, 15, 26, 0.95)",
              WebkitBackdropFilter: "blur(20px)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link 
                href="/directorio"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "font-neuropol text-base uppercase tracking-wider py-3 px-4 rounded-lg transition-all min-h-[52px] flex items-center touch-manipulation",
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
                  "font-neuropol text-base uppercase tracking-wider py-3 px-4 rounded-lg transition-all min-h-[52px] flex items-center touch-manipulation",
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
