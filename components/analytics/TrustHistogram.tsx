'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { Facility } from '@/lib/types'

function bin(score: number) {
  if (score < 20) return '0-20'
  if (score < 40) return '20-40'
  if (score < 60) return '40-60'
  if (score < 80) return '60-80'
  return '80-100'
}

export function TrustHistogram({ facilities }: { facilities: Facility[] }) {
  const counts = new Map<string, number>()
  facilities.forEach((f) => counts.set(bin(f.trust_score), (counts.get(bin(f.trust_score)) ?? 0) + 1))
  const data = ['0-20', '20-40', '40-60', '60-80', '80-100'].map((k) => ({ bin: k, count: counts.get(k) ?? 0 }))

  return (
    <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/60 p-4">
      <div className="text-sm font-semibold">Trust Score Distribution</div>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(30,58,95,0.6)" vertical={false} />
            <XAxis dataKey="bin" stroke="rgba(136,153,170,0.8)" fontSize={12} />
            <YAxis stroke="rgba(136,153,170,0.8)" fontSize={12} />
            <Tooltip contentStyle={{ background: 'rgba(17,31,56,0.95)', border: '1px solid rgba(30,58,95,1)', color: '#fff' }} />
            <Bar dataKey="count" fill="rgba(27,138,143,0.9)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

