import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Agentic Healthcare Maps — India',
  description: 'Agentic healthcare intelligence maps powered by Databricks.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} dark`}>
      <body className="min-h-screen">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(27,138,143,0.18),transparent_45%),radial-gradient(900px_circle_at_70%_30%,rgba(244,162,97,0.10),transparent_40%)]" />
        <header className="sticky top-0 z-50 border-b bg-[color:var(--color-bg-dark)]/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md px-2 py-1">
              <span className="font-semibold tracking-tight">Serving A Nation</span>
              <span className="rounded-full border px-2 py-0.5 font-mono text-xs text-[color:var(--color-text-muted)]">
                AI Healthcare Maps
              </span>
            </Link>
            <nav className="flex items-center gap-2 text-sm text-[color:var(--color-text-muted)]">
              <Link className="focus-ring rounded-md px-3 py-2 hover:text-[color:var(--color-text)]" href="/dashboard">
                Dashboard
              </Link>
              <Link className="focus-ring rounded-md px-3 py-2 hover:text-[color:var(--color-text)]" href="/query">
                Query
              </Link>
              <Link className="focus-ring rounded-md px-3 py-2 hover:text-[color:var(--color-text)]" href="/analytics">
                Analytics
              </Link>
            </nav>
          </div>
        </header>
        <main className="relative">{children}</main>
      </body>
    </html>
  )
}

