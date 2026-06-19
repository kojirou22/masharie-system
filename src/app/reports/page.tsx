import Link from 'next/link'
import { Suspense } from 'react'
import { getDashboardStats } from '@/lib/supabase/queries/dashboard'
import { getProjects } from '@/lib/supabase/queries/projects'
import { getPayments } from '@/lib/supabase/queries/payments'
import { getExpenses } from '@/lib/supabase/queries/expenses'
import { formatPHP } from '@/lib/utils/currency'
import { ReportCharts } from '@/components/reports/report-charts'

export default async function ReportsPage() {
  const [stats, projects, payments, expenses] = await Promise.all([
    getDashboardStats(),
    getProjects({ pageSize: 1000 }),
    getPayments({ pageSize: 1000 }),
    getExpenses({ pageSize: 1000 }),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-950 font-[family-name:var(--font-fira-code)]">
          Reports
        </h1>
        <Link
          href="/api/reports"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
        >
          Download PDF
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Projects" value={String(stats.total_projects)} color="blue" />
        <StatCard label="Active Projects" value={String(stats.active_projects)} color="blue" />
        <StatCard label="Total Budget" value={formatPHP(stats.total_budget)} color="green" />
        <StatCard label="Total Released" value={formatPHP(stats.total_released)} color="amber" />
      </div>

      {/* Charts */}
      <Suspense fallback={<div className="animate-pulse py-16 text-center text-blue-400">Loading charts...</div>}>
        <ReportCharts
          projects={projects.data}
          payments={payments.data}
          expenses={expenses.data}
        />
      </Suspense>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
  }

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
