import Link from 'next/link'
export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold text-[#EF4444]">Unauthorized</h2>
      <p>You do not have access to this page.</p>
      <Link href="/projects" className="text-[#2563EB] underline">
        Go to projects
      </Link>
    </div>
  )
}
