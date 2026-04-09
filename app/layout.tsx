import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scadix - Gestione Progetti e Scadenze',
  description: 'Sistema di gestione progetti, asset e scadenze',
  manifest: '/manifest.json',
  themeColor: '#61a5ff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Scadix',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Colors */}
        <meta name="theme-color" content="#ea580c" />
        <meta name="msapplication-TileColor" content="#ea580c" />
        
        {/* iOS Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Scadix" />
        
        {/* iOS Icons */}
        <link rel="apple-touch-icon" href="/apple/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple/icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple/icon-167x167.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple/icon-180x180.png" />
        
        {/* iOS Splash Screens - iPhone */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
        
        {/* Windows Tiles */}
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileImage" content="/windows/icon-150x150.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
      </head>
      <body className={inter.className}>
        {children}
        <Script src="/register-sw.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
