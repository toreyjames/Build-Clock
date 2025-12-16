import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Build Clock | Deloitte',
  description: 'U.S. Industrial Investment Intelligence - Tracking the reshoring wave.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


