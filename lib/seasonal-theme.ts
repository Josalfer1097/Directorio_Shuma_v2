/**
 * Seasonal theme calendar system — Directorio Shuma v2
 *
 * Themes are date-ranged. The active theme is determined at runtime on the
 * CLIENT only (inside a useEffect) to prevent React hydration mismatches.
 * Do NOT call `getActiveSeasonalTheme()` during SSR or in server components.
 *
 * To add a new season:
 * 1. Add a CSS layer in globals.css under its root class (e.g. `.theme-navidad`).
 * 2. Register the new `SeasonalTheme` object in the `SEASONAL_THEMES` array.
 * 3. Done — the calendar does the rest.
 */

export interface SeasonalTheme {
  id: string;
  /** Human-readable name shown in debug/dev contexts. */
  name: string;
  /**
   * Month (1-12) and day (1-31) the season starts (inclusive).
   * Range wraps correctly even across year boundaries.
   */
  startMonth: number;
  startDay: number;
  /** Month and day the season ends (inclusive). */
  endMonth: number;
  endDay: number;
  /** CSS class applied to <html> when this season is active. */
  htmlClass: string;
  /** Optional badge text shown in the navbar/hero. */
  badgeText?: string;
  /** Optional accent color overrides expressed as CSS custom property overrides. */
  accentVars?: Record<string, string>;
}

/**
 * Ordered list of all defined seasonal themes.
 * Only ONE theme may be active at a time; the first match wins.
 *
 * Past themes (e.g. mundial-2026) are kept for historical reference
 * but their date windows no longer fall in the current calendar.
 */
export const SEASONAL_THEMES: SeasonalTheme[] = [
  // ─── Past: Mundial 2026 ────────────────────────────────────────────
  // Kept for reference. Dates were June 11 – July 19, 2026.
  // The World Cup final was July 19; Mexico was eliminated before then.
  {
    id: "mundial-2026",
    name: "Mundial 2026",
    startMonth: 6,
    startDay: 11,
    endMonth: 7,
    endDay: 19,
    htmlClass: "theme-mundial",
    badgeText: "¿Y si sí?",
    accentVars: {
      "--theme-primary": "#1FA85C",
      "--theme-secondary": "#CE1126",
    },
  },

  // ─── Independencia de México ──────────────────────────────────────
  // September 1–16 (Grito de Independencia is Sep 15–16)
  {
    id: "independencia-mexico",
    name: "Independencia de México",
    startMonth: 9,
    startDay: 1,
    endMonth: 9,
    endDay: 16,
    htmlClass: "theme-independencia",
    badgeText: "¡Viva México!",
    accentVars: {
      "--theme-primary": "#1FA85C",
      "--theme-secondary": "#CE1126",
    },
  },

  // ─── Navidad / Fin de Año ─────────────────────────────────────────
  {
    id: "navidad",
    name: "Navidad & Fin de Año",
    startMonth: 12,
    startDay: 1,
    endMonth: 12,
    endDay: 31,
    htmlClass: "theme-navidad",
    badgeText: "¡Felices Fiestas!",
    accentVars: {
      "--theme-primary": "#D4AF37",
      "--theme-secondary": "#C0152A",
    },
  },
];

/**
 * Returns the currently active seasonal theme based on the current date,
 * or `null` if no season is active (corporate default).
 *
 * MUST be called client-side only (inside useEffect / after mount).
 */
export function getActiveSeasonalTheme(): SeasonalTheme | null {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate(); // 1-31

  for (const theme of SEASONAL_THEMES) {
    if (isInDateRange(month, day, theme.startMonth, theme.startDay, theme.endMonth, theme.endDay)) {
      return theme;
    }
  }
  return null;
}

function isInDateRange(
  month: number,
  day: number,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number,
): boolean {
  const current = month * 100 + day;
  const start = startMonth * 100 + startDay;
  const end = endMonth * 100 + endDay;

  if (start <= end) {
    // Normal range (does not wrap across year boundary)
    return current >= start && current <= end;
  } else {
    // Wraps across year end (e.g. Dec 15 – Jan 15)
    return current >= start || current <= end;
  }
}

// ─── Legacy compatibility helpers ────────────────────────────────────────────
// These kept so existing imports don't break. They no longer apply any theme
// synchronously — use getActiveSeasonalTheme() in a useEffect instead.

/** @deprecated Use getActiveSeasonalTheme() in a useEffect. Always returns false on server. */
export function isMundialThemeActive(): boolean {
  if (typeof window === "undefined") return false;
  const active = getActiveSeasonalTheme();
  return active?.id === "mundial-2026";
}

/** @deprecated Use getActiveSeasonalTheme() in a useEffect. Always returns null on server. */
export function getActiveSeasonalThemeClass(): string | null {
  if (typeof window === "undefined") return null;
  const active = getActiveSeasonalTheme();
  return active?.htmlClass ?? null;
}
