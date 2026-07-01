import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Landmark,
  MapPin,
} from 'lucide-react'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { PageHeader } from '@/components/layout/page-header'
import { registryHeaderCellClass } from '@/components/registry/registry-table'
import { MetricCard } from '@/components/ui/metric-card'
import { Surface, SurfaceHeader } from '@/components/ui/surface'
import { getProjectById } from '@/lib/supabase/queries/projects'
import type { PaymentRelease, PaymentStatus, ProjectStatus } from '@/lib/types/database'
import { formatPHP } from '@/lib/utils/currency'
import { arabicTextClass, formatDate } from '@/lib/utils/formatters'

export const revalidate = 3600

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    Pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    'On Going': 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    'On Hold': 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
    Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    Cancelled: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    Pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    Released: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    Cancelled: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) notFound()

  const budget = project.budget ?? 0
  const paymentReleases = (project.payment_releases ?? []) as PaymentRelease[]
  const released = paymentReleases
    .filter((p) => p.status === 'Released')
    .reduce((sum, p) => sum + (p.amount ?? 0), 0)
  const remaining = budget - released
  const progress = budget > 0 ? Math.round((released / budget) * 100) : 0
  const progressWidth = Math.min(Math.max(progress, 0), 100)
  const showMosqueFields = project.type === 'Mosque'

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
      <Breadcrumbs items={[{ label: 'Projects', href: '/projects' }, { label: project.project_number }]} />

      <PageHeader
        eyebrow="Project detail"
        title={project.project_number}
        description={project.address || 'No address recorded'}
        badge={<StatusBadge status={project.status} />}
        actions={
          <Link
            href="/projects"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to projects
          </Link>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Budget"
            value={formatPHP(budget)}
            tone="slate"
            icon={<CircleDollarSign className="h-5 w-5" aria-hidden="true" />}
          />
          <MetricCard
            label="Released"
            value={formatPHP(released)}
            tone="emerald"
            icon={<Banknote className="h-5 w-5" aria-hidden="true" />}
          />
          <MetricCard
            label="Remaining"
            value={formatPHP(remaining)}
            tone={remaining < 0 ? 'amber' : 'blue'}
            icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
          />
          <MetricCard
            label="Funding progress"
            value={`${progress}%`}
            tone="amber"
            icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
          />
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Surface className="overflow-hidden">
            <SurfaceHeader
              title="Project identity"
              description="Core record fields, location, assignment, and batch context."
              actions={<Landmark className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
            />
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              <InfoField label="Name" value={project.name} />
              <InfoField label="Donor" value={project.donor} />
              <InfoField label="Type" value={project.type} />
              <InfoField label="Supervisor" value={project.supervisor} />
              <InfoField label="Batch" value={`${project.batch_number} (${project.batch_year})`} />
              {showMosqueFields && <InfoField label="Size" value={project.size ?? '—'} />}
              {showMosqueFields && <InfoField label="Has tank" value={project.has_tank ? 'Yes' : 'No'} />}
            </div>
          </Surface>

          <Surface className="overflow-hidden">
            <SurfaceHeader
              title="Payment releases"
              description="Released, pending, and cancelled payments attached to this project."
            />
            {paymentReleases.length > 0 ? (
              <div className="overflow-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className={registryHeaderCellClass}>Check #</th>
                      <th className={registryHeaderCellClass}>Voucher #</th>
                      <th className={`${registryHeaderCellClass} text-right`}>Amount</th>
                      <th className={registryHeaderCellClass}>Status</th>
                      <th className={registryHeaderCellClass}>Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paymentReleases.map((payment) => (
                      <tr key={payment.id} className="transition-colors hover:bg-muted/40">
                        <td className="px-4 py-3 font-mono text-xs text-foreground">{payment.check_number ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-foreground">{payment.voucher_number ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">{formatPHP(payment.amount)}</td>
                        <td className="px-4 py-3"><PaymentStatusBadge status={payment.status} /></td>
                        <td className="px-4 py-3 text-xs font-medium text-muted-foreground">
                          {formatDate(payment.released_at ?? payment.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4">
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm font-medium text-muted-foreground">
                  No payment releases yet.
                </div>
              </div>
            )}
          </Surface>
        </div>

        <aside className="space-y-4">
          <Surface className="overflow-hidden">
            <SurfaceHeader
              title="Funding progress"
              description="Released funds compared against approved budget."
            />
            <div className="p-4">
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">{formatPHP(released)}</p>
                  <p className="text-sm text-muted-foreground">released of {formatPHP(budget)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary">{progress}%</p>
                  <p className="text-sm text-muted-foreground">{formatPHP(remaining)} remaining</p>
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-muted">
                <div
                  className="h-3 rounded-full bg-primary transition-all"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>
          </Surface>

          <Surface className="overflow-hidden">
            <SurfaceHeader
              title="Location"
              description="Public address attached to this record."
              actions={<MapPin className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
            />
            <div className="p-4">
              <p className={`text-base leading-7 text-foreground ${arabicTextClass(project.address)}`}>
                {project.address || '—'}
              </p>
            </div>
          </Surface>

          <Surface className="overflow-hidden">
            <SurfaceHeader
              title="Timeline"
              description="Date fields available from the project record."
              actions={<CalendarDays className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
            />
            <div className="grid gap-3 p-4">
              <InfoField label="Created" value={formatDate(project.created_at)} />
              <InfoField label="Updated" value={formatDate(project.updated_at)} />
            </div>
          </Surface>
        </aside>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: ReactNode }) {
  const textValue = typeof value === 'string' ? value : undefined

  return (
    <div className="rounded-2xl border border-border/80 bg-background/60 p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className={`mt-2 break-words text-sm font-semibold leading-6 text-foreground ${arabicTextClass(textValue)}`}>
        {value || '—'}
      </div>
    </div>
  )
}
