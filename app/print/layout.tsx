import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Directorio de Extensiones — Grupo Shuma',
  robots: 'noindex, nofollow',
}

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body style={{
        margin: 0,
        padding: 0,
        background: 'white',
        color: '#000',
        fontFamily: 'Arial, sans-serif',
      }}>
        {children}
      </body>
    </html>
  )
}
