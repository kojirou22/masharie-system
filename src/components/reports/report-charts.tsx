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
import type { Expense, PaymentRelease, Project } from '@/lib/types/database'

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#14B8A6', '#F97316', '#6366F1']

export function ReportCharts({ projects, expenses }: {
  projects: Project[]
  payments: PaymentRelease[]
  expenses: Expense[]
}) {
  // Projects by type
  const projectsByType = projects.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const typeData = Object.entries(projectsByType).map(([name, value]) => ({ name, value }))

  // Projects by status
  const projectsByStatus = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusData = Object.entries(projectsByStatus).map(([name, value]) => ({ name, value }))

  // Budget by type
  const budgetByType = projects.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + (p.budget || 0)
    return acc
  }, {} as Record<string, number>)

  const budgetData = Object.entries(budgetByType)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value)

  // Expenses by account type
  const expensesByAccount = expenses.reduce((acc, e) => {
    acc[e.account_type] = (acc[e.account_type] || 0) + (e.amount || 0)
    return acc
  }, {} as Record<string, number>)

  const expenseData = Object.entries(expensesByAccount).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Type */}
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60">
          <h3 className="text-lg font-semibold text-slate-950 mb-4 font-[family-name:var(--font-fira-code)]">
            Projects by Type
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects by Status */}
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60">
          <h3 className="text-lg font-semibold text-slate-950 mb-4 font-[family-name:var(--font-fira-code)]">
            Projects by Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget by Type */}
      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60">
        <h3 className="text-lg font-semibold text-slate-950 mb-4 font-[family-name:var(--font-fira-code)]">
          Budget by Project Type
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DBEAFE" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatPHP(Number(value))} />
              <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses by Account */}
      {expenseData.length > 0 && (
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60">
          <h3 className="text-lg font-semibold text-slate-950 mb-4 font-[family-name:var(--font-fira-code)]">
            Expenses by Account Type
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DBEAFE" />
                <XAxis type="number" tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                <Tooltip formatter={(value) => formatPHP(Number(value))} />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
