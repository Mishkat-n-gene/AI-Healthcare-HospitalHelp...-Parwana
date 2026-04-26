'use client'

import { useEffect, useMemo, useState } from 'react'

import type { Facility } from '@/lib/types'
import { useAppStore } from '@/lib/store'

type SearchResponse = { items: Facility[]; page: number; page_size: number; total: number }

export function useFacilities() {
  const filters = useAppStore((s) => s.filters)

  const [data, setData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const qs = useMemo(() => {
    const p = new URLSearchParams()
    if (filters.state) p.set('state', filters.state)
    if (filters.district) p.set('district', filters.district)
    if (filters.pincode) p.set('pincode', filters.pincode)
    if (filters.capability) p.set('capability', String(filters.capability))
    if (filters.minTrust != null) p.set('min_trust_score', String(filters.minTrust))
    p.set('page', String(page))
    p.set('page_size', '50')
    return p.toString()
  }, [filters, page])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/facilities/search?${qs}`)
        const json = (await res.json()) as SearchResponse
        if (!res.ok) throw new Error((json as any)?.error?.message ?? 'Search failed')
        if (!cancelled) setData(json)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Search failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [qs])

  return { data, loading, error, page, setPage }
}

