import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold">Page not found</h2>
      <Link href="/projects" className="text-[#2563EB] underline">
        Go to projects
      </Link>
    </div>
  )
}
