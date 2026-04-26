'use client'

import type { Desert, Facility } from '@/lib/types'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { TrustScoreBadge } from '@/components/ui/TrustScoreBadge'
import { trustLabel } from '@/lib/utils'

type Row = {
  state: string
  facilities: number
  avg_trust: number
  verified_icus: number
  deserts: number
  risk: 'Critical' | 'High' | 'Medium' | 'Low'
}

function riskFromDeserts(n: number): Row['risk'] {
  if (n >= 20) return 'Critical'
  if (n >= 10) return 'High'
  if (n >= 5) return 'Medium'
  return 'Low'
}

export function StateComparisonTable({ facilities, deserts }: { facilities: Facility[]; deserts: Desert[] }) {
  const byState = new Map<string, Row>()
  facilities.forEach((f) => {
    const row = byState.get(f.state) ?? {
      state: f.state,
      facilities: 0,
      avg_trust: 0,
      verified_icus: 0,
      deserts: 0,
      risk: 'Low'
    }
    row.facilities += 1
    row.avg_trust += f.trust_score
    if (f.has_icu && trustLabel(f.trust_score) === 'Verified') row.verified_icus += 1
    byState.set(f.state, row)
  })
  deserts.forEach((d) => {
    const row = byState.get(d.state) ?? {
      state: d.state,
      facilities: 0,
      avg_trust: 0,
      verified_icus: 0,
      deserts: 0,
      risk: 'Low'
    }
    row.deserts += 1
    byState.set(d.state, row)
  })

  const rows = [...byState.values()].map((r) => ({
    ...r,
    avg_trust: r.facilities ? r.avg_trust / r.facilities : 0,
    risk: riskFromDeserts(r.deserts)
  }))

  const columns: Column<Row>[] = [
    { key: 'state', header: 'State', render: (r) => <span className="font-medium">{r.state}</span>, sortValue: (r) => r.state },
    { key: 'facilities', header: 'Facilities', render: (r) => <span className="font-mono">{r.facilities}</span>, sortValue: (r) => r.facilities },
    {
      key: 'avg_trust',
      header: 'Avg Trust',
      render: (r) => <TrustScoreBadge score={Math.round(r.avg_trust)} label={trustLabel(r.avg_trust)} />,
      sortValue: (r) => r.avg_trust
    },
    {
      key: 'verified_icus',
      header: 'Verified ICUs',
      render: (r) => <span className="font-mono">{r.verified_icus}</span>,
      sortValue: (r) => r.verified_icus
    },
    { key: 'deserts', header: 'Desert Zones', render: (r) => <span className="font-mono">{r.deserts}</span>, sortValue: (r) => r.deserts },
    {
      key: 'risk',
      header: 'Risk',
      render: (r) => <span className="rounded-full border bg-white/5 px-2 py-0.5 text-xs">{r.risk}</span>,
      sortValue: (r) => r.risk
    }
  ]

  return (
    <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-4">
      <div className="text-sm font-semibold">State Comparison</div>
      <div className="mt-3">
        <DataTable columns={columns} data={rows} sortable paginated pageSize={8} />
      </div>
    </div>
  )
}

