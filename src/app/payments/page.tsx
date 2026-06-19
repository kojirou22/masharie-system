import { Suspense } from 'react'
import { getPayments } from '@/lib/supabase/queries/payments'
import { formatPHP } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/formatters'
import type { PaymentStatus } from '@/lib/types/database'

export const revalidate = 3600

const STATUS_OPTIONS: PaymentStatus[] = ['Pending', 'Released', 'Cancelled']

function PaymentsTable({ payments, total, page }: { payments: any[]; total: number; page: number }) {
  const pageSize = 25
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-purple-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-purple-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-purple-900">Project</th>
              <th className="px-4 py-3 font-semibold text-purple-900">Check #</th>
              <th className="px-4 py-3 font-semibold text-purple-900">Voucher #</th>
              <th className="px-4 py-3 font-semibold text-purple-900 text-right">Amount</th>
              <th className="px-4 py-3 font-semibold text-purple-900">Status</th>
              <th className="px-4 py-3 font-semibold text-purple-900">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-purple-50/50 transition-colors">
                <td className="px-4 py-3">
                  {payment.project ? (
                    <a href={`/projects/${payment.project_id}`} className="text-purple-700 hover:underline font-medium">
                      {payment.project.project_number}
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{payment.check_number ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{payment.voucher_number ?? '—'}</td>
                <td className="px-4 py-3 text-right font-medium">{formatPHP(payment.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    payment.status === 'Released' ? 'bg-green-100 text-green-800' :
                    payment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(payment.released_at ?? payment.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <p className="text-lg font-medium">No payments match your filters</p>
          <a href="/payments" className="mt-2 text-purple-600 hover:underline text-sm">Clear all filters</a>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={`/payments?page=${page - 1}`} className="rounded-md border border-purple-200 px-3 py-1.5 text-sm hover:bg-purple-50">Previous</a>
            )}
            {page < totalPages && (
              <a href={`/payments?page=${page + 1}`} className="rounded-md border border-purple-200 px-3 py-1.5 text-sm hover:bg-purple-50">Next</a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterBar({ currentStatus }: { currentStatus: string }) {
  return (
    <form className="flex flex-wrap gap-3 items-end">
      <div>
        <label htmlFor="status" className="block text-xs font-medium text-purple-700 mb-1">Status</label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="rounded-md border border-purple-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
      >
        Filter
      </button>
    </form>
  )
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const status = typeof params.status === 'string' ? params.status : ''
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1

  const { data: payments, count: total } = await getPayments({
    status: status as PaymentStatus | undefined,
    page,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-purple-900 font-[family-name:var(--font-fira-code)]">
          Payment Releases
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{total} total payments</span>
          <a
            href="/payments/new"
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            New Payment
          </a>
        </div>
      </div>

      <div className="mb-6">
        <FilterBar currentStatus={status} />
      </div>

      <Suspense fallback={<div className="animate-pulse py-16 text-center text-purple-400">Loading payments...</div>}>
        <PaymentsTable payments={payments} total={total} page={page} />
      </Suspense>
    </div>
  )
}
