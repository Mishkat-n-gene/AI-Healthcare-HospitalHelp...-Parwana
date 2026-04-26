'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'

import type { Desert, Facility } from '@/lib/types'
import { useFacilities } from '@/hooks/useFacilities'
import { useAppStore } from '@/lib/store'
import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons'
import { FilterPanel } from '@/components/dashboard/FilterPanel'
import { FacilityDetailPanel } from '@/components/dashboard/FacilityDetailPanel'

const IndiaMap = dynamic(() => import('@/components/map/IndiaMap').then((m) => m.IndiaMap), {
  ssr: false,
  loading: () => <LoadingSkeletons.MapPanel />
})

export default function DashboardPage() {
  const mapMode = useAppStore((s) => s.mapMode)
  const selectedFacilityId = useAppStore((s) => s.selectedFacilityId)
  const setSelectedFacilityId = useAppStore((s) => s.setSelectedFacilityId)
  const activeRunId = useAppStore((s) => s.activeRunId)

  const { data, loading, error } = useFacilities()
  const facilities = useMemo(() => data?.items ?? [], [data?.items])

  const [deserts, setDeserts] = useState<Desert[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch('/api/analytics/deserts')
      const json = await res.json().catch(() => null)
      if (!res.ok) return
      if (!cancelled) setDeserts(Array.isArray(json) ? (json as Desert[]) : [])
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedFacility = useMemo(
    () => facilities.find((f) => f.id === selectedFacilityId),
    [facilities, selectedFacilityId]
  )

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 px-4 py-6">
      <div className="col-span-12 lg:col-span-3">
        <FilterPanel />
      </div>

      <div className="col-span-12 lg:col-span-6">
        <div className="flex items-center justify-between gap-3 pb-3">
          <div>
            <div className="text-lg font-semibold">India Intelligence Map</div>
            <div className="text-sm text-[color:var(--color-text-muted)]">
              {mapMode === 'DESERTS' ? 'Medical Desert Heatmap' : 'Facility Intelligence Map'}
            </div>
          </div>
          <div className="text-xs text-[color:var(--color-text-muted)]">
            Showing <span className="font-mono">{facilities.length}</span> facilities ·{' '}
            <span className="font-mono">{deserts.length}</span> desert zones
          </div>
        </div>

        <div className="h-[72vh]">
          <IndiaMap
            mode={mapMode}
            facilities={facilities as Facility[]}
            deserts={deserts}
            onFacilitySelect={(id) => setSelectedFacilityId(id)}
            onDesertSelect={() => setSelectedFacilityId(undefined)}
          />
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl border bg-[color:var(--color-bg-card)]/40 px-3 py-2 text-xs text-[color:var(--color-text-muted)]">
          <span>
            {loading ? 'Loading…' : error ? `Error: ${error}` : `Showing ${facilities.length} results`}
          </span>
          <span className="font-mono">
            Mode: {mapMode} {activeRunId ? `· run ${activeRunId}` : ''}
          </span>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3">
        <FacilityDetailPanel facility={selectedFacility} runId={activeRunId} />
      </div>
    </div>
  )
}

