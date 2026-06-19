'use client'

export default function Error({
  reset,
}: {
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold text-[#EF4444]">Something went wrong</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8] transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
