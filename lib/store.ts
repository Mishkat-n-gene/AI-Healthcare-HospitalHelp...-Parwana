import { create } from 'zustand'

import type { Capability, Facility } from '@/lib/types'

export type MapMode = 'FACILITIES' | 'DESERTS'

export type Filters = {
  state?: string
  district?: string
  pincode?: string
  capability?: Capability
  minTrust?: number
  availability247?: boolean
  types?: Array<Facility['type']>
}

type AppState = {
  mapMode: MapMode
  setMapMode: (mode: MapMode) => void

  filters: Filters
  setFilters: (next: Filters) => void
  resetFilters: () => void

  selectedFacilityId?: string
  setSelectedFacilityId: (id?: string) => void

  activeRunId?: string
  setActiveRunId: (runId?: string) => void
}

const DEFAULT_FILTERS: Filters = {
  minTrust: 0,
  availability247: false,
  types: ['Government', 'Private', 'NGO', 'Trust']
}

export const useAppStore = create<AppState>((set) => ({
  mapMode: 'FACILITIES',
  setMapMode: (mode) => set({ mapMode: mode }),

  filters: DEFAULT_FILTERS,
  setFilters: (next) => set({ filters: { ...DEFAULT_FILTERS, ...next } }),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  selectedFacilityId: undefined,
  setSelectedFacilityId: (id) => set({ selectedFacilityId: id }),

  activeRunId: undefined,
  setActiveRunId: (runId) => set({ activeRunId: runId })
}))

