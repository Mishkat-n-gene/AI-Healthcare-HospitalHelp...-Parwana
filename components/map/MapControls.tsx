'use client'

import { Maximize2, RefreshCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useMap } from 'react-leaflet'

import { cn } from '@/lib/utils'

export function MapControls({ className }: { className?: string }) {
  const map = useMap()
  return (
    <div className={cn('absolute right-3 top-3 z-[1000] grid gap-2', className)}>
      <button className="focus-ring grid h-10 w-10 place-items-center rounded-xl border bg-[color:var(--color-bg-card)]/80" onClick={() => map.zoomIn()}>
        <ZoomIn className="h-4 w-4" aria-hidden="true" />
      </button>
      <button className="focus-ring grid h-10 w-10 place-items-center rounded-xl border bg-[color:var(--color-bg-card)]/80" onClick={() => map.zoomOut()}>
        <ZoomOut className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        className="focus-ring grid h-10 w-10 place-items-center rounded-xl border bg-[color:var(--color-bg-card)]/80"
        onClick={() => map.setView([22.9734, 78.6569], 5)}
      >
        <RefreshCcw className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        className="focus-ring grid h-10 w-10 place-items-center rounded-xl border bg-[color:var(--color-bg-card)]/80"
        onClick={() => {
          const el = map.getContainer()
          if (!document.fullscreenElement) el.requestFullscreen?.()
          else document.exitFullscreen?.()
        }}
      >
        <Maximize2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

