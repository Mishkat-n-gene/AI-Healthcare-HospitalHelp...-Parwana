'use client'

import L from 'leaflet'

import { trustColor } from '@/lib/utils'

export function makeTrustMarkerIcon(args: { score: number; label: string }) {
  const color = trustColor(args.score)
  const html = `
    <div style="
      width: 14px;
      height: 14px;
      border-radius: 999px;
      background: ${color};
      box-shadow: 0 0 0 3px rgba(10,22,40,0.85), 0 0 0 1px rgba(255,255,255,0.10);
    " aria-label="${args.label}"></div>
  `
  return L.divIcon({
    className: '',
    html,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  })
}

