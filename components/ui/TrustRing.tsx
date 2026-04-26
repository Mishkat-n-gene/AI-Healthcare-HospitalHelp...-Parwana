'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { trustColor } from '@/lib/utils'

export function TrustRing({ score }: { score: number }) {
  const r = 36
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score))
  const dash = (pct / 100) * c
  const color = trustColor(score)
  const reduce = useReducedMotion()

  return (
    <div className="relative h-24 w-24" aria-label={`Trust score ${score} out of 100`}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <circle cx="50" cy="50" r={r} stroke="rgba(136,153,170,0.25)" strokeWidth="10" fill="none" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 50 50)"
          initial={reduce ? false : { strokeDasharray: `0 ${c}` }}
          animate={reduce ? undefined : { strokeDasharray: `${dash} ${c - dash}` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-mono text-2xl font-semibold">{Math.round(pct)}</div>
          <div className="text-xs text-[color:var(--color-text-muted)]">Trust</div>
        </div>
      </div>
    </div>
  )
}

