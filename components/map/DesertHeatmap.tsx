'use client'

import { Circle, Tooltip } from 'react-leaflet'

import type { Desert } from '@/lib/types'

const RISK: Record<Desert['risk_level'], { color: string; fill: string; radius: number }> = {
  Critical: { color: 'var(--color-danger)', fill: 'rgba(230,57,70,0.30)', radius: 26000 },
  High: { color: 'var(--color-accent)', fill: 'rgba(244,162,97,0.28)', radius: 22000 },
  Medium: { color: 'var(--color-warning)', fill: 'rgba(255,183,3,0.22)', radius: 18000 },
  Low: { color: 'var(--color-success)', fill: 'rgba(45,198,83,0.18)', radius: 14000 }
}

export function DesertHeatmap({ deserts, onSelect }: { deserts: Desert[]; onSelect?: (d: Desert) => void }) {
  return (
    <>
      {deserts.map((d) => {
        const s = RISK[d.risk_level]
        return (
          <Circle
            key={`${d.pincode}-${d.risk_level}`}
            center={[d.lat, d.lng]}
            radius={s.radius}
            pathOptions={{ color: s.color, fillColor: s.fill, fillOpacity: 1, weight: 1 }}
            eventHandlers={{
              click: () => onSelect?.(d)
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <div className="text-xs">
                <div className="font-semibold">{d.risk_level} risk</div>
                <div>
                  {d.district}, {d.state}
                </div>
                <div>Missing: {d.missing_capabilities.slice(0, 2).join(', ')}{d.missing_capabilities.length > 2 ? '…' : ''}</div>
              </div>
            </Tooltip>
          </Circle>
        )
      })}
    </>
  )
}

