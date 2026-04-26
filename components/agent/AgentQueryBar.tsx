'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'

const EXAMPLES = [
  'Find the nearest facility in rural Bihar with emergency surgery and 24/7 staff',
  'Show all hospitals claiming ICU but with no anesthesiologist on record',
  'Which districts in Uttar Pradesh have zero dialysis centers?',
  'Find oncology centers within 50km of Patna with a trust score above 70'
]

export function AgentQueryBar({
  value,
  onChange,
  onSubmit,
  loading,
  className
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  loading?: boolean
  className?: string
}) {
  const [idx, setIdx] = useState(0)
  const placeholder = useMemo(() => EXAMPLES[idx % EXAMPLES.length]!, [idx])

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => i + 1), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={cn('rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-3', className)}>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl border bg-[color:var(--color-bg-dark)]/40">
          <Search className="h-4 w-4 text-[color:var(--color-secondary)]" aria-hidden="true" />
        </div>
        <input
          className="focus-ring h-10 flex-1 rounded-xl border bg-white px-3 text-sm text-black placeholder:text-slate-500 caret-black"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit()
          }}
          aria-label="Agent query"
        />
        <button
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl bg-[color:var(--color-secondary)] px-4 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          onClick={onSubmit}
          disabled={loading || !value.trim()}
        >
          {loading ? 'Running…' : 'Search'}
        </button>
      </div>
    </div>
  )
}

