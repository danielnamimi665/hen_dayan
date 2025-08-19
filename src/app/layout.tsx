import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hen Dayan',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon.ico' }],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
      { url: '/apple-touch-icon-167.png', sizes: '167x167' },
      { url: '/apple-touch-icon-152.png', sizes: '152x152' },
      { url: '/apple-touch-icon-120.png', sizes: '120x120' }
    ],
  },
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="font-hebrew bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
