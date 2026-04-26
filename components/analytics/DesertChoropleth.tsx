'use client'

import type { Desert } from '@/lib/types'

export function DesertChoropleth({ deserts }: { deserts: Desert[] }) {
  // Hackathon-friendly placeholder: shows high-signal summary without reinventing backend geo logic.
  const byRisk = deserts.reduce(
    (acc, d) => {
      acc[d.risk_level] = (acc[d.risk_level] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-4">
      <div className="text-sm font-semibold">Medical Desert Risk by State</div>
      <div className="mt-2 text-sm text-[color:var(--color-text-muted)]">
        Medical Desert Risk by State.
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {Object.entries(byRisk).map(([k, v]) => (
          <div key={k} className="rounded-xl border bg-white/5 p-3">
            <div className="text-xs font-mono uppercase tracking-wide text-[color:var(--color-text-muted)]">{k}</div>
            <div className="mt-1 font-mono text-2xl font-semibold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

