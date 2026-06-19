import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/supabase/queries/projects'
import { formatPHP } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/formatters'
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
      <Link href="/projects" className="text-sm text-blue-700 hover:underline mb-4 inline-block">
        ← Back to projects
      </Link>

      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-mono text-slate-500 mb-1">{project.project_number}</p>
            <h1 className="text-2xl font-bold text-slate-950 font-[family-name:var(--font-fira-code)]">
              {project.name}
            </h1>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <InfoField label="Donor" value={project.donor} />
          <InfoField label="Type" value={project.type} />
          <InfoField label="Supervisor" value={project.supervisor} />
          <InfoField label="Address" value={project.address} />
          <InfoField label="Batch" value={`${project.batch_number} (${project.batch_year})`} />
          {project.has_tank && <InfoField label="Tank Size" value={project.size ?? '—'} />}
        </div>
      </div>

      {/* Funding Progress */}
      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60 mb-6">
        <h2 className="text-lg font-semibold text-slate-950 mb-4 font-[family-name:var(--font-fira-code)]">
          Funding Progress
        </h2>
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-2xl font-bold text-slate-950">{formatPHP(released)}</p>
            <p className="text-sm text-gray-500">released of {formatPHP(budget)}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-blue-700">{progress}%</p>
            <p className="text-sm text-gray-500">{formatPHP(remaining)} remaining</p>
          </div>
        </div>
        <div className="w-full bg-blue-100 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Payment Releases */}
      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60">
        <h2 className="text-lg font-semibold text-slate-950 mb-4 font-[family-name:var(--font-fira-code)]">
          Payment Releases
        </h2>
        {paymentReleases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left">
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
                    <td className="px-3 py-2 text-gray-500 text-xs">{formatDate(payment.released_at ?? payment.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No payment releases yet.</p>
        )}
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-gray-800">{value || '—'}</p>
    </div>
  )
}
