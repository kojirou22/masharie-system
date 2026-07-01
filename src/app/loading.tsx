import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:py-10" aria-label="Loading page content">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <Skeleton className="mb-3 h-3 w-24" />
            <Skeleton className="h-7 w-32" />
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-sm">
        <Skeleton className="mb-4 h-10 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
