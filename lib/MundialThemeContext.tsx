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

const STORAGE_KEY = "shuma-mundial-mode";
const SEEN_KEY = "shuma-mundial-matches-seen";
const ROOT_CLASS = "theme-mundial";

interface MundialThemeContextValue {
  mundialActive: boolean;
  toggleMundial: () => void;
  /** Match tracker (easter egg) banner state */
  trackerOpen: boolean;
  openTracker: () => void;
  closeTracker: () => void;
  /** True when mundial-mexico.ts has a match update the user hasn't viewed */
  hasUnseenMatches: boolean;
}

const MundialThemeContext = createContext<MundialThemeContextValue>({
  mundialActive: false,
  toggleMundial: () => {},
  trackerOpen: false,
  openTracker: () => {},
  closeTracker: () => {},
  hasUnseenMatches: false,
});

export function MundialThemeProvider({ children }: { children: ReactNode }) {
  const [mundialActive, setMundialActive] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [hasUnseenMatches, setHasUnseenMatches] = useState(false);

  // Hydrate from localStorage (same mechanism as the dark/light preference)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "true") {
        setMundialActive(true);
        document.documentElement.classList.add(ROOT_CLASS);
      }
      // Unseen match detection: compare data signature with last-seen value
      const seen = localStorage.getItem(SEEN_KEY);
      setHasUnseenMatches(seen !== getMatchesSignature());
    } catch {
      // localStorage unavailable — keep theme off
    }
  }, []);

  const toggleMundial = useCallback(() => {
    setMundialActive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      document.documentElement.classList.toggle(ROOT_CLASS, next);
      return next;
    });
  }, []);

  const openTracker = useCallback(() => {
    setTrackerOpen(true);
    setHasUnseenMatches(false);
    try {
      localStorage.setItem(SEEN_KEY, getMatchesSignature());
    } catch {
      // ignore storage errors
    }
  }, []);

  const closeTracker = useCallback(() => {
    setTrackerOpen(false);
  }, []);

  return (
    <MundialThemeContext.Provider
      value={{
        mundialActive,
        toggleMundial,
        trackerOpen,
        openTracker,
        closeTracker,
        hasUnseenMatches,
      }}
    >
      {children}
    </MundialThemeContext.Provider>
  );
}

export function useMundialTheme() {
  return useContext(MundialThemeContext);
}
