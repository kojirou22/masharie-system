'use client'

export default function Error({
  reset,
}: {
  reset: () => void
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
      <p className="max-w-sm text-sm text-slate-600">
        The page could not be loaded. Try again, or return to the projects list.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Try again
      </button>
    </main>
  )
}
