import Link from 'next/link'
import { Suspense } from 'react'
import { ReportCharts } from '@/components/reports/report-charts'
import { getDashboardStats, getChartData } from '@/lib/supabase/queries/dashboard'
import { formatPHP } from '@/lib/utils/currency'

export default async function DashboardPage() {
  const [stats, chartData] = await Promise.all([
    getDashboardStats(),
    getChartData(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-950 font-[family-name:var(--font-fira-code)]">
          Dashboard
        </h1>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 transition-colors"
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

      <div className="mb-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60">
        <h2 className="text-lg font-semibold text-slate-950 mb-2 font-[family-name:var(--font-fira-code)]">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickLink href="/projects" label="Projects" />
          <QuickLink href="/projects/new" label="New Project" />
          <QuickLink href="/payments" label="Payments" />
          <QuickLink href="/expenses" label="Expenses" />
        </div>
      </div>

      <Suspense fallback={<div className="animate-pulse py-16 text-center text-blue-400">Loading charts...</div>}>
        <ReportCharts chartData={chartData} />
      </Suspense>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60">
      <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-950">{value}</p>
    </div>
  )
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-colors"
    >
      {label}
    </Link>
  )
}
