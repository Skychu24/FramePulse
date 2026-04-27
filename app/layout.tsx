import type { Metadata, Viewport } from 'next'
import { Orbitron, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminModalProvider } from '@/contexts/AdminModalContext'
import './globals.css'

const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: '--font-orbitron',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FramePulse | Academic Video Archive',
  description: 'Access high-quality screen recordings curated for the batch',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.ico', // Simple way to point to your new icon
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a12',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <AuthProvider>
          <AdminModalProvider>
            {children}
          </AdminModalProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
