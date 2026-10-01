/**
 * Seasonal theme scheduler — Directorio Shuma v2
 *
 * Resolve the active variant on the CLIENT only (after mount) so a static
 * build never freezes the date and SSR markup never mismatches.
 * Dates are evaluated in America/Mexico_City.
 */

export type SeasonalVariant = "light" | "full";

interface SeasonalWindow {
  id: "dia-de-muertos";
  variant: SeasonalVariant;
  start: string; // YYYY-MM-DD, inclusive
  end: string;   // YYYY-MM-DD, inclusive
}

export const SEASONAL_WINDOWS: SeasonalWindow[] = [
  { id: "dia-de-muertos", variant: "light", start: "2026-10-01", end: "2026-10-19" },
  { id: "dia-de-muertos", variant: "full", start: "2026-10-20", end: "2026-11-03" },
];

export function getActiveSeasonalVariant(search = ""): SeasonalVariant | null {
  // `?seasonal=full|light|off` only works in local dev and Vercel Preview.
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const canOverride =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    host === "localhost" ||
    host.endsWith(".vercel.app");
  if (canOverride) {
    const o = new URLSearchParams(search).get("seasonal");
    if (o === "full" || o === "light") return o;
    if (o === "off") return null;
  }
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
  }).format(new Date());
  return SEASONAL_WINDOWS.find((w) => today >= w.start && today <= w.end)?.variant ?? null;
}

// ─── Legacy compatibility ────────────────────────────────────────────────────
// Kept so existing imports (Mundial files kept for reference) still compile.

/** @deprecated Kept for the retired Mundial theme layer. */
export interface SeasonalTheme {
  id: string;
  name: string;
  htmlClass: string;
  badgeText?: string;
}

/** @deprecated The Mundial theme is retired; always returns null. */
export function getActiveSeasonalTheme(): SeasonalTheme | null {
  return null;
}

/** @deprecated The Mundial theme is retired; always returns false. */
export function isMundialThemeActive(): boolean {
  return false;
}

/** Returns "theme-muertos" while a Día de Muertos window is active, otherwise "". */
export function getActiveSeasonalThemeClass(): string {
  if (typeof window === "undefined") return "";
  return getActiveSeasonalVariant(window.location.search) ? "theme-muertos" : "";
}
