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
import { BarChart3, CircleDollarSign, PieChart as PieChartIcon } from 'lucide-react'

import { Surface, SurfaceHeader } from '@/components/ui/surface'
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

export function DashboardCharts({ chartData }: { chartData: ChartData }) {
  return (
    <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartSurface
        title="Projects by type"
        description="Distribution across operational categories."
        icon={<PieChartIcon className="h-4 w-4" aria-hidden="true" />}
      >
        <div className="h-72">
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
                    <Cell key={`type-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="project type" />
          )}
        </div>
      </ChartSurface>

      <ChartSurface
        title="Projects by status"
        description="Current delivery state across all projects."
        icon={<PieChartIcon className="h-4 w-4" aria-hidden="true" />}
      >
        <div className="h-72">
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
                    <Cell key={`status-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="project status" />
          )}
        </div>
      </ChartSurface>

      <ChartSurface
        className="lg:col-span-2"
        title="Budget by type"
        description="Approved budget grouped by project category."
        icon={<CircleDollarSign className="h-4 w-4" aria-hidden="true" />}
      >
        <div className="h-80">
          {chartData.budgetByType.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.budgetByType} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(value) => formatPHP(value)} />
                <Tooltip formatter={(value) => formatPHP(Number(value))} contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="budget" />
          )}
        </div>
      </ChartSurface>
    </section>
  )
}

function ChartSurface({
  children,
  className,
  description,
  icon,
  title,
}: {
  children: React.ReactNode
  className?: string
  description: string
  icon: React.ReactNode
  title: string
}) {
  return (
    <Surface className={className}>
      <SurfaceHeader
        title={title}
        description={description}
        actions={<div className="rounded-full bg-primary/10 p-2 text-primary">{icon}</div>}
      />
      <div className="p-4">{children}</div>
    </Surface>
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 text-muted-foreground">
      <BarChart3 className="mb-2 h-8 w-8 opacity-40" aria-hidden="true" />
      <p className="text-sm font-medium">No {label} data yet</p>
    </div>
  )
}
