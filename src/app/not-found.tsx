import Link from 'next/link'
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold text-slate-950">Page not found</h2>
      <p className="max-w-sm text-sm text-slate-600">
        The page you requested does not exist or may have moved.
      </p>
      <Link href="/projects" className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500">
        Go to projects
      </Link>
    </main>
  )
}
