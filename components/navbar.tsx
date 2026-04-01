"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users,
  GitBranch,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/directorio", label: "Directorio", icon: Users },
  { href: "/organigrama", label: "Organigrama", icon: GitBranch },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300 hidden md:block",
        scrolled
          ? "glass border-b border-[--border-subtle] shadow-lg shadow-black/10"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo with long-press trigger for admin */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            data-logo-trigger
          >
            {/* Monogram S */}
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[--gold] to-[#A68A3A] flex items-center justify-center shadow-lg shadow-[--gold-glow]">
                <span className="font-display text-lg font-bold text-[--bg-base]">
                  S
                </span>
              </div>
              <div className="absolute inset-0 rounded-lg bg-[--gold]/40 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col relative">
              <span className="font-display font-semibold text-lg text-[--text-primary] leading-none tracking-widest">
                SHUMA
              </span>
              <span className="text-[10px] text-[--gold] leading-none mt-1 tracking-widest uppercase">
                Directorio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2 font-display text-xs tracking-wider",
                      isActive && "bg-[--bg-elevated] text-[--text-primary]"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label.toUpperCase()}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Link href="/directorio" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="relative">
                <Search className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
