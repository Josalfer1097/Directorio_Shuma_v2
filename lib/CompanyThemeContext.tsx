'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

export type ActiveTheme = 'default' | 'comercializadora' | 'acabados' | 'ferrecapital' | 'arkiramica'

interface CompanyThemeContextType {
  activeTheme: ActiveTheme
  setActiveTheme: (t: ActiveTheme) => void
}

const CompanyThemeContext = createContext<CompanyThemeContextType>({
  activeTheme: 'default',
  setActiveTheme: () => {},
})

const themeVars: Record<ActiveTheme, Record<string, string>> = {
  default: {
    '--theme-primary': '#00C9A7',
    '--theme-secondary': '#845EC2',
    '--theme-glow': 'rgba(0,201,167,0.12)',
    '--theme-navbar-tint': 'rgba(0,0,0,0)',
    '--theme-bg-glow-a': 'rgba(0,201,167,0.06)',
    '--theme-bg-glow-b': 'rgba(132,94,194,0.05)',
  },
  comercializadora: {
    '--theme-primary': '#0047AB',
    '--theme-secondary': '#002D6E',
    '--theme-glow': 'rgba(0,71,171,0.14)',
    '--theme-navbar-tint': 'rgba(0,45,110,0.25)',
    '--theme-bg-glow-a': 'rgba(0,71,171,0.07)',
    '--theme-bg-glow-b': 'rgba(77,159,255,0.04)',
  },
  acabados: {
    '--theme-primary': '#C0152A',
    '--theme-secondary': '#8B0000',
    '--theme-glow': 'rgba(192,21,42,0.14)',
    '--theme-navbar-tint': 'rgba(139,0,0,0.22)',
    '--theme-bg-glow-a': 'rgba(192,21,42,0.07)',
    '--theme-bg-glow-b': 'rgba(255,77,94,0.04)',
  },
  ferrecapital: {
    '--theme-primary': '#2C3338',
    '--theme-secondary': '#1A1E21',
    '--theme-glow': 'rgba(44,51,56,0.20)',
    '--theme-navbar-tint': 'rgba(26,30,33,0.35)',
    '--theme-bg-glow-a': 'rgba(204,0,0,0.05)',
    '--theme-bg-glow-b': 'rgba(44,51,56,0.08)',
  },
  arkiramica: {
    '--theme-primary': '#F5C400',
    '--theme-secondary': '#C49A00',
    '--theme-glow': 'rgba(245,196,0,0.12)',
    '--theme-navbar-tint': 'rgba(196,154,0,0.18)',
    '--theme-bg-glow-a': 'rgba(245,196,0,0.06)',
    '--theme-bg-glow-b': 'rgba(255,217,61,0.03)',
  },
}

export function CompanyThemeProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveThemeState] = useState<ActiveTheme>('default')

  const setActiveTheme = useCallback((theme: ActiveTheme) => {
    setActiveThemeState(theme)
  }, [])

  // Apply CSS variables when theme changes
  useEffect(() => {
    const vars = themeVars[activeTheme]
    const root = document.documentElement
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [activeTheme])

  // Set default theme vars on mount
  useEffect(() => {
    const vars = themeVars.default
    const root = document.documentElement
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [])

  return (
    <CompanyThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </CompanyThemeContext.Provider>
  )
}

export const useCompanyTheme = () => useContext(CompanyThemeContext)
