import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'חן דיין - עבודות עפר ופיתוח',
  description: 'חן דיין עבודות עפר ופיתוח',
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
