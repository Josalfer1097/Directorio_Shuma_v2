"use client";

import { useEffect, useState } from "react";
import { useMundialTheme } from "@/lib/MundialThemeContext";
import { SoccerBallIcon } from "./soccer-ball-icon";
import { MundialOnboardingTooltip } from "./mundial-onboarding-tooltip";

/**
 * Navbar soccer ball button — opens the México match tracker.
 * Only rendered while the Mundial 2026 seasonal theme is active.
 */
export function MundialBallButton() {
  const { mundialActive, openTracker, hasUnseenMatches } = useMundialTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch (same pattern as ThemeToggle)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !mundialActive) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={openTracker}
        className="p-2 transition-all active:scale-95 group relative"
        aria-label="Ver partidos de México en el Mundial 2026"
        title="México en el Mundial 2026"
        style={{ color: "#1FA85C" }}
      >
        <SoccerBallIcon className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
        {/* "New match update" indicator — pulses while there's an entry in
            mundial-mexico.ts the user hasn't viewed in the match tracker */}
        {hasUnseenMatches && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full motion-safe:animate-pulse"
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

      {/* Onboarding tooltip (desktop entry point) */}
      <MundialOnboardingTooltip placement="navbar" />
    </div>
  );
}
