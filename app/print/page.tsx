'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getEmployees } from '@/lib/data'

const COMPANY_ORDER = ['comercializadora', 'acabados', 'ferrecapital']

const COMPANY_NAMES: Record<string, string> = {
  comercializadora: 'Comercializadora y Ferretería Shuma',
  acabados: 'Acabados Shuma',
  ferrecapital: 'Ferrecapital',
}

const COMPANY_COLORS: Record<string, string> = {
  comercializadora: '#0047AB',
  acabados: '#C0152A',
  ferrecapital: '#2C3338',
}

function PrintContent() {
  const employees = getEmployees()
  const params = useSearchParams()
  const companyFilter = params.get('company') ?? 'all'

  const filtered = companyFilter === 'all'
    ? employees
    : employees.filter(e => e.company === companyFilter)

  const grouped: Record<string, typeof employees> = {}
  COMPANY_ORDER.forEach(id => {
    grouped[id] = filtered
      .filter(e => e.company === id)
      .sort((a, b) => {
        if (!a.extension) return 1
        if (!b.extension) return -1
        return parseInt(a.extension) - parseInt(b.extension)
      })
  })

  const date = new Date().toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { padding: 1.5cm 1.8cm; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .print-btn {
          position: fixed; top: 16px; right: 16px;
          background: #0047AB; color: white;
          border: none; padding: 10px 20px;
          border-radius: 8px; font-size: 13px;
          cursor: pointer; font-weight: 600;
          font-family: Arial, sans-serif;
          z-index: 999;
        }
        .print-btn:hover { background: #002D6E; }
        @media print {
          .print-btn { display: none !important; }
          @page { size: Letter portrait; margin: 1.5cm 1.8cm; }
          body { 
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          tr { page-break-inside: avoid; }
        }
      `}</style>

      <button 
        className="print-btn"
        onClick={() => window.print()}
      >
        🖨️ Imprimir / Guardar PDF
      </button>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end', borderBottom: '2px solid #000',
        paddingBottom: '10px', marginBottom: '10px',
      }}>
        <div>
          <div style={{ fontSize: '14pt', fontWeight: 900, letterSpacing: '0.03em' }}>
            GRUPO SHUMA — DIRECTORIO DE EXTENSIONES
          </div>
          <div style={{ fontSize: '8pt', color: '#666', marginTop: '3px' }}>
            Uso interno · Confidencial
          </div>
        </div>
        <div style={{ fontSize: '8pt', color: '#666', textAlign: 'right', lineHeight: 1.6 }}>
          {date}<br />directorio.gruposhuma.com
        </div>
      </div>

      {/* Table */}
      <table>
        <colgroup>
          <col style={{ width: '70px' }} />
          <col style={{ width: '28%' }} />
          <col style={{ width: '35%' }} />
          <col style={{ width: '25%' }} />
        </colgroup>
        <thead>
          <tr>
            {['Ext.', 'Nombre', 'Puesto', 'Departamento'].map(h => (
              <th key={h} style={{
                padding: '5px 8px',
                fontSize: '7pt', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                borderBottom: '1.5px solid #000', textAlign: 'left',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPANY_ORDER.map(companyId => {
            const emps = grouped[companyId]
            if (!emps || emps.length === 0) return null
            return (
              <>
                {/* Company header row */}
                <tr key={`header-${companyId}`}>
                  <td colSpan={4} style={{
                    padding: '10px 10px 7px',
                    background: '#f0f0f0',
                    borderLeft: `4px solid ${COMPANY_COLORS[companyId]}`,
                    fontWeight: 700, fontSize: '8.5pt',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    {COMPANY_NAMES[companyId]}
                    <span style={{ fontWeight: 400, fontSize: '7.5pt', marginLeft: '8px' }}>
                      ({emps.length} colaboradores)
                    </span>
                  </td>
                </tr>
                {/* Employee rows */}
                {emps.map((emp, i) => (
                  <tr key={emp.id} style={{ 
                    background: i % 2 === 0 ? 'white' : '#f9f9f9' 
                  }}>
                    <td style={{
                      padding: '5px 8px', textAlign: 'center',
                      fontFamily: 'Courier New, monospace',
                      fontWeight: 700, fontSize: '9pt',
                      borderBottom: '1px solid #e8e8e8',
                    }}>
                      {emp.extension ?? '—'}
                    </td>
                    <td style={{
                      padding: '5px 8px', fontWeight: 600,
                      fontSize: '8.5pt', borderBottom: '1px solid #e8e8e8',
                    }}>
                      {emp.name}
                    </td>
                    <td style={{
                      padding: '5px 8px', fontSize: '8pt',
                      color: '#333', borderBottom: '1px solid #e8e8e8',
                    }}>
                      {emp.position ?? '—'}
                    </td>
                    <td style={{
                      padding: '5px 8px', fontSize: '8pt',
                      color: '#555', borderBottom: '1px solid #e8e8e8',
                    }}>
                      {emp.department ?? '—'}
                    </td>
                  </tr>
                ))}
              </>
            )
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{
        marginTop: '16px', paddingTop: '8px',
        borderTop: '1px solid #ccc',
        display: 'flex', justifyContent: 'space-between',
        fontSize: '7pt', color: '#888',
      }}>
        <span>Confidencial — Uso interno Grupo Shuma</span>
        <span>Generado el {date}</span>
      </div>
    </>
  )
}

export default function PrintPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', height: '50vh',
        fontFamily: 'Arial', fontSize: '14px', color: '#666',
      }}>
        Cargando directorio de extensiones...
      </div>
    }>
      <PrintContent />
    </Suspense>
  )
}
