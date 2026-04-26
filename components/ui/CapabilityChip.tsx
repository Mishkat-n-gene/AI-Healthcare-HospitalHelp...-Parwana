import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

export function CapabilityChip({
  name,
  status,
  className
}: {
  name: string
  status: 'verified' | 'flagged' | 'unverified'
  className?: string
}) {
  const Icon = status === 'verified' ? CheckCircle2 : status === 'flagged' ? XCircle : HelpCircle
  const styles =
    status === 'verified'
      ? 'border-[color:var(--color-success)]/40 bg-[color:var(--color-success)]/10'
      : status === 'flagged'
        ? 'border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10'
        : 'border-[color:var(--color-border)] bg-[color:var(--color-bg-card)]/60'

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs', styles, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{name}</span>
    </span>
  )
}

