import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
  display: 'swap',
});

const neuropol = localFont({
  src: '../public/fonts/Neuropol.otf',
  variable: '--font-neuropol',
  display: 'block',
})

export const metadata: Metadata = {
  title: 'DIRECTORIO | Shuma',
  description: 'Directorio corporativo de las empresas Shuma',
}

export type ViewMode = "grid" | "list";

export const viewport: Viewport = {
  themeColor: '#080810',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={neuropol.variable} suppressHydrationWarning>
      <body className={`${dmSans.variable} font-dm-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <div className="dot-grid-overlay" />
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
