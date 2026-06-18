"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getMatchesSignature } from "@/data/mundial-mexico";
import {
  isMundialThemeActive,
  getActiveSeasonalThemeClass,
} from "@/lib/seasonal-theme";

const SEEN_KEY = "shuma-mundial-matches-seen";
const TOOLTIP_SEEN_KEY = "shuma-mundial-tooltip-seen";
const LEGACY_TOGGLE_KEY = "shuma-mundial-mode"; // removed feature — cleaned up on load
const TOOLTIP_DELAY_MS = 2200;

interface MundialThemeContextValue {
  /** True when the Mundial 2026 seasonal theme is active (config-driven). */
  mundialActive: boolean;
  /** Match tracker banner state */
  trackerOpen: boolean;
  openTracker: () => void;
  closeTracker: () => void;
  /** True when mundial-mexico.ts has a match update the user hasn't viewed */
  hasUnseenMatches: boolean;
  /** Onboarding tooltip pointing at the soccer ball entry points */
  tooltipVisible: boolean;
  dismissTooltip: () => void;
}

const MundialThemeContext = createContext<MundialThemeContextValue>({
  mundialActive: false,
  trackerOpen: false,
  openTracker: () => {},
  closeTracker: () => {},
  hasUnseenMatches: false,
  tooltipVisible: false,
  dismissTooltip: () => {},
});

export function MundialThemeProvider({ children }: { children: ReactNode }) {
  // Theme activation is config-driven (lib/seasonal-theme.ts), no user toggle.
  const [mundialActive, setMundialActive] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [hasUnseenMatches, setHasUnseenMatches] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    if (!isMundialThemeActive()) return;

    const rootClass = getActiveSeasonalThemeClass();
    if (rootClass) document.documentElement.classList.add(rootClass);
    setMundialActive(true);

    try {
      // Clean up the legacy toggle key from the removed Modo Mundial switch
      localStorage.removeItem(LEGACY_TOGGLE_KEY);

      // Unseen match detection: compare data signature with last-seen value
      const seen = localStorage.getItem(SEEN_KEY);
      setHasUnseenMatches(seen !== getMatchesSignature());

      // Onboarding tooltip: show once per user, after a short delay
      if (localStorage.getItem(TOOLTIP_SEEN_KEY) !== "true") {
        const timer = setTimeout(() => setTooltipVisible(true), TOOLTIP_DELAY_MS);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable — theme still applies, skip persistence
    }
    return undefined;
  }, []);

  const dismissTooltip = useCallback(() => {
    setTooltipVisible(false);
    try {
      localStorage.setItem(TOOLTIP_SEEN_KEY, "true");
    } catch {
      // ignore storage errors
    }
  }, []);

  const openTracker = useCallback(() => {
    setTrackerOpen(true);
    setHasUnseenMatches(false);
    dismissTooltip();
    try {
      localStorage.setItem(SEEN_KEY, getMatchesSignature());
    } catch {
      // ignore storage errors
    }
  }, [dismissTooltip]);

  const closeTracker = useCallback(() => {
    setTrackerOpen(false);
  }, []);

  return (
    <MundialThemeContext.Provider
      value={{
        mundialActive,
        trackerOpen,
        openTracker,
        closeTracker,
        hasUnseenMatches,
        tooltipVisible,
        dismissTooltip,
      }}
    >
      {children}
    </MundialThemeContext.Provider>
  );
}

export function useMundialTheme() {
  return useContext(MundialThemeContext);
}
