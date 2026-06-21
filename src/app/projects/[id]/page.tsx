import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { getProjectById } from '@/lib/supabase/queries/projects'
import { formatPHP } from '@/lib/utils/currency'
import { arabicTextClass, formatDate } from '@/lib/utils/formatters'
import type { PaymentRelease, ProjectStatus } from '@/lib/types/database'

export const revalidate = 3600

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    'Pending': 'bg-amber-100 text-amber-800',
    'On Going': 'bg-blue-100 text-blue-800',
    'On Hold': 'bg-orange-100 text-orange-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
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
  const showMosqueFields = project.type === 'Mosque'

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: 'Projects', href: '/projects' }, { label: project.project_number }]} />
      <Link href="/projects" className="mb-4 inline-flex rounded-full text-sm font-medium text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500">
        ← Back to projects
      </Link>

      <div className="mb-6 rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-sm shadow-blue-100/60 backdrop-blur">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Project Number</p>
            <h1 className="font-mono text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {project.project_number}
            </h1>
            <p className={`mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl ${arabicTextClass(project.address)}`}>
              {project.address || '—'}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-3">
          <InfoField label="Name" value={project.name} />
          <InfoField label="Donor" value={project.donor} />
          <InfoField label="Type" value={project.type} />
          <InfoField label="Supervisor" value={project.supervisor} />
          <InfoField label="Batch" value={`${project.batch_number} (${project.batch_year})`} />
          {showMosqueFields && <InfoField label="Size" value={project.size ?? '—'} />}
          {showMosqueFields && <InfoField label="Has Tank" value={project.has_tank ? 'Yes' : 'No'} />}
        </div>
      </div>

      {/* Funding Progress */}
      <div className="mb-6 rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-sm shadow-blue-100/60 backdrop-blur">
        <h2 className="mb-4 text-lg font-bold text-slate-950">
          Funding Progress
        </h2>
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-2xl font-bold text-slate-950">{formatPHP(released)}</p>
            <p className="text-sm font-medium text-slate-600">released of {formatPHP(budget)}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-blue-700">{progress}%</p>
            <p className="text-sm font-medium text-slate-600">{formatPHP(remaining)} remaining</p>
          </div>
        </div>
        <div className="h-3 w-full rounded-full bg-blue-100">
          <div
            className="h-3 rounded-full bg-blue-600 transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Payment Releases */}
      <div className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-sm shadow-blue-100/60 backdrop-blur">
        <h2 className="mb-4 text-lg font-bold text-slate-950">
          Payment Releases
        </h2>
        {paymentReleases.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-blue-100">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-bold text-slate-950">Check #</th>
                  <th className="px-3 py-2 font-bold text-slate-950">Voucher #</th>
                  <th className="px-3 py-2 font-bold text-slate-950 text-right">Amount</th>
                  <th className="px-3 py-2 font-bold text-slate-950">Status</th>
                  <th className="px-3 py-2 font-bold text-slate-950">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentReleases.map((payment) => (
                  <tr key={payment.id} className="hover:bg-blue-50/60">
                    <td className="px-3 py-2 font-mono text-xs">{payment.check_number ?? '—'}</td>
                    <td className="px-3 py-2 font-mono text-xs">{payment.voucher_number ?? '—'}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatPHP(payment.amount)}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        payment.status === 'Released' ? 'bg-green-100 text-green-800' :
                        payment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs font-medium text-slate-600">{formatDate(payment.released_at ?? payment.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-600">No payment releases yet.</p>
        )}
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{label}</p>
      <p className={`mt-1 break-words text-base font-semibold leading-6 text-slate-950 ${arabicTextClass(value)}`}>{value || '—'}</p>
    </div>
  )
}
