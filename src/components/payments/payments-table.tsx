'use client'

import type { KeyboardEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPHP } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/formatters'
import type { PaymentRelease, PaymentStatus } from '@/lib/types/database'

export type PaymentWithProject = PaymentRelease & {
  project: { name: string; project_number: string } | null
}

export function PaymentsTable({
  payments,
  total,
  page,
  currentSearch,
  currentStatus,
}: {
  payments: PaymentWithProject[]
  total: number
  page: number
  currentSearch: string
  currentStatus: string
}) {
  const router = useRouter()
  const pageSize = 25
  const totalPages = Math.ceil(total / pageSize)

  function openPaymentProject(payment: PaymentWithProject) {
    if (payment.project_id) {
      router.push(`/projects/${payment.project_id}`)
    }
  }

  function handlePaymentKeyDown(event: KeyboardEvent<HTMLTableRowElement>, payment: PaymentWithProject) {
    if ((event.key === 'Enter' || event.key === ' ') && payment.project_id) {
      event.preventDefault()
      openPaymentProject(payment)
    }
  }

  function pageHref(nextPage: number) {
    const params = new URLSearchParams()
    if (currentSearch) params.set('search', currentSearch)
    if (currentStatus) params.set('status', currentStatus)
    if (nextPage > 1) params.set('page', String(nextPage))

    const query = params.toString()
    return query ? `/payments?${query}` : '/payments'
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-100/60">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/95 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-950">Project</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Check #</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Voucher #</th>
              <th className="px-4 py-3 font-semibold text-slate-950 text-right">Amount</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => {
              const isClickable = Boolean(payment.project_id)

              return (
                <tr
                  key={payment.id}
                  role={isClickable ? 'link' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  aria-label={payment.project ? `Open project ${payment.project.project_number}` : undefined}
                  className={`${isClickable ? 'cursor-pointer focus:outline-none focus-visible:bg-blue-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500' : ''} hover:bg-blue-50/60 transition-colors`}
                  onClick={() => openPaymentProject(payment)}
                  onKeyDown={(event) => handlePaymentKeyDown(event, payment)}
                >
                  <td className="px-4 py-3">
                    {payment.project ? (
                      <span className="font-medium text-blue-700">{payment.project.project_number}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{payment.check_number ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{payment.voucher_number ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPHP(payment.amount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(payment.released_date ?? payment.released_at ?? payment.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <p className="text-lg font-medium">No payments match your filters</p>
          <Link href="/payments" className="mt-2 text-blue-700 hover:underline text-sm">Clear all filters</Link>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={pageHref(page - 1)} className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-50">Previous</Link>
            )}
            {page < totalPages && (
              <Link href={pageHref(page + 1)} className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-50">Next</Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    Pending: 'bg-amber-100 text-amber-800',
    Released: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}
