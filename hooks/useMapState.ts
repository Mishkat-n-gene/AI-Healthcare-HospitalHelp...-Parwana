'use client'

import { useAppStore } from '@/lib/store'

export function useMapState() {
  const mapMode = useAppStore((s) => s.mapMode)
  const setMapMode = useAppStore((s) => s.setMapMode)
  const selectedFacilityId = useAppStore((s) => s.selectedFacilityId)
  const setSelectedFacilityId = useAppStore((s) => s.setSelectedFacilityId)

  return { mapMode, setMapMode, selectedFacilityId, setSelectedFacilityId }
}

