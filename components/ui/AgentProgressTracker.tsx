'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export function AgentProgressTracker({
  currentStep,
  steps,
  className
}: {
  currentStep: number
  steps: Array<{ id: number; label: string; hint: string }>
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <div className={cn('rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-4', className)}>
      <div className="text-sm font-semibold">Agent pipeline</div>
      <div className="mt-3 grid gap-3">
        {steps.map((s, idx) => {
          const active = s.id === currentStep
          const done = s.id < currentStep
          return (
            <motion.div
              key={s.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.25 }}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3',
                active
                  ? 'border-[color:var(--color-secondary)]/60 bg-[color:var(--color-secondary)]/10'
                  : done
                    ? 'border-[color:var(--color-success)]/40 bg-[color:var(--color-success)]/10'
                    : 'border-[color:var(--color-border)] bg-transparent'
              )}
            >
              <div className="mt-0.5 h-2.5 w-2.5 rounded-full" style={{ background: done ? 'var(--color-success)' : active ? 'var(--color-secondary)' : 'rgba(136,153,170,0.35)' }} />
              <div className="flex-1">
                <div className="text-sm font-medium">{s.label}</div>
                <div className="mt-0.5 text-sm text-[color:var(--color-text-muted)]">{s.hint}</div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

