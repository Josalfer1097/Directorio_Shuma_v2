"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const STORAGE_KEY = "shuma-mundial-mode";
const ROOT_CLASS = "theme-mundial";

interface MundialThemeContextValue {
  mundialActive: boolean;
  toggleMundial: () => void;
}

const MundialThemeContext = createContext<MundialThemeContextValue>({
  mundialActive: false,
  toggleMundial: () => {},
});

export function MundialThemeProvider({ children }: { children: ReactNode }) {
  const [mundialActive, setMundialActive] = useState(false);

  // Hydrate from localStorage (same mechanism as the dark/light preference)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "true") {
        setMundialActive(true);
        document.documentElement.classList.add(ROOT_CLASS);
      }
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

  return (
    <MundialThemeContext.Provider value={{ mundialActive, toggleMundial }}>
      {children}
    </MundialThemeContext.Provider>
  );
}

export function useMundialTheme() {
  return useContext(MundialThemeContext);
}
