'use client'

import 'leaflet/dist/leaflet.css'

import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'

import type { Desert, Facility } from '@/lib/types'
import { trustLabel } from '@/lib/utils'
import { makeTrustMarkerIcon } from '@/components/map/MapMarker'
import { MapControls } from '@/components/map/MapControls'
import { DesertHeatmap } from '@/components/map/DesertHeatmap'

function toLatLng(lat: unknown, lng: unknown) {
  const latNum = Number(lat)
  const lngNum = Number(lng)
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return null
  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) return null
  return [latNum, lngNum] as [number, number]
}

export function IndiaMap({
  mode,
  facilities,
  deserts,
  onFacilitySelect,
  onDesertSelect
}: {
  mode: 'FACILITIES' | 'DESERTS'
  facilities: Facility[]
  deserts: Desert[]
  onFacilitySelect?: (id: string) => void
  onDesertSelect?: (d: Desert) => void
}) {
  const markers = useMemo(() => {
    return facilities
      .map((f) => {
        const pos = toLatLng(f.lat, f.lng)
        if (!pos) return null
        return {
          id: f.id,
          pos,
          icon: makeTrustMarkerIcon({ score: f.trust_score, label: `${f.name} trust ${f.trust_score}` }),
          label: trustLabel(f.trust_score)
        }
      })
        .filter(Boolean) as Array<{ id: string; pos: [number, number]; icon: ReturnType<typeof makeTrustMarkerIcon>; label: string }>
  }, [facilities])

  const cleanDeserts = useMemo(() => deserts.filter((d) => Boolean(toLatLng(d.lat, d.lng))), [deserts])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border">
      <MapContainer center={[22.9734, 78.6569]} zoom={5} minZoom={4} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapControls />

        {mode === 'DESERTS' ? (
          <DesertHeatmap deserts={cleanDeserts} onSelect={onDesertSelect} />
        ) : (
          <MarkerClusterGroup chunkedLoading>
            {markers.map((m) => (
              <Marker
                key={m.id}
                position={m.pos}
                icon={m.icon}
                eventHandlers={{
                  click: () => onFacilitySelect?.(m.id)
                }}
                title={`${m.id} ${m.label} ${m.pos[0]},${m.pos[1]}`}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{m.id}</div>
                    <div className="text-xs opacity-80">{m.label}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>
    </div>
  )
}

