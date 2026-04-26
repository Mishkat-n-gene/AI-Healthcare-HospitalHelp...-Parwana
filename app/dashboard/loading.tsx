import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons'

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 px-4 py-6">
      <div className="col-span-12 lg:col-span-3">
        <LoadingSkeletons.DetailPanel />
      </div>
      <div className="col-span-12 lg:col-span-6">
        <LoadingSkeletons.MapPanel />
      </div>
      <div className="col-span-12 lg:col-span-3">
        <LoadingSkeletons.DetailPanel />
      </div>
    </div>
  )
}

