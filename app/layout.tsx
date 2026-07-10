import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import OfflineStatus from '@/components/offline-status'
import LanguageToggle from '@/components/language-toggle'
import { LanguageProvider } from '@/components/language-provider'
import { validateEnvironment } from '@/lib/validate-env'

// Validate environment at runtime
if (typeof window === 'undefined') {
  validateEnvironment()
}

export const metadata: Metadata = {
  title: 'Manas Store - Inventory Management',
  description: 'Smart inventory management for Manas Store with offline support',
  generator: 'v0.app',
  applicationName: 'Manas Store',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Manas Store',
  },
  formatDetection: {
    telephone: false,
  },
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
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2563EB',
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
    <html lang="en" className="bg-background">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Manas Store" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased bg-background text-foreground font-inter">
        <LanguageProvider>
          <LanguageToggle />
          <OfflineStatus />
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
          <script
            dangerouslySetInnerHTML={{
              __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}); }`,
            }}
          />
        </LanguageProvider>
      </body>
    </html>
  )
}


