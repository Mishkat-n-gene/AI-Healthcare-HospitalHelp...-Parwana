import { AlertTriangle } from 'lucide-react'

import { cn } from '@/lib/utils'

export function RedFlagCard({ flag, className }: { flag: string; className?: string }) {
  return (
    <div className={cn('flex gap-3 rounded-xl border bg-[color:var(--color-accent)]/10 p-3', className)}>
      <div className="mt-0.5">
        <AlertTriangle className="h-5 w-5 text-[color:var(--color-accent)]" aria-hidden="true" />
      </div>
      <div>
        <div className="text-sm font-medium">Red flag</div>
        <div className="text-sm text-[color:var(--color-text-muted)]">{flag}</div>
      </div>
    </div>
  )
}

