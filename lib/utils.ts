import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { Facility } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function trustColor(score: number) {
  if (score >= 80) return 'var(--color-success)'
  if (score >= 50) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

export function trustLabel(score: number): Facility['trust_label'] {
  if (score >= 80) return 'Verified'
  if (score >= 50) return 'Incomplete'
  if (score >= 35) return 'Contradictory'
  return 'Suspicious'
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('en-IN').format(n)
}

export function formatPct(n: number) {
  return `${Math.round(n)}%`
}

