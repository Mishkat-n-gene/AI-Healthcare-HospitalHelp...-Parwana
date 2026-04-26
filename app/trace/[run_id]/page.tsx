'use client'

import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, Timer } from 'lucide-react'

import type { MLflowTrace } from '@/lib/types'
import { AgentStepCard } from '@/components/ui/AgentStepCard'
import { cn, formatNumber } from '@/lib/utils'

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function TracePage({ params }: { params: { run_id: string } }) {
  const runId = params.run_id
  const [trace, setTrace] = useState<MLflowTrace | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      const res = await fetch(`/api/trace/${encodeURIComponent(runId)}`)
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        if (!cancelled) setError(json?.error?.message ?? 'Failed to load trace')
        return
      }
      if (!cancelled) setTrace(json as MLflowTrace)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [runId])

  const totalMs = trace?.total_duration_ms ?? 0
  const totalSec = useMemo(() => (totalMs ? (totalMs / 1000).toFixed(1) : '—'), [totalMs])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold">Reasoning Trace</div>
            <div className="mt-1 text-sm text-[color:var(--color-text-muted)]">
              Run ID: <span className="font-mono">{runId}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
              <span className="rounded-full border bg-white/5 px-2 py-0.5 font-mono">Agent: {trace?.agent_version ?? '—'}</span>
              <span className="inline-flex items-center gap-2 rounded-full border bg-white/5 px-2 py-0.5 font-mono">
                <Timer className="h-3.5 w-3.5" aria-hidden="true" /> {totalSec}s
              </span>
              <span className="rounded-full border bg-white/5 px-2 py-0.5 font-mono">Steps: {formatNumber(trace?.steps?.length ?? 0)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="focus-ring inline-flex items-center gap-2 rounded-xl border bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href)
              }}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Share Trace
            </button>
            <button
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-secondary)] px-3 py-2 text-xs font-semibold text-white shadow-glow"
              onClick={() => {
                // Browser-native "Save as PDF" via print dialog.
                window.print()
                downloadText(`trace-${runId}.json`, JSON.stringify(trace ?? { run_id: runId }, null, 2))
              }}
              disabled={!trace}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export report
            </button>
          </div>
        </div>
        {error ? <div className="mt-3 rounded-xl border bg-[color:var(--color-danger)]/10 p-3 text-sm">{error}</div> : null}
      </div>

      <div className={cn('mt-4 grid gap-3', !trace ? 'opacity-70' : '')}>
        {(trace?.steps ?? []).map((s) => (
          <AgentStepCard key={`${s.agent}-${s.step}`} step={s} />
        ))}
        {trace && !trace.steps.length ? <div className="rounded-xl border bg-white/5 p-4 text-sm text-[color:var(--color-text-muted)]">No steps returned.</div> : null}
      </div>
    </div>
  )
}

