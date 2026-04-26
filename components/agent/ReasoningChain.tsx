'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { ReasoningStep } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AgentStepCard } from '@/components/ui/AgentStepCard'

export function ReasoningChain({ steps, className }: { steps: ReasoningStep[]; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('rounded-2xl border bg-[color:var(--color-bg-card)]/60', className)}>
      <button
        className="focus-ring flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div>
          <div className="text-sm font-semibold">Agent Reasoning Chain</div>
          <div className="text-sm text-[color:var(--color-text-muted)]">Live steps from MLflow trace (display-only).</div>
        </div>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open ? 'rotate-180' : '')} aria-hidden="true" />
      </button>
      {open ? (
        <div className="grid gap-3 border-t p-4">
          {steps.map((s) => (
            <AgentStepCard key={`${s.agent}-${s.step}`} step={s} />
          ))}
          {!steps.length ? <div className="text-sm text-[color:var(--color-text-muted)]">No reasoning steps returned.</div> : null}
        </div>
      ) : null}
    </div>
  )
}

