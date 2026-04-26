'use client'

import { useMemo, useState } from 'react'
import { Check, Loader2, RotateCcw } from 'lucide-react'

import type { Capability, Facility } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

const CAPABILITIES: Capability[] = [
  'ICU',
  'Emergency Trauma',
  'Oncology',
  'Dialysis',
  'Neonatal Care',
  'General Surgery',
  'Blood Bank',
  'Ambulance',
  'Pharmacy'
]

const TYPES: Array<Facility['type']> = ['Government', 'Private', 'NGO', 'Trust']

export function FilterPanel({ className }: { className?: string }) {
  const filters = useAppStore((s) => s.filters)
  const setFilters = useAppStore((s) => s.setFilters)
  const resetFilters = useAppStore((s) => s.resetFilters)
  const mapMode = useAppStore((s) => s.mapMode)
  const setMapMode = useAppStore((s) => s.setMapMode)

  const [draft, setDraft] = useState(filters)
  const [applying, setApplying] = useState(false)

  const typesSet = useMemo(() => new Set(draft.types ?? TYPES), [draft.types])

  return (
    <div className={cn('h-full rounded-2xl border bg-[color:var(--color-bg-sidebar)]/60 p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Filters</div>
        <button
          className="focus-ring inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
          onClick={() => {
            resetFilters()
            setDraft(useAppStore.getState().filters)
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-mono uppercase tracking-wide text-[color:var(--color-text-muted)]">State</span>
          <input
            className="focus-ring rounded-xl border bg-white px-3 py-2 text-sm text-black placeholder:text-slate-500"
            placeholder="e.g. Bihar"
            value={draft.state ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, state: e.target.value || undefined }))}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-mono uppercase tracking-wide text-[color:var(--color-text-muted)]">District</span>
          <input
            className="focus-ring rounded-xl border bg-white px-3 py-2 text-sm text-black placeholder:text-slate-500"
            placeholder="e.g. Patna"
            value={draft.district ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, district: e.target.value || undefined }))}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-mono uppercase tracking-wide text-[color:var(--color-text-muted)]">PIN code</span>
          <input
            className="focus-ring rounded-xl border bg-white px-3 py-2 font-mono text-sm text-black placeholder:text-slate-500"
            placeholder="6 digits"
            value={draft.pincode ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, pincode: e.target.value || undefined }))}
            inputMode="numeric"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-mono uppercase tracking-wide text-[color:var(--color-text-muted)]">Capability</span>
          <select
            className="focus-ring rounded-xl border bg-white px-3 py-2 text-sm text-black"
            value={draft.capability ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, capability: (e.target.value as Capability) || undefined }))}
          >
            <option value="">Any</option>
            {CAPABILITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-mono uppercase tracking-wide text-[color:var(--color-text-muted)]">
            Min trust score <span className="font-mono">({draft.minTrust ?? 0})</span>
          </span>
          <input
            className="w-full"
            type="range"
            min={0}
            max={100}
            value={draft.minTrust ?? 0}
            onChange={(e) => setDraft((d) => ({ ...d, minTrust: Number(e.target.value) }))}
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-xl border bg-[color:var(--color-bg-dark)]/30 px-3 py-2">
          <span className="text-sm">Show 24/7 only</span>
          <input
            type="checkbox"
            checked={Boolean(draft.availability247)}
            onChange={(e) => setDraft((d) => ({ ...d, availability247: e.target.checked }))}
          />
        </label>

        <div className="grid gap-2">
          <div className="text-xs font-mono uppercase tracking-wide text-[color:var(--color-text-muted)]">Facility types</div>
          <div className="grid gap-2">
            {TYPES.map((t) => {
              const checked = typesSet.has(t)
              return (
                <label key={t} className="flex items-center justify-between gap-3 rounded-xl border bg-[color:var(--color-bg-dark)]/30 px-3 py-2">
                  <span className="text-sm">{t}</span>
                  <span className="inline-flex items-center gap-2">
                    {checked ? <Check className="h-4 w-4 text-[color:var(--color-success)]" aria-hidden="true" /> : null}
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setDraft((d) => {
                          const next = new Set(d.types ?? TYPES)
                          if (e.target.checked) next.add(t)
                          else next.delete(t)
                          return { ...d, types: Array.from(next) }
                        })
                      }}
                    />
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <label className="flex items-center justify-between gap-3 rounded-xl border bg-[color:var(--color-bg-dark)]/30 px-3 py-2">
          <span className="text-sm">Show Medical Deserts</span>
          <input
            type="checkbox"
            checked={mapMode === 'DESERTS'}
            onChange={(e) => setMapMode(e.target.checked ? 'DESERTS' : 'FACILITIES')}
          />
        </label>

        <button
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-secondary)] px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          disabled={applying}
          onClick={() => {
            setApplying(true)
            setTimeout(() => {
              setFilters(draft)
              setApplying(false)
            }, 250)
          }}
        >
          {applying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Apply Filters
        </button>
      </div>
    </div>
  )
}

