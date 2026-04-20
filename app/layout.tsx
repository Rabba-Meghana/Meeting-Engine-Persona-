import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meeting Persona Engine',
  description: 'Behavioral DNA from conversation data — powered by Recall.ai + Groq',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise">{children}</body>
    </html>
  )
}
