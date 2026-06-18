'use client';

import { useState, useRef, useEffect } from 'react';
import { useFontScale } from '@/lib/FontScaleContext'; // ajustar path si es diferente

const SCALE_OPTIONS = [
  { label: 'Normal',      value: 1     as const, desc: 'Tamaño predeterminado' },
  { label: 'Grande',      value: 1.15  as const, desc: 'Un poco más grande' },
  { label: 'Más grande',  value: 1.3   as const, desc: 'Para mejor lectura' },
  { label: 'Accesible',   value: 1.5   as const, desc: 'Alto contraste visual' },
];

export default function FontScaleButton() {
  const { scale, setScale } = useFontScale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open && !isMobile) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, isMobile]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const isActive = scale !== 1;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Botón "Aa" */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Tamaño de texto"
        aria-label="Cambiar tamaño de texto"
        style={{
          width: 36, height: 36, borderRadius: 8,
          background: open ? 'rgba(0,201,167,0.10)' : 'var(--bg-elevated)',
          border: `1px solid ${open || isActive ? '#00C9A7' : 'var(--border-subtle)'}`,
          color: open || isActive ? '#00C9A7' : 'var(--muted-foreground)',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { if (!open && !isActive) e.currentTarget.style.background = 'rgba(0,201,167,0.12)'; }}
        onMouseLeave={e => { if (!open && !isActive) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
      >
        {/* "Aa" con tamaños distintos para indicar escala */}
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, lineHeight: 1 }}>
          <span style={{ fontSize: 10 }}>A</span>
          <span style={{ fontSize: 14 }}>a</span>
        </span>
      </button>

      {/* Popover Desktop */}
      {open && !isMobile && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          zIndex: 9000,
          width: 220,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          padding: 16,
          animation: 'fontScaleFadeIn 0.15s ease-out',
        }}>
          <style>{`
            @keyframes fontScaleFadeIn {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <p className="text-scale-sm" style={{ color: 'var(--muted-foreground)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔠</span> Tamaño de texto
          </p>

          {/* Grid 2x2 de opciones */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
            {SCALE_OPTIONS.map(opt => {
              const active = scale === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setScale(opt.value)}
                  style={{
                    height: 40, borderRadius: 10,
                    background: active ? 'rgba(0,201,167,0.15)' : 'var(--bg-elevated)',
                    border: `1px solid ${active ? '#00C9A7' : 'var(--border-subtle)'}`,
                    color: active ? '#fff' : 'var(--muted-foreground)',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 10px', transition: 'all 0.15s',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-base)'; e.currentTarget.style.color = '#fff'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}}
                >
                  <span className="text-scale-sm">{opt.label}</span>
                  {active && <span style={{ color: '#00C9A7', fontSize: 12 }}>✓</span>}
                </button>
              );
            })}
          </div>

          {/* Separador */}
          <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 10 }} />

          {/* Vista previa live */}
          <p className="text-scale-xs" style={{ color: 'var(--muted-foreground)', marginBottom: 4 }}>Vista previa:</p>
          <p className="text-scale-base" style={{ color: 'var(--foreground)', fontFamily: 'DM Sans, sans-serif' }}>
            El talento que nos mueve.
          </p>

          {/* Restablecer */}
          {scale !== 1 && (
            <button
              onClick={() => setScale(1)}
              className="text-scale-xs"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted-foreground)', marginTop: 10,
                padding: 0, fontFamily: 'DM Sans, sans-serif',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; }}
            >
              Restablecer
            </button>
          )}
        </div>
      )}

      {/* Bottom sheet Mobile */}
      {open && isMobile && (
        <>
          {/* Overlay */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 8999, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setOpen(false)}
          />
          {/* Bottom sheet */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            zIndex: 9000,
            background: 'var(--bg-surface)',
            borderRadius: '20px 20px 0 0',
            border: '1px solid var(--border-subtle)',
            borderBottom: 'none',
            padding: '16px 16px 32px',
            animation: 'slideUp 0.2s ease-out',
          }}>
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(100%); }
                to   { transform: translateY(0); }
              }
            `}</style>
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-subtle)', margin: '0 auto 16px' }} />

            <p className="text-scale-sm" style={{ color: 'var(--muted-foreground)', marginBottom: 16, textAlign: 'center' }}>
              🔠 Tamaño de texto
            </p>

            {/* Opciones full width en mobile */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {SCALE_OPTIONS.map(opt => {
                const active = scale === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => { setScale(opt.value); setOpen(false); }}
                    style={{
                      height: 52, borderRadius: 12, width: '100%',
                      background: active ? 'rgba(0,201,167,0.15)' : 'var(--bg-elevated)',
                      border: `1px solid ${active ? '#00C9A7' : 'var(--border-subtle)'}`,
                      color: active ? '#fff' : 'var(--muted-foreground)',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between',
                      padding: '0 16px', fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div className="text-scale-base" style={{ fontWeight: active ? 600 : 400 }}>{opt.label}</div>
                      <div className="text-scale-xs" style={{ color: 'var(--muted-foreground)' }}>{opt.desc}</div>
                    </div>
                    {active && <span style={{ color: '#00C9A7', fontSize: 18 }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {scale !== 1 && (
              <button
                onClick={() => { setScale(1); setOpen(false); }}
                className="text-scale-sm"
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontFamily: 'DM Sans, sans-serif', padding: '8px 0' }}
              >
                Restablecer
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
