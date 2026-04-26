import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-4">
        <LoadingSkeletons.StatCard />
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-6">
            <LoadingSkeletons.MapPanel />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <LoadingSkeletons.MapPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

