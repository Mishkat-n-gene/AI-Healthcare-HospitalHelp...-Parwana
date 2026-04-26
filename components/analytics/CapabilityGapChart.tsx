'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { Desert } from '@/lib/types'

export function CapabilityGapChart({ deserts }: { deserts: Desert[] }) {
  const byState = new Map<string, number>()
  deserts.forEach((d) => byState.set(d.state, (byState.get(d.state) ?? 0) + d.missing_capabilities.length))
  const data = [...byState.entries()]
    .map(([state, gap]) => ({ state, gap }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 10)

  return (
    <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-4">
      <div className="text-sm font-semibold">Capability Gap by State (Top 10)</div>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid stroke="rgba(30,58,95,0.6)" horizontal={false} />
            <XAxis type="number" stroke="rgba(136,153,170,0.8)" fontSize={12} />
            <YAxis type="category" dataKey="state" stroke="rgba(136,153,170,0.8)" fontSize={12} width={110} />
            <Tooltip contentStyle={{ background: 'rgba(17,31,56,0.95)', border: '1px solid rgba(30,58,95,1)', color: '#fff' }} />
            <Bar dataKey="gap" fill="rgba(244,162,97,0.9)" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

