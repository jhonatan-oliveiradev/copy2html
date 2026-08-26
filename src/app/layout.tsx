import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Copy2HTML',
  description: 'Do Word ao Liferay, com HTML limpo e previsível.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
