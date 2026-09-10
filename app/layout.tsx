import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Libriva',
  description: 'Il marketplace indipendente per ebook e opere digitali',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
