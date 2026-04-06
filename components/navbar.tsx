"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { LayoutGrid, List } from "lucide-react";
import type { ViewMode } from "@/types";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

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
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[64px] flex items-center border-b",
        scrolled
          ? "bg-[--bg-base] backdrop-blur-xl border-[--border-subtle] saturate-[180%]"
          : "bg-transparent border-transparent"
      )}
      style={{
        backgroundColor: scrolled ? 'rgba(var(--bg-base-rgb), 0.88)' : 'transparent'
      } as any}
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
          <Link 
            href="/directorio" 
            className={cn(
              "font-neuropol text-[12px] uppercase tracking-wider transition-colors active:scale-95 font-neuropol",
              pathname === "/directorio" ? "text-text-primary" : "text-text-muted hover:text-text-primary"
            )}
          >
            Directorio
          </Link>
          <Link 
            href="/organigrama" 
            className={cn(
              "font-neuropol text-[12px] uppercase tracking-wider transition-colors active:scale-95 font-neuropol",
              pathname === "/organigrama" ? "text-text-primary" : "text-text-muted hover:text-text-primary"
            )}
          >
            Organigrama
          </Link>

          {/* View Toggle */}
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
        </div>
      </nav>
    </header>
  );
}
