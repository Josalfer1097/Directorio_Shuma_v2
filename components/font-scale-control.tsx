'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Type } from 'lucide-react'
import { useFontScale } from '@/lib/FontScaleContext'

type FontScale = 1 | 1.15 | 1.3 | 1.5

const SCALE_OPTIONS: { value: FontScale; label: string }[] = [
  { value: 1, label: 'Normal' },
  { value: 1.15, label: 'Grande' },
  { value: 1.3, label: 'Más grande' },
  { value: 1.5, label: 'Accesible' },
]

export function FontScaleControl() {
  const { scale, setScale } = useFontScale()
  const [isOpen, setIsOpen] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current && 
        buttonRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const isActive = scale > 1

  return (
    <div className="relative">
      {/* Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => !isOpen && setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        aria-label="Tamaño de texto"
        aria-expanded={isOpen}
        className="relative flex items-center justify-center transition-all duration-150 active:scale-95 touch-manipulation"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: isActive ? 'rgba(0,201,167,0.10)' : 'var(--bg-elevated)',
          border: isActive ? '1px solid #00C9A7' : '1px solid var(--border-subtle)',
        }}
        onMouseOver={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'rgba(0,201,167,0.12)'
          }
        }}
        onMouseOut={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--bg-elevated)'
          }
        }}
      >
        {/* Aa icon - styled text */}
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
            fontWeight: 700,
            color: isActive ? '#00C9A7' : 'var(--foreground)',
            display: 'flex',
            alignItems: 'baseline',
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: '10px' }}>A</span>
          <span style={{ fontSize: '14px' }}>a</span>
        </span>
      </button>

      {/* Tooltip */}
      {tooltipVisible && !isOpen && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 whitespace-nowrap pointer-events-none z-50 text-scale-xs"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            color: 'var(--foreground)',
          }}
        >
          Tamaño de texto
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
            style={{
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-subtle)',
              borderLeft: '1px solid var(--border-subtle)',
            }}
          />
        </div>
      )}

      {/* Panel / Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[8999]"
                onClick={() => setIsOpen(false)}
              />
            )}

            <motion.div
              ref={panelRef}
              initial={isMobile ? { y: '100%' } : { opacity: 0, y: -8 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, y: -8 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300 
              }}
              role="dialog"
              aria-label="Tamaño de texto"
              className={isMobile 
                ? "fixed bottom-0 left-0 right-0 z-[9000] safe-bottom"
                : "absolute top-full right-0 mt-2 z-[9000]"
              }
              style={isMobile ? {
                background: 'var(--bg-surface)',
                borderRadius: '20px 20px 0 0',
                border: '1px solid var(--border-subtle)',
                borderBottom: 'none',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.1)',
                padding: '16px',
                paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
              } : {
                width: '220px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                padding: '16px',
              }}
            >
              {/* Drag handle for mobile */}
              {isMobile && (
                <div className="flex justify-center mb-3">
                  <div 
                    style={{ 
                      width: '32px', 
                      height: '4px', 
                      background: 'var(--border-subtle)',
                      borderRadius: '2px',
                    }} 
                  />
                </div>
              )}

              {/* Header */}
              <div 
                className="flex items-center gap-2 mb-3 text-scale-sm"
                style={{ 
                  color: 'var(--muted-foreground)',
                }}
              >
                <Type size={14} />
                Tamaño de texto
              </div>

              {/* Options grid */}
              <div 
                className="grid gap-2"
                style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}
              >
                {SCALE_OPTIONS.map((option) => {
                  const isSelected = scale === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => setScale(option.value)}
                      aria-pressed={isSelected}
                      className="flex items-center justify-between transition-all touch-manipulation text-scale-sm"
                      style={{
                        height: isMobile ? '52px' : '40px',
                        borderRadius: '10px',
                        padding: '0 12px',
                        background: isSelected ? 'rgba(0,201,167,0.15)' : 'var(--bg-elevated)',
                        border: isSelected ? '1px solid #00C9A7' : '1px solid var(--border-subtle)',
                        color: isSelected ? '#00C9A7' : 'var(--foreground)',
                      }}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check size={14} style={{ color: '#00C9A7' }} />}
                    </button>
                  )
                })}
              </div>

              {/* Separator */}
              <div 
                style={{ 
                  height: '1px', 
                  background: 'var(--border-subtle)', 
                  margin: '12px 0',
                }} 
              />

              {/* Preview */}
              <div>
                <p className="text-scale-xs" style={{ color: 'var(--muted-foreground)', marginBottom: '6px' }}>
                  Vista previa:
                </p>
                <p className="text-scale-base" style={{ color: 'var(--foreground)' }}>
                  El talento que nos mueve.
                </p>
              </div>

              {/* Reset link */}
              {scale !== 1 && (
                <button
                  onClick={() => setScale(1)}
                  className="w-full mt-3 transition-colors touch-manipulation text-scale-xs"
                  style={{
                    color: 'var(--muted-foreground)',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    textAlign: 'center',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                  Restablecer
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
