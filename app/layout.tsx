import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hamiltonian Build Clock',
  description: 'Not just how much we owe – how much of it is actually building America.',
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


