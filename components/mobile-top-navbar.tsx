"use client";

import Link from "next/link";

export function MobileTopNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 md:hidden glass border-b border-[--border-subtle]">
      <div className="flex items-center justify-center h-14 px-4">
        {/* Logo with long-press trigger for admin */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          data-logo-trigger
        >
          {/* Monogram S */}
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[--gold] to-[#A68A3A] flex items-center justify-center shadow-lg shadow-[--gold-glow]">
              <span className="font-display text-sm font-bold text-[--bg-base]">
                S
              </span>
            </div>
            <div className="absolute inset-0 rounded-lg bg-[--gold]/40 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-180" />
          </div>
          <span className="font-display font-semibold text-base text-[--text-primary] tracking-widest">
            SHUMA
          </span>
        </Link>
      </div>
    </header>
  );
}
