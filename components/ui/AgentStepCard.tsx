import { cn, formatPct } from '@/lib/utils'
import type { ReasoningStep } from '@/lib/types'

const AGENT_COLORS: Record<ReasoningStep['agent'], string> = {
  Extractor: 'rgba(27,138,143,1)',
  Validator: 'rgba(244,162,97,1)',
  Scorer: 'rgba(45,198,83,1)',
  Mapper: 'rgba(230,57,70,1)'
}

export function AgentStepCard({ step, className }: { step: ReasoningStep; className?: string }) {
  const color = AGENT_COLORS[step.agent]
  return (
    <div className={cn('rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-4', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
            style={{ borderColor: color, color }}
          >
            {step.agent}
          </span>
          <span className="text-sm font-semibold">Step {step.step}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
          <span className="rounded-full border px-2 py-0.5 font-mono">{formatPct(step.confidence * 100)}</span>
          <span className="rounded-full border px-2 py-0.5 font-mono">{step.duration_ms}ms</span>
        </div>
      </div>

      <div className="mt-3 text-sm font-medium">{step.action}</div>
      <div className="mt-2 grid gap-2 text-sm text-[color:var(--color-text-muted)]">
        <div>
          <div className="text-xs font-mono uppercase tracking-wide">Input</div>
          <div className="mt-1 line-clamp-3">{step.input}</div>
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-wide">Output</div>
          <div className="mt-1 line-clamp-3">{step.output}</div>
        </div>
      </div>
    </div>
  )
}

