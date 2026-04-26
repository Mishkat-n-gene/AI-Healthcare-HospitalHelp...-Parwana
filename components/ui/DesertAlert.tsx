import { MapPin, Radar, Route } from 'lucide-react'

import type { Desert } from '@/lib/types'
import { cn, formatNumber } from '@/lib/utils'

const RISK_COLORS: Record<Desert['risk_level'], string> = {
  Critical: 'var(--color-danger)',
  High: 'var(--color-accent)',
  Medium: 'var(--color-warning)',
  Low: 'var(--color-success)'
}

export function DesertAlert({ desert, className }: { desert: Desert; className?: string }) {
  const color = RISK_COLORS[desert.risk_level]
  return (
    <div className={cn('rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-4', className)} style={{ borderColor: `${color}` }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radar className="h-5 w-5" style={{ color }} aria-hidden="true" />
          <div className="text-sm font-semibold">Medical Desert</div>
        </div>
        <span className="rounded-full border px-2 py-0.5 text-xs font-medium" style={{ borderColor: color, color }}>
          {desert.risk_level}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-[color:var(--color-text-muted)]">
        <MapPin className="h-4 w-4" aria-hidden="true" />
        <span>
          {desert.state} · {desert.district} · {desert.pincode}
        </span>
      </div>
      <div className="mt-3 text-sm">
        <div className="text-xs font-mono uppercase tracking-wide text-[color:var(--color-text-muted)]">Missing capabilities</div>
        <div className="mt-1 flex flex-wrap gap-2">
          {desert.missing_capabilities.map((c) => (
            <span key={c} className="rounded-full border bg-white/5 px-2 py-0.5 text-xs">
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[color:var(--color-text-muted)]">
        <div className="flex items-center gap-2">
          <Route className="h-4 w-4" aria-hidden="true" />
          <span className="font-mono">{desert.nearest_facility_km.toFixed(1)}km</span>
          <span>to nearest</span>
        </div>
        <div className="text-right">
          <span className="font-mono">{formatNumber(desert.population_affected)}</span> affected
        </div>
      </div>
    </div>
  )
}

