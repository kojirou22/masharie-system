import Link from 'next/link'
import { Suspense } from 'react'
import { Activity, ArrowRight, Banknote, Landmark, Wallet } from 'lucide-react'

import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { PageHeader } from '@/components/layout/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { Surface, SurfaceHeader } from '@/components/ui/surface'
import { getDashboardStats, getChartData } from '@/lib/supabase/queries/dashboard'
import { formatPHP } from '@/lib/utils/currency'

const quickLinks = [
  { href: '/projects', label: 'Projects', description: 'Browse all project records' },
  { href: '/projects/new', label: 'New Project', description: 'Create an admin project entry' },
  { href: '/payments', label: 'Payments', description: 'Review released project funds' },
  { href: '/expenses', label: 'Expenses', description: 'Track operational releases' },
]

export default async function DashboardPage() {
  const [stats, chartData] = await Promise.all([
    getDashboardStats(),
    getChartData(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
      <PageHeader
        eyebrow="Admin Command Center"
        title="Dashboard"
        description="High-level project, budget, payment, and expense visibility for Masharie operations."
        badge={
          <span className="inline-flex w-fit items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            Live summary
          </span>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Projects"
          value={stats.total_projects}
          tone="blue"
          icon={<Landmark className="h-5 w-5" aria-hidden="true" />}
        />
        <MetricCard
          label="Active Projects"
          value={stats.active_projects}
          tone="emerald"
          icon={<Activity className="h-5 w-5" aria-hidden="true" />}
        />
        <MetricCard
          label="Total Budget"
          value={formatPHP(stats.total_budget)}
          tone="slate"
          icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
        />
        <MetricCard
          label="Total Released"
          value={formatPHP(stats.total_released)}
          tone="amber"
          icon={<Banknote className="h-5 w-5" aria-hidden="true" />}
        />
      </section>

      <Surface className="mt-4 overflow-hidden">
        <SurfaceHeader
          title="Quick links"
          description="Jump directly into the main operational registries."
        />
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <QuickLink key={link.href} {...link} />
          ))}
        </div>
      </Surface>

      <Suspense fallback={<div className="animate-pulse py-16 text-center text-muted-foreground">Loading charts...</div>}>
        <DashboardCharts chartData={chartData} />
      </Suspense>
    </div>
  )
}

function QuickLink({
  description,
  href,
  label,
}: {
  href: string
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border/80 bg-background/60 p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
        {label}
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
      <span className="mt-2 block text-sm leading-5 text-muted-foreground">{description}</span>
    </Link>
  )
}
