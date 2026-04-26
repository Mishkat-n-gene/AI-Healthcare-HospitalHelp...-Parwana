import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-4 gap-4">
        <LoadingSkeletons.StatCard />
        <LoadingSkeletons.StatCard />
        <LoadingSkeletons.StatCard />
        <LoadingSkeletons.StatCard />
      </div>
      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6">
          <LoadingSkeletons.MapPanel />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <LoadingSkeletons.MapPanel />
        </div>
      </div>
    </div>
  )
}

