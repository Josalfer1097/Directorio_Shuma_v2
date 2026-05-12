import Link from 'next/link'
import FloatingNodes from '@/components/floating-nodes'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Organigrama — Próximamente | Directorio Shuma',
}

const tasks = [
  { label: 'Estructura de datos y jerarquías', status: 'done' },
  { label: 'Diseño de nodos y conexiones',     status: 'done' },
  { label: 'Renderizado interactivo D3',       status: 'wip'  },
  { label: 'Zoom, filtros y modo móvil',       status: 'todo' },
]

export default function OrganigramaPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-20">

      {/* Grid background */}
      <div className="absolute inset-0 opacity-30"
           style={{
             backgroundImage: `
               linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }} />

      {/* Floating nodes — animated, positioned at edges */}
      <FloatingNodes />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          En desarrollo activo
        </div>

        <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">
          Organigrama{' '}
          <span className="text-blue-400">Shuma</span>
        </h1>

        <p className="text-sm text-white/50 leading-relaxed mb-8">
          Estamos construyendo una visualización interactiva de la
          estructura organizacional. Pronto podrás navegar por cada
          empresa y equipo.
        </p>

        {/* Progress bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Progreso</span>
            <span>67%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[67%] rounded-full bg-blue-500 transition-all duration-1000" />
          </div>
        </div>

        {/* Task list */}
        <div className="w-full flex flex-col gap-2 mb-8">
          {tasks.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/8 bg-white/4 text-sm text-white/60 text-left"
            >
              {t.status === 'done' && (
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs flex-shrink-0">
                  ✓
                </span>
              )}
              {t.status === 'wip' && (
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs flex-shrink-0 animate-spin-slow">
                  ◌
                </span>
              )}
              {t.status === 'todo' && (
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white/30 text-xs flex-shrink-0">
                  ○
                </span>
              )}
              {t.label}
            </div>
          ))}
        </div>

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          ← Regresar al inicio
        </Link>
      </div>
    </main>
  )
}
