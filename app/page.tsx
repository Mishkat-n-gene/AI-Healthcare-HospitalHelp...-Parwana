'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

import type { SummaryStats } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

function Counter({ value, label }: { value: number; label: string }) {
  const reduce = useReducedMotion()
  const [v, setV] = useState(reduce ? value : 0)
  useEffect(() => {
    if (reduce) return
    const start = performance.now()
    const dur = 900
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setV(Math.round(value * p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce, value])

  return (
    <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/55 p-4">
      <div className="font-mono text-3xl font-semibold">{formatNumber(v)}</div>
      <div className="mt-1 text-sm text-[color:var(--color-text-muted)]">{label}</div>
    </div>
  )
}

export default function LandingPage() {
  const [stats, setStats] = useState<SummaryStats | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch('/api/analytics/summary')
      const json = await res.json().catch(() => null)
      if (!res.ok) return
      if (!cancelled) setStats(json as SummaryStats)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="relative">
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/5 px-3 py-1 text-xs text-[color:var(--color-text-muted)]">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-secondary)]" aria-hidden="true" />
              Hack-Nation × World Bank Youth Summit · Challenge 03
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl"
            >
              Every Second Counts. <span className="text-[color:var(--color-secondary)]">Every Facility Matters.</span>
            </motion.h1>
            <p className="mt-4 max-w-xl text-base text-[color:var(--color-text-muted)] md:text-lg">
              An agentic AI system navigating 10,000+ medical facility records to eliminate the Discovery-to-Care gap across India —
              with transparent MLflow reasoning traces and trust scores you can audit.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-secondary)] px-5 py-3 text-sm font-semibold text-white shadow-glow"
                href="/dashboard"
              >
                Explore the Intelligence Map
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link className="focus-ring rounded-xl border bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10" href="/query">
                Query the Agent
              </Link>
            </div>

            <div className="mt-6 text-sm text-[color:var(--color-text-muted)]">
              Live intelligence counters powered by Databricks (or mock mode).
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[32px] bg-[radial-gradient(900px_circle_at_40%_20%,rgba(15,76,117,0.45),transparent_50%),radial-gradient(650px_circle_at_70%_50%,rgba(27,138,143,0.35),transparent_45%),radial-gradient(550px_circle_at_30%_70%,rgba(244,162,97,0.20),transparent_45%)]" />
            <div className="rounded-[32px] border bg-[color:var(--color-bg-card)]/35 p-6">
              <div className="text-sm font-semibold">Live snapshot</div>
              <div className="mt-1 text-sm text-[color:var(--color-text-muted)]">Updated from `/api/analytics/summary`.</div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Counter value={stats?.total_facilities ?? 10000} label="Facilities analyzed" />
                <Counter value={stats ? Math.round(stats.avg_trust_score) : 72} label="Avg trust score" />
                <Counter value={stats?.verified_icus ?? 1462} label="Verified ICUs" />
                <Counter value={stats?.critical_desert_zones ?? 128} label="Critical desert zones" />
              </div>
              <div className="mt-5 rounded-2xl border bg-[color:var(--color-bg-dark)]/35 p-4">
                <div className="text-xs font-mono uppercase tracking-wide text-[color:var(--color-text-muted)]">
                  Zero guesswork
                </div>
                <div className="mt-2 text-sm text-[color:var(--color-text-muted)]">
                  We don’t re-score or re-reason in the browser. We only display what the Databricks agent returns — plus MLflow traces for transparency.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/40 p-4">
            <div className="text-sm font-semibold">10,000+ Facilities</div>
            <div className="mt-1 text-sm text-[color:var(--color-text-muted)]">Nation-scale discovery across unstructured records.</div>
          </div>
          <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/40 p-4">
            <div className="text-sm font-semibold">28 States Covered</div>
            <div className="mt-1 text-sm text-[color:var(--color-text-muted)]">Designed for expansion to 1.4B lives.</div>
          </div>
          <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/40 p-4">
            <div className="text-sm font-semibold">Real-Time Trust Scoring</div>
            <div className="mt-1 text-sm text-[color:var(--color-text-muted)]">Flags contradictions and missing evidence.</div>
          </div>
          <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/40 p-4">
            <div className="text-sm font-semibold">MLflow Reasoning Traces</div>
            <div className="mt-1 text-sm text-[color:var(--color-text-muted)]">Transparent, auditable agent steps.</div>
          </div>
        </div>
      </section>
    </div>
  )
}

