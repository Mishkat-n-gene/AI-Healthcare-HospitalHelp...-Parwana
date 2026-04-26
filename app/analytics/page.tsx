'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, Hospital, ShieldCheck, Siren } from 'lucide-react'

import type { Desert, Facility, SummaryStats } from '@/lib/types'
import { StatCard } from '@/components/ui/StatCard'
import { TrustHistogram } from '@/components/analytics/TrustHistogram'
import { CapabilityGapChart } from '@/components/analytics/CapabilityGapChart'
import { StateComparisonTable } from '@/components/analytics/StateComparisonTable'
import { DesertChoropleth } from '@/components/analytics/DesertChoropleth'
import { TrustScoreBadge } from '@/components/ui/TrustScoreBadge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { trustLabel } from '@/lib/utils'

type SuspiciousRow = { id: string; name: string; state: string; trust_score: number; red_flag_count: number; primary: string }

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<SummaryStats | null>(null)
  const [deserts, setDeserts] = useState<Desert[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadError(null)
      const [sr, dr, fr] = await Promise.all([
        fetch('/api/analytics/summary'),
        fetch('/api/analytics/deserts'),
        fetch('/api/facilities/search?page=1&page_size=100')
      ])
      const [s, d, f] = await Promise.all([sr.json().catch(() => null), dr.json().catch(() => null), fr.json().catch(() => null)])
      if (cancelled) return
      if (!sr.ok) setLoadError((s as any)?.error?.message ?? 'Failed to load summary')
      if (!dr.ok) setLoadError((d as any)?.error?.message ?? 'Failed to load deserts')
      if (!fr.ok) setLoadError((f as any)?.error?.message ?? 'Failed to load facilities')

      setSummary(s && typeof s === 'object' && 'total_facilities' in (s as any) ? (s as SummaryStats) : null)
      setDeserts(Array.isArray(d) ? (d as Desert[]) : [])
      setFacilities(Array.isArray((f as any)?.items) ? ((f as any).items as Facility[]) : [])
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const suspicious: SuspiciousRow[] = useMemo(() => {
    return [...facilities]
      .filter((f) => f.trust_score < 50)
      .map((f) => ({ id: f.id, name: f.name, state: f.state, trust_score: f.trust_score, red_flag_count: f.flags?.length ?? 0, primary: f.flags?.[0] ?? '—' }))
      .sort((a, b) => a.trust_score - b.trust_score)
      .slice(0, 10)
  }, [facilities])

  const suspiciousColumns: Column<SuspiciousRow>[] = [
    { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span>, sortValue: (r) => r.name },
    { key: 'state', header: 'State', render: (r) => <span>{r.state}</span>, sortValue: (r) => r.state },
    {
      key: 'trust_score',
      header: 'Trust',
      render: (r) => <TrustScoreBadge score={r.trust_score} label={trustLabel(r.trust_score)} />,
      sortValue: (r) => r.trust_score
    },
    { key: 'red_flag_count', header: 'Flags', render: (r) => <span className="font-mono">{r.red_flag_count}</span>, sortValue: (r) => r.red_flag_count },
    { key: 'primary', header: 'Primary Contradiction', render: (r) => <span className="text-[color:var(--color-text-muted)]">{r.primary}</span> }
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="text-2xl font-semibold">Analytics</div>
      <div className="mt-1 text-sm text-[color:var(--color-text-muted)]">KPI and distribution views (display-only; no client-side scoring).</div>
      {loadError ? (
        <div className="mt-4 rounded-xl border bg-[color:var(--color-accent)]/10 p-3 text-sm text-[color:var(--color-text-muted)]">
          {loadError}. If you’re running locally without Databricks credentials, set <span className="font-mono">IS_MOCK_MODE=true</span> in
          <span className="font-mono"> .env.local</span>.
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Facilities Analyzed" value={summary?.total_facilities ?? '—'} icon={<Hospital className="h-4 w-4" aria-hidden="true" />} color="var(--color-secondary)" />
        <StatCard label="Avg Trust Score" value={summary ? Math.round(summary.avg_trust_score) : '—'} icon={<Activity className="h-4 w-4" aria-hidden="true" />} color="var(--color-warning)" />
        <StatCard label="Critical Desert Zones" value={summary?.critical_desert_zones ?? '—'} icon={<Siren className="h-4 w-4" aria-hidden="true" />} color="var(--color-danger)" />
        <StatCard label="Verified ICUs" value={summary?.verified_icus ?? '—'} icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} color="var(--color-success)" />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6">
          <TrustHistogram facilities={facilities} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <CapabilityGapChart deserts={deserts} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6">
          <DesertChoropleth deserts={deserts} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-4">
            <div className="text-sm font-semibold">Top 10 Suspicious Facilities</div>
            <div className="mt-3">
              <DataTable columns={suspiciousColumns} data={suspicious} sortable paginated pageSize={10} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <StateComparisonTable facilities={facilities} deserts={deserts} />
      </div>
    </div>
  )
}

