'use client'
import { useSearchParams } from 'next/navigation'
import { getEmployees } from '@/lib/data'
import type { Employee } from '@/types'

import { Suspense } from 'react'

function PrintContent() {
  const params = useSearchParams()
  const companyFilter = params.get('company') ?? 'all'
  
  const employees: Employee[] = getEmployees()

  const filtered = companyFilter === 'all' 
    ? employees 
    : employees.filter((e: Employee) => e.company === companyFilter)

  const grouped: Record<string, Employee[]> = {
    comercializadora: filtered.filter((e: Employee) => e.company === 'comercializadora'),
    acabados: filtered.filter((e: Employee) => e.company === 'acabados'),
    ferrecapital: filtered.filter((e: Employee) => e.company === 'ferrecapital'),
  }

  // Sort by extension
  Object.values(grouped).forEach(g => g.sort((a: Employee, b: Employee) => {
    if (!a.extension) return 1
    if (!b.extension) return -1
    return parseInt(a.extension) - parseInt(b.extension)
  }))

  const date = new Date().toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const companyColors: Record<string, string> = {
    comercializadora: '#0047AB',
    acabados: '#C0152A',
    ferrecapital: '#2C3338',
  }

  const companyNames: Record<string, string> = {
    comercializadora: 'Comercializadora y Ferretería Shuma',
    acabados: 'Acabados Shuma',
    ferrecapital: 'Ferrecapital',
  }

  return (
    <html lang="es">
      <head>
        <title>Directorio de Extensiones — Grupo Shuma</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif;
            background: white;
            color: #000;
            padding: 2cm;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 2px solid #000;
            padding-bottom: 12px;
            margin-bottom: 8px;
          }
          .header-title {
            font-size: 16pt;
            font-weight: 900;
            letter-spacing: 0.03em;
          }
          .header-sub {
            font-size: 9pt;
            color: #555;
            margin-top: 2px;
          }
          .header-date {
            font-size: 8pt;
            color: #666;
            text-align: right;
          }
          .col-headers {
            display: grid;
            grid-template-columns: 65px 1fr 1fr 1fr;
            gap: 8px;
            padding: 6px 4px;
            border-bottom: 1.5px solid #000;
            font-size: 7pt;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #000;
            margin-bottom: 4px;
          }
          .company-header {
            padding: 7px 10px;
            margin-top: 16px;
            margin-bottom: 4px;
            font-size: 8.5pt;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            background: #f5f5f5;
            border-left: 4px solid currentColor;
          }
          .row {
            display: grid;
            grid-template-columns: 65px 1fr 1fr 1fr;
            gap: 8px;
            padding: 5px 4px;
            border-bottom: 1px solid #ebebeb;
            font-size: 8.5pt;
            align-items: center;
          }
          .row:nth-child(even) { background: #fafafa; }
          .ext {
            font-family: 'Courier New', monospace;
            font-weight: 700;
            font-size: 9pt;
            text-align: center;
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 4px;
          }
          .name { font-weight: 600; }
          .position { color: #333; }
          .dept { color: #555; }
          .footer {
            margin-top: 20px;
            padding-top: 8px;
            border-top: 1px solid #ccc;
            display: flex;
            justify-content: space-between;
            font-size: 7pt;
            color: #888;
          }
          .print-btn {
            position: fixed;
            top: 16px;
            right: 16px;
            background: #0047AB;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 999;
          }
          .print-btn:hover { background: #002D6E; }
          @media print {
            .print-btn { display: none !important; }
            body { padding: 1.5cm 1.8cm; }
            @page { size: Letter portrait; margin: 1.5cm 1.8cm; }
          }
        `}</style>
      </head>
      <body>
        <button 
          className="print-btn"
          onClick={() => window.print()}
        >
          🖨️ Imprimir / Guardar PDF
        </button>

        <div className="header">
          <div>
            <div className="header-title">
              GRUPO SHUMA — DIRECTORIO DE EXTENSIONES
            </div>
            <div className="header-sub">
              Uso interno · Confidencial
            </div>
          </div>
          <div className="header-date">
            {date}<br/>
            directorio.gruposhuma.com
          </div>
        </div>

        <div className="col-headers">
          <span>EXT.</span>
          <span>NOMBRE</span>
          <span>PUESTO</span>
          <span>DEPARTAMENTO</span>
        </div>

        {Object.entries(grouped).map(([companyId, emps]) =>
          emps.length === 0 ? null : (
            <div key={companyId}>
              <div 
                className="company-header"
                style={{ color: companyColors[companyId] }}
              >
                {companyNames[companyId]} — {emps.length} colaboradores
              </div>
              {emps.map((emp: Employee) => (
                <div key={emp.id} className="row">
                  <span className="ext">{emp.extension ?? '—'}</span>
                  <span className="name">{emp.name}</span>
                  <span className="position">{emp.position}</span>
                  <span className="dept">{emp.department ?? '—'}</span>
                </div>
              ))}
            </div>
          )
        )}

        <div className="footer">
          <span>Confidencial — Uso interno Grupo Shuma</span>
          <span>Generado el {date}</span>
        </div>
      </body>
    </html>
  )
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PrintContent />
    </Suspense>
  )
}
