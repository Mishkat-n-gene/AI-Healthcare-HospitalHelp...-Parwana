import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <LoadingSkeletons.StatCard />
      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6">
          <LoadingSkeletons.FacilityCard />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <LoadingSkeletons.MapPanel />
        </div>
      </div>
    </div>
  )
}

