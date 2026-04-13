import type { Metadata, Viewport } from 'next'
import { DM_Sans, Orbitron } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { RgbSignature } from '@/components/rgb-signature'
import { Toaster } from 'sonner'
import { ScrollToTop } from '@/components/scroll-to-top'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: '--font-orbitron',
  display: 'swap',
});

const neuropol = localFont({
  src: '../public/fonts/Neuropol.otf',
  variable: '--font-neuropol',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'DIRECTORIO | Shuma',
  description: 'Directorio corporativo de las empresas Shuma',
}

export type ViewMode = "grid" | "list";

export const viewport: Viewport = {
  themeColor: '#0C0E11',
  viewportFit: 'cover',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${neuropol.variable} ${orbitron.variable} dark`} style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className={`${dmSans.variable} font-dm-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <div className="dot-grid-overlay" />
          <div className="pb-7">
            {children}
          </div>
          <RgbSignature />
          <ScrollToTop />
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
