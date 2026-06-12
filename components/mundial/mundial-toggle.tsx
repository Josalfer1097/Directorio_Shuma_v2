"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMundialTheme } from "@/lib/MundialThemeContext";
import { SoccerBallIcon } from "./soccer-ball-icon";

export function MundialToggle() {
  const { mundialActive, toggleMundial } = useMundialTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch (same pattern as ThemeToggle)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg" />;
  }

  return (
    <button
      onClick={toggleMundial}
      className="p-2 transition-all active:scale-95 group relative"
      aria-label={mundialActive ? "Desactivar Modo Mundial" : "Activar Modo Mundial"}
      aria-pressed={mundialActive}
      title="Modo Mundial"
      style={{
        color: mundialActive ? "#1FA85C" : "var(--text-muted)",
      }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: mundialActive ? 360 : 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <SoccerBallIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
      </motion.div>
      {mundialActive && (
        <span
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
          style={{
            background: "linear-gradient(135deg, #1FA85C, #CE1126)",
            boxShadow: "0 0 6px rgba(31,168,92,0.6)",
          }}
          aria-hidden="true"
        />
      )}
      <div
        className="absolute inset-0 rounded-full blur-[8px] opacity-0 group-hover:opacity-100 transition-opacity -z-10"
        style={{ background: "rgba(31,168,92,0.25)" }}
      />
    </button>
  );
}
