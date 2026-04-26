import { Quote } from 'lucide-react'

import { cn } from '@/lib/utils'

export function EvidenceQuote({
  sentence,
  field,
  confidence,
  className
}: {
  sentence: string
  field: string
  confidence: number
  className?: string
}) {
  return (
    <blockquote className={cn('rounded-xl border bg-[color:var(--color-bg-card)]/60 p-4', className)}>
      <div className="flex items-start gap-3">
        <Quote className="mt-0.5 h-5 w-5 text-[color:var(--color-secondary)]" aria-hidden="true" />
        <div className="flex-1">
          <div className="text-sm text-[color:var(--color-text)]">{sentence}</div>
          <div className="mt-2 flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
            <span className="font-mono">{field}</span>
            <span className="font-mono">{Math.round(confidence * 100)}% confidence</span>
          </div>
        </div>
      </div>
    </blockquote>
  )
}

