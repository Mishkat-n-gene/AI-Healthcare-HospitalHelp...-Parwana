'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import type { Facility, TrustScore } from '@/lib/types'
import { cn, trustLabel } from '@/lib/utils'
import { TrustRing } from '@/components/ui/TrustRing'
import { TrustScoreBadge } from '@/components/ui/TrustScoreBadge'
import { CapabilityChip } from '@/components/ui/CapabilityChip'
import { RedFlagCard } from '@/components/ui/RedFlagCard'

export function FacilityDetailPanel({
  facility,
  trust,
  runId,
  className
}: {
  facility?: Facility
  trust?: TrustScore
  runId?: string
  className?: string
}) {
  const [full, setFull] = useState<Facility | null>(facility ?? null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFull(facility ?? null)
  }, [facility])

  useEffect(() => {
    const id = facility?.id ?? ''
    if (!id) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/facilities/${encodeURIComponent(id)}`)
        const json = await res.json().catch(() => null)
        if (!res.ok) return
        if (!cancelled) setFull((json?.facility as Facility) ?? facility ?? null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [facility])

  const f = full
  const label = f ? (f.trust_label ?? trustLabel(f.trust_score)) : 'Incomplete'
  const breakdown = trust?.breakdown
  const redFlags = trust?.red_flags ?? f?.flags ?? []
  const caps = useMemo(() => f?.capabilities ?? [], [f?.capabilities])

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('h-full rounded-2xl border bg-[color:var(--color-bg-card)]/40 p-4', className)}
      aria-live="polite"
    >
      {!f ? (
        <div className="grid gap-2">
          <div className="text-sm font-semibold">Facility Intelligence</div>
          <div className="text-sm text-[color:var(--color-text-muted)]">
            Select a facility on the map to explore its AI-generated intelligence profile.
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold leading-tight">{f.name}</div>
              <div className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                {f.state} &gt; {f.district} &gt; <span className="font-mono">{f.pincode}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border bg-white/5 px-2.5 py-1 text-xs">{f.type}</span>
                <TrustScoreBadge score={f.trust_score} label={label} />
              </div>
            </div>
            <TrustRing score={f.trust_score} />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-semibold">Capabilities</div>
            <div className="flex flex-wrap gap-2">
              {caps.map((c) => (
                <CapabilityChip key={c} name={c} status={redFlags.length ? 'unverified' : 'verified'} />
              ))}
              {!caps.length ? <div className="text-sm text-[color:var(--color-text-muted)]">No capabilities returned.</div> : null}
            </div>
          </div>

          {breakdown ? (
            <div className="grid gap-2">
              <div className="text-sm font-semibold">Trust score breakdown</div>
              <div className="grid gap-2">
                {(
                  [
                    ['Equipment Consistency', breakdown.equipment_consistency],
                    ['Staff Verified', breakdown.staff_claims_verified],
                    ['Availability', breakdown.availability_plausibility],
                    ['Data Completeness', breakdown.data_completeness]
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="grid gap-1">
                    <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
                      <span>{k}</span>
                      <span className="font-mono">{Math.round(v)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-[color:var(--color-secondary)]"
                        style={{ width: `${Math.max(0, Math.min(100, v))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-2">
            <div className="text-sm font-semibold">Red flags</div>
            {redFlags.length ? (
              redFlags.map((rf) => <RedFlagCard key={rf} flag={rf} />)
            ) : (
              <div className="text-sm text-[color:var(--color-text-muted)]">No red flags returned.</div>
            )}
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-semibold">Specialists</div>
            <div className="flex flex-wrap gap-2">
              {f.specialists?.map((s) => (
                <span key={s} className="rounded-full border bg-white/5 px-2 py-0.5 text-xs">
                  {s}
                </span>
              ))}
              {!f.specialists?.length ? <div className="text-sm text-[color:var(--color-text-muted)]">No specialists returned.</div> : null}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-semibold">Equipment</div>
            <div className="flex flex-wrap gap-2">
              {f.equipment?.map((s) => (
                <span key={s} className="rounded-full border bg-white/5 px-2 py-0.5 text-xs">
                  {s}
                </span>
              ))}
              {!f.equipment?.length ? <div className="text-sm text-[color:var(--color-text-muted)]">No equipment returned.</div> : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-[color:var(--color-text-muted)]">
              {loading
                ? 'Loading details…'
                : f.last_verified
                  ? `Last verified: ${new Date(f.last_verified).toLocaleDateString('en-IN')}`
                  : 'Last verified: unknown'}
            </div>
            {runId ? (
              <Link
                className="focus-ring rounded-xl border bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
                href={`/trace/${encodeURIComponent(runId)}`}
                target="_blank"
              >
                View Full Reasoning Chain
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </motion.aside>
  )
}

