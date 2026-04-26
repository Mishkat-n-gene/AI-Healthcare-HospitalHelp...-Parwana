'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { Facility } from '@/lib/types'
import { useAgentQuery } from '@/hooks/useAgentQuery'
import { useAppStore } from '@/lib/store'
import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons'
import { TrustScoreBadge } from '@/components/ui/TrustScoreBadge'
import { cn, trustLabel } from '@/lib/utils'
import { AgentQueryBar } from '@/components/agent/AgentQueryBar'
import { AgentProgressTracker } from '@/components/ui/AgentProgressTracker'
import { ReasoningChain } from '@/components/agent/ReasoningChain'

const IndiaMap = dynamic(() => import('@/components/map/IndiaMap').then((m) => m.IndiaMap), {
  ssr: false,
  loading: () => <LoadingSkeletons.MapPanel />
})

function currentStepFromProgress(progress: number) {
  if (progress < 20) return 1
  if (progress < 45) return 2
  if (progress < 70) return 3
  return 4
}

export default function QueryPage() {
  const [q, setQ] = useState('')
  const { trigger, isRunning, elapsedMs, progress, steps, result, error } = useAgentQuery()
  const setActiveRunId = useAppStore((s) => s.setActiveRunId)
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; text: string }>>([])
  const lastRunId = useRef<string | null>(null)

  const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const summarizeFacilities = (facilities: Facility[]) => {
    if (!facilities.length) return 'No matching facilities found. Try broadening the query or removing a constraint.'
    const top = facilities.slice(0, 3)
    const lines = top.map((f) => `${f.name} (${f.state}, ${f.district}) trust ${Math.round(f.trust_score)}`)
    return `Top matches: ${lines.join('; ')}`
  }

  const facilities = useMemo(() => result?.facilities ?? [], [result?.facilities])
  const currentStep = currentStepFromProgress(progress)

  const ranked = useMemo(() => [...facilities].sort((a, b) => b.trust_score - a.trust_score), [facilities])

  useEffect(() => {
    if (!result?.run_id) return
    if (lastRunId.current === result.run_id) return
    lastRunId.current = result.run_id
    const summary = summarizeFacilities(result.facilities ?? [])
    setMessages((prev) => [...prev, { id: makeId(), role: 'assistant', text: summary }])
  }, [result])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-4">
        <div>
          <div className="text-2xl font-semibold">Query the Agent</div>
          <div className="mt-1 text-sm text-[color:var(--color-text-muted)]">
            Trigger the Databricks agent run, then transparently display the returned reasoning chain (no client-side scoring).
          </div>
        </div>

        <AgentQueryBar
          value={q}
          onChange={setQ}
          onSubmit={async () => {
            const query = q.trim()
            if (!query) return
            setMessages((prev) => [...prev, { id: makeId(), role: 'user', text: query }])
            const res = await trigger(query)
            if (res?.run_id) setActiveRunId(res.run_id)
            setQ('')
          }}
          loading={isRunning}
        />

        <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-4">
          <div className="text-sm font-semibold">Conversation</div>
          <div className="mt-3 grid gap-3">
            {messages.length ? (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[92%] rounded-2xl border px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'ml-auto border-[color:var(--color-secondary)]/40 bg-[color:var(--color-secondary)]/15'
                      : 'mr-auto bg-white/5'
                  )}
                >
                  <div className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    {m.role === 'user' ? 'You' : 'Agent'}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">{m.text}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-[color:var(--color-text-muted)]">Ask the agent a question to start the conversation.</div>
            )}
          </div>
        </div>

        {isRunning ? (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6">
              <AgentProgressTracker currentStep={currentStep} steps={steps} />
              <div className="mt-3 rounded-xl border bg-[color:var(--color-bg-card)]/40 px-3 py-2 text-xs text-[color:var(--color-text-muted)]">
                Elapsed: <span className="font-mono">{(elapsedMs / 1000).toFixed(1)}s</span> · Progress:{' '}
                <span className="font-mono">{Math.round(progress)}%</span>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6">
              <LoadingSkeletons.MapPanel />
            </div>
          </div>
        ) : null}

        {error ? <div className="rounded-xl border bg-[color:var(--color-danger)]/10 p-3 text-sm">{error}</div> : null}

        {result ? (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6">
              <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Ranked Facilities</div>
                  <div className="text-xs text-[color:var(--color-text-muted)]">
                    {ranked.length ? `Showing ${ranked.length} matches` : 'No matches'}
                  </div>
                </div>
                <div className="mt-3 grid gap-3">
                  {ranked.length ? (
                    ranked.slice(0, 12).map((f: Facility) => (
                      <button
                        key={f.id}
                        className="focus-ring rounded-2xl border bg-white/5 p-3 text-left hover:bg-white/10"
                        onClick={() => useAppStore.getState().setSelectedFacilityId(f.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">{f.name}</div>
                            <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                              {f.state} · {f.district} · <span className="font-mono">{f.pincode}</span>
                            </div>
                          </div>
                          <TrustScoreBadge score={f.trust_score} label={trustLabel(f.trust_score)} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {f.capabilities.slice(0, 3).map((c) => (
                            <span key={c} className="rounded-full border bg-white/5 px-2 py-0.5 text-xs">
                              {c}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-xl border bg-white/5 p-4 text-sm text-[color:var(--color-text-muted)]">
                      The agent found no facilities matching your query. Try broadening your search.
                    </div>
                  )}
                </div>
              </div>

              <ReasoningChain steps={result.reasoning_chain ?? []} className="mt-4" />
            </div>

            <div className="col-span-12 lg:col-span-6">
              <div className="h-[72vh]">
                <IndiaMap mode="FACILITIES" facilities={ranked} deserts={[]} onFacilitySelect={(id) => useAppStore.getState().setSelectedFacilityId(id)} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

