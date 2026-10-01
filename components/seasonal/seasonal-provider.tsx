"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getActiveSeasonalVariant, type SeasonalVariant } from "@/lib/seasonal-theme";

const SeasonalContext = createContext<SeasonalVariant | null>(null);
export const useSeasonalVariant = () => useContext(SeasonalContext);

const CLASSES = ["theme-muertos", "theme-muertos-light", "theme-muertos-full"];
// The kiosk never reloads, so the date is re-checked periodically.
const RECHECK_MS = 10 * 60 * 1000;

export function SeasonalThemeProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<SeasonalVariant | null>(null);

  useEffect(() => {
    // Read the Preview override once so it survives client-side navigation.
    const search = window.location.search;
    const root = document.documentElement;
    let current: SeasonalVariant | null | undefined;

    const apply = () => {
      const next = getActiveSeasonalVariant(search);
      if (next === current) return;
      current = next;
      setVariant(next);
      root.classList.remove(...CLASSES);
      if (next) root.classList.add("theme-muertos", `theme-muertos-${next}`);
    };

    apply();
    const id = window.setInterval(apply, RECHECK_MS);
    return () => {
      window.clearInterval(id);
      root.classList.remove(...CLASSES);
    };
  }, []);

  return <SeasonalContext.Provider value={variant}>{children}</SeasonalContext.Provider>;
}
