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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-purple-900 font-[family-name:var(--font-fira-code)]">
          Reports
        </h1>
        <a
          href="/api/reports"
          className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
        >
          Download PDF
        </a>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Projects" value={String(stats.total_projects)} color="purple" />
        <StatCard label="Active Projects" value={String(stats.active_projects)} color="blue" />
        <StatCard label="Total Budget" value={formatPHP(stats.total_budget)} color="green" />
        <StatCard label="Total Released" value={formatPHP(stats.total_released)} color="amber" />
      </div>

      {/* Charts */}
      <Suspense fallback={<div className="animate-pulse py-16 text-center text-purple-400">Loading charts...</div>}>
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
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
  }

  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
