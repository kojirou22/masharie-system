export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10" aria-label="Loading page content">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60">
            <div className="mb-3 h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-3xl border border-blue-100 bg-white shadow-sm shadow-blue-100/60" />
    </div>
  )
}
