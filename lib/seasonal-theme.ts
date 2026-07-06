/**
 * Seasonal theme configuration.
 *
 * To activate a seasonal theme, set ACTIVE_SEASONAL_THEME to its id.
 * To disable all seasonal styling (clean fallback to the base theme),
 * set it to null.
 *
 * Adding a future seasonal theme:
 * 1. Create its CSS layer in globals.css under a root class
 *    (e.g. `.theme-navidad-2026 { ... }`).
 * 2. Register the id → root class mapping in SEASONAL_THEME_CLASSES.
 * 3. Point ACTIVE_SEASONAL_THEME at the new id. No toggle UI needed.
 */

export type SeasonalThemeId = "mundial-2026";

export const ACTIVE_SEASONAL_THEME: SeasonalThemeId | null = null;

/** Maps each seasonal theme id to the class applied on <html>. */
export const SEASONAL_THEME_CLASSES: Record<SeasonalThemeId, string> = {
  "mundial-2026": "theme-mundial",
};

/** True when the Mundial 2026 seasonal theme is the active one. */
export function isMundialThemeActive(): boolean {
  return ACTIVE_SEASONAL_THEME === "mundial-2026";
}

/** Root class for the currently active seasonal theme, or null. */
export function getActiveSeasonalThemeClass(): string | null {
  return ACTIVE_SEASONAL_THEME
    ? SEASONAL_THEME_CLASSES[ACTIVE_SEASONAL_THEME]
    : null;
}
