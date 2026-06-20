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
import { formatPHP } from '@/lib/utils/currency'

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#14B8A6', '#F97316', '#6366F1']

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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60">
        <h3 className="text-sm font-semibold text-slate-950 mb-4">Projects by Status</h3>
        <div className="h-64">
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60 lg:col-span-2">
        <h3 className="text-sm font-semibold text-slate-950 mb-4">Budget by Type</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.budgetByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatPHP(v)} />
              <Tooltip formatter={(value) => formatPHP(Number(value))} />
              <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
