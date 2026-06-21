'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { formatPHP } from '@/lib/utils/currency'

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
]

const tooltipStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '0.75rem',
  color: 'var(--card-foreground)',
  boxShadow: '0 12px 24px rgb(15 23 42 / 0.14)',
}

interface ChartData {
  projectsByType: { name: string; value: number }[]
  projectsByStatus: { name: string; value: number }[]
  budgetByType: { name: string; value: number }[]
}

export function ReportCharts({ chartData }: { chartData: ChartData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60">
        <h3 className="text-sm font-semibold text-slate-950 mb-4">Projects by Type</h3>
        <div className="h-64">
          {chartData.projectsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.projectsByType}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {chartData.projectsByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="project type" />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60">
        <h3 className="text-sm font-semibold text-slate-950 mb-4">Projects by Status</h3>
        <div className="h-64">
          {chartData.projectsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.projectsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {chartData.projectsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="project status" />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60 lg:col-span-2">
        <h3 className="text-sm font-semibold text-slate-950 mb-4">Budget by Type</h3>
        <div className="h-64">
          {chartData.budgetByType.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.budgetByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => formatPHP(v)} />
                <Tooltip formatter={(value) => formatPHP(Number(value))} contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="budget" />
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-500">
      <BarChart3 className="mb-2 h-8 w-8 opacity-40" aria-hidden="true" />
      <p className="text-sm font-medium">No {label} data yet</p>
    </div>
  )
}
