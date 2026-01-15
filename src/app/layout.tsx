import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tidsresan - Se hur din plats såg ut genom historien',
  description: 'Ta ett foto och se hur platsen såg ut från stenåldern till 1900-talet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  )
}
