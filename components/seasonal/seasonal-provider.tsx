"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getActiveSeasonalVariant, type SeasonalVariant } from "@/lib/seasonal-theme";

const SeasonalContext = createContext<SeasonalVariant | null>(null);
export const useSeasonalVariant = () => useContext(SeasonalContext);

const CLASSES = ["theme-muertos", "theme-muertos-light", "theme-muertos-full"];

export function SeasonalThemeProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<SeasonalVariant | null>(null);

  useEffect(() => {
    const v = getActiveSeasonalVariant(window.location.search);
    setVariant(v);
    const root = document.documentElement;
    root.classList.remove(...CLASSES);
    if (v) root.classList.add("theme-muertos", `theme-muertos-${v}`);
    return () => {
      root.classList.remove(...CLASSES);
    };
  }, []);

  return <SeasonalContext.Provider value={variant}>{children}</SeasonalContext.Provider>;
}
