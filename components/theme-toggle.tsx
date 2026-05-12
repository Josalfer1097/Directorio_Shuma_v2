'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg" />
    )
  }

  const isDark = theme === 'dark'

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 text-text-muted hover:text-text-primary transition-all active:scale-95 group relative"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title="Cambiar tema"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? (
          <Moon className="w-5 h-5 transition-transform group-hover:scale-110" />
        ) : (
          <Sun className="w-5 h-5 transition-transform group-hover:scale-110" />
        )}
      </motion.div>
      <div className="absolute inset-0 rounded-full blur-[8px] opacity-0 group-hover:opacity-100 bg-gradient-to-r from-irid-a to-irid-b transition-opacity -z-10" />
    </button>
  )
}
