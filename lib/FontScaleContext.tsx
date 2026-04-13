'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type FontScale = 1 | 1.15 | 1.3 | 1.5

interface FontScaleContextType {
  scale: FontScale
  setScale: (s: FontScale) => void
  label: string
}

const FontScaleContext = createContext<FontScaleContextType>({
  scale: 1,
  setScale: () => {},
  label: 'Normal',
})

const SCALE_LABELS: Record<FontScale, string> = {
  1:    'Normal',
  1.15: 'Grande',
  1.3:  'Más grande',
  1.5:  'Accesible',
}

export function FontScaleProvider({ children }: { children: ReactNode }) {
  const [scale, setScaleState] = useState<FontScale>(1)
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('shuma-font-scale')
      if (saved) {
        const parsed = parseFloat(saved) as FontScale
        if ([1, 1.15, 1.3, 1.5].includes(parsed)) {
          setScaleState(parsed)
          document.documentElement.style.setProperty('--font-scale', String(parsed))
        }
      }
    } catch {
      // localStorage unavailable (private browsing, etc) - silently fall back to 1
    }
  }, [])

  const setScale = (newScale: FontScale) => {
    setScaleState(newScale)
    try {
      localStorage.setItem('shuma-font-scale', String(newScale))
    } catch {
      // localStorage unavailable - silently ignore
    }
    // Apply directly to :root CSS variable
    document.documentElement.style.setProperty('--font-scale', String(newScale))
  }

  // Prevent flash during hydration
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <FontScaleContext.Provider value={{ 
      scale, 
      setScale, 
      label: SCALE_LABELS[scale] 
    }}>
      {children}
    </FontScaleContext.Provider>
  )
}

export const useFontScale = () => useContext(FontScaleContext)
