"use client"

export default function FloatingNodes() {
  const NODES = [
    { initials: 'JF', name: 'Gerente Sistemas',  color: '#185FA5', bg: '#E6F1FB' },
    { initials: 'CM', name: 'Dir. General',      color: '#A32D2D', bg: '#FCEBEB' },
    { initials: 'AL', name: 'Ventas CDMX',       color: '#0F6E56', bg: '#E1F5EE' },
    { initials: 'RG', name: 'Contabilidad',      color: '#854F0B', bg: '#FAEEDA' },
    { initials: 'SP', name: 'Rec. Humanos',      color: '#534AB7', bg: '#EEEDFE' },
    { initials: 'FB', name: 'Aux. Sistemas',     color: '#185FA5', bg: '#E6F1FB' },
    { initials: 'KH', name: 'Acabados Puebla',   color: '#A32D2D', bg: '#FCEBEB' },
    { initials: 'IE', name: 'Logística',         color: '#0F6E56', bg: '#E1F5EE' },
  ]

  const POSITIONS = [
    { left: '5%',  top: '15%' },
    { left: '72%', top: '10%' },
    { left: '15%', top: '55%' },
    { left: '68%', top: '60%' },
    { left: '2%',  top: '35%' },
    { left: '78%', top: '35%' },
    { left: '20%', top: '78%' },
    { left: '60%', top: '80%' },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden"
         aria-hidden="true">
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
      `}</style>
      {NODES.map((n, i) => (
        <div
          key={n.initials}
          className="absolute flex items-center gap-2 px-3 py-2
                     rounded-xl text-xs text-white/60 whitespace-nowrap"
          style={{
            left: POSITIONS[i].left,
            top:  POSITIONS[i].top,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            animation: `floatUp ${5 + (i % 3)}s ${i * 0.8}s linear infinite`,
          }}
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center
                       text-[10px] font-medium flex-shrink-0"
            style={{ background: n.bg, color: n.color }}
          >
            {n.initials}
          </span>
          {n.name}
        </div>
      ))}
    </div>
  )
}
