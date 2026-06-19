import { getDashboardStats } from '@/lib/supabase/queries/dashboard'
import { formatPHP } from '@/lib/utils/currency'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-purple-900 font-[family-name:var(--font-fira-code)]">
          Dashboard
        </h1>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="rounded-md border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Projects" value={String(stats.total_projects)} />
        <StatCard label="Active Projects" value={String(stats.active_projects)} />
        <StatCard label="Total Budget" value={formatPHP(stats.total_budget)} />
        <StatCard label="Total Released" value={formatPHP(stats.total_released)} />
      </div>

      <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-purple-900 mb-2 font-[family-name:var(--font-fira-code)]">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickLink href="/projects" label="Projects" />
          <QuickLink href="/projects/new" label="New Project" />
          <QuickLink href="/payments" label="Payments" />
          <QuickLink href="/expenses" label="Expenses" />
          <QuickLink href="/reports" label="Reports" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-5">
      <p className="text-xs text-purple-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-purple-900">{value}</p>
    </div>
  )
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-center rounded-lg border border-purple-200 px-4 py-3 text-sm font-medium text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors"
    >
      {label}
    </a>
  )
}
