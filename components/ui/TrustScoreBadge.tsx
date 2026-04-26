import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX } from 'lucide-react'

import { cn, trustColor } from '@/lib/utils'
import type { Facility } from '@/lib/types'

export function TrustScoreBadge({ score, label, className }: { score: number; label: Facility['trust_label']; className?: string }) {
  const icon =
    label === 'Verified'
      ? ShieldCheck
      : label === 'Contradictory'
        ? ShieldAlert
        : label === 'Incomplete'
          ? ShieldQuestion
          : ShieldX
  const Icon = icon
  const color = trustColor(score)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        'bg-[color:var(--color-bg-card)]/70',
        className
      )}
      style={{ borderColor: color }}
      aria-label={`Trust ${label} score ${score}`}
    >
      <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden="true" />
      <span className="text-[color:var(--color-text)]">{label}</span>
      <span className="font-mono text-[color:var(--color-text-muted)]">{score}</span>
    </span>
  )
}

