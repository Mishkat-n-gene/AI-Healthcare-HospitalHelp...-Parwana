import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons'

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <LoadingSkeletons.DetailPanel />
      <div className="mt-4 grid gap-3">
        <LoadingSkeletons.FacilityCard />
        <LoadingSkeletons.FacilityCard />
        <LoadingSkeletons.FacilityCard />
      </div>
    </div>
  )
}

