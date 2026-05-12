import type { Metadata, Viewport } from 'next'
import { DM_Sans, Orbitron } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { FontScaleProvider } from '@/lib/FontScaleContext'
import { CompanyThemeProvider } from '@/lib/CompanyThemeContext'
import { RgbSignature } from '@/components/rgb-signature'
import { Toaster } from 'sonner'
import { ScrollToTop } from '@/components/scroll-to-top'
import { ParticleBackground } from '@/components/particle-background'
import { AmbientGlows } from '@/components/ambient-glows'
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
  title: 'Directorio Shuma',
  description: 'Directorio de colaboradores de Grupo Shuma',
  robots: 'noindex, nofollow',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon-180x180.png', sizes: '180x180' },
    ],
    other: [
      { url: '/favicon-192x192.png', sizes: '192x192', rel: 'icon' },
      { url: '/favicon-512x512.png', sizes: '512x512', rel: 'icon' },
    ],
  },
}

export type ViewMode = "grid" | "list";

export const viewport: Viewport = {
  themeColor: '#0C0E11',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${neuropol.variable} ${orbitron.variable}`} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${dmSans.variable} font-dm-sans antialiased`} style={{ paddingBottom: 'env(safe-area-inset-bottom)', paddingTop: 'env(safe-area-inset-top)' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="shuma-theme"
          themes={['dark', 'light']}
        >
          <FontScaleProvider>
            <CompanyThemeProvider>
              <AmbientGlows />
              <ParticleBackground />
              <div className="dot-grid-overlay" />
              <div className="pb-7 relative z-[1]">
                {children}
              </div>
              <RgbSignature />
              <ScrollToTop />
              <Toaster position="bottom-right" richColors />
            </CompanyThemeProvider>
          </FontScaleProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
