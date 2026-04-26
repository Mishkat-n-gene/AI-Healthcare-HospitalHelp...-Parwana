import { cn } from '@/lib/utils'

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-lg bg-[linear-gradient(110deg,rgba(17,31,56,0.8),rgba(30,58,95,0.75),rgba(17,31,56,0.8))] bg-[length:200%_100%]',
        className
      )}
      aria-hidden="true"
    />
  )
}

export const LoadingSkeletons = {
  FacilityCard() {
    return (
      <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/40 p-4">
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-5/6" />
      </div>
    )
  },
  MapPanel() {
    return (
      <div className="h-full rounded-2xl border bg-[color:var(--color-bg-card)]/40 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-[520px] w-full rounded-2xl" />
      </div>
    )
  },
  DetailPanel() {
    return (
      <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/40 p-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="mt-3 h-24 w-24 rounded-full" />
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-5/6" />
        <Skeleton className="mt-6 h-10 w-full rounded-xl" />
      </div>
    )
  },
  StatCard() {
    return (
      <div className="rounded-2xl border bg-[color:var(--color-bg-card)]/40 p-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-7 w-20" />
        <Skeleton className="mt-3 h-3 w-16" />
      </div>
    )
  }
}

