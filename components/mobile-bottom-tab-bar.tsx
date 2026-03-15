"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Users, GitBranch, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/directorio", label: "Directorio", icon: Users },
  { href: "/organigrama", label: "Organigrama", icon: GitBranch },
  { href: "/buscar", label: "Buscar", icon: Search },
];

export function MobileBottomTabBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-card/95 backdrop-blur-sm bottom-tab-bar-safe"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 h-16 relative touch-target group"
            >
              <motion.div
                animate={{
                  color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                }}
                transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col items-center justify-center gap-1"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </motion.div>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                  transition={{
                    duration: 0.25,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              )}

              {/* Hover effect */}
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-[180ms] rounded-t-lg" />
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
