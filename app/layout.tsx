import type { Metadata, Viewport } from 'next'
import { DM_Sans, Orbitron } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { MobileTopNavbar } from '@/components/mobile-top-navbar'
import { MobileBottomTabBar } from '@/components/mobile-bottom-tab-bar'
import { AdminProvider } from '@/components/admin/admin-context'
import { PinModal } from '@/components/admin/pin-modal'
import { AdminTrigger } from '@/components/admin/admin-trigger'
import { AdminToolbar } from '@/components/admin/admin-toolbar'
import { Toaster } from 'sonner'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
});

const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DIRECTORIO | Shuma',
  description: 'Directorio corporativo de las empresas Shuma',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

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
    <html lang="es" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${orbitron.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AdminProvider>
            <Navbar />
            <MobileTopNavbar />
            {children}
            <MobileBottomTabBar />
            <AdminTrigger />
            <AdminToolbar />
            <PinModal />
            <Toaster position="bottom-right" />
          </AdminProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
