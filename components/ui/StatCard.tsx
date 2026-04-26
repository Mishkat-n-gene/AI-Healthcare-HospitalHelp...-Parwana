import type { ReactNode } from 'react'

import { cn, formatNumber } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon,
  trend,
  color,
  className
}: {
  label: string
  value: number | string
  icon?: ReactNode
  trend?: string
  color?: string
  className?: string
}) {
  const v = typeof value === 'number' ? formatNumber(value) : value
  return (
    <div className={cn('rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-4 shadow-[0_0_0_1px_rgba(27,138,143,0.12)]', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-[color:var(--color-text-muted)]">{label}</div>
        {icon ? (
          <div className="grid h-9 w-9 place-items-center rounded-xl border bg-[color:var(--color-bg-dark)]/40" style={color ? { borderColor: color } : undefined}>
            {icon}
          </div>
        ) : null}
      </div>
      <div className="mt-2 font-mono text-3xl font-semibold" style={color ? { color } : undefined}>
        {v}
      </div>
      {trend ? <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">{trend}</div> : null}
    </div>
  )
}

