'use client'

import type { KeyboardEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Pagination } from '@/components/pagination'
import { formatPHP } from '@/lib/utils/currency'
import { arabicTextClass, formatDate } from '@/lib/utils/formatters'
import type { PaymentRelease } from '@/lib/types/database'

export type PaymentWithProject = PaymentRelease & {
  project: { name: string; project_number: string; supervisor: string; address: string } | null
}

const headerCellClass =
  'sticky top-0 z-20 bg-slate-100 px-4 py-3 font-bold text-slate-950 shadow-[inset_0_-1px_0_rgba(148,163,184,0.35)]'

function SortIcon({ active, direction }: { active: boolean; direction: string }) {
  if (!active) {
    return <span className="ml-1 text-slate-400" aria-hidden="true">↕</span>
  }

  return (
    <span className="ml-1 text-slate-900" aria-hidden="true">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  )
}

export function PaymentsTable({
  payments,
  total,
  page,
  currentSearch,
  currentStatus,
  currentDateFrom,
  currentDateTo,
  currentSort,
  currentDir,
}: {
  payments: PaymentWithProject[]
  total: number
  page: number
  currentSearch: string
  currentStatus: string
  currentDateFrom: string
  currentDateTo: string
  currentSort: string
  currentDir: string
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

  function baseParams() {
    const params = new URLSearchParams()
    if (currentSearch) params.set('search', currentSearch)
    if (currentStatus) params.set('status', currentStatus)
    if (currentDateFrom) params.set('date_from', currentDateFrom)
    if (currentDateTo) params.set('date_to', currentDateTo)
    return params
  }

  function pageHref(nextPage: number) {
    const params = baseParams()
    if (currentSort && currentDir) {
      params.set('sort', currentSort)
      params.set('dir', currentDir)
    }
    if (nextPage > 1) params.set('page', String(nextPage))

    const query = params.toString()
    return query ? `/payments?${query}` : '/payments'
  }

  function sortHref(column: string) {
    const params = baseParams()

    if (currentSort !== column) {
      params.set('sort', column)
      params.set('dir', 'asc')
    } else if (currentDir === 'asc') {
      params.set('sort', column)
      params.set('dir', 'desc')
    }

    const query = params.toString()
    return query ? `/payments?${query}` : '/payments'
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm shadow-blue-100/60">
        <div className="border-b border-blue-100 bg-blue-50/60 px-4 py-2 text-xs font-medium text-blue-700">
          <span className="sm:hidden">Swipe horizontally to see project details and amounts.</span>
          <span className="hidden sm:inline">Click a payment row to open its project.</span>
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className={headerCellClass}>
                <Link href={sortHref('released_date')} className="inline-flex items-center gap-1 hover:text-blue-700">
                  Date
                  <SortIcon active={currentSort === 'released_date'} direction={currentDir} />
                </Link>
              </th>
              <th className={headerCellClass}>
                <Link href={sortHref('check_number')} className="inline-flex items-center gap-1 hover:text-blue-700">
                  Check #
                  <SortIcon active={currentSort === 'check_number'} direction={currentDir} />
                </Link>
              </th>
              <th className={headerCellClass}>
                <Link href={sortHref('voucher_number')} className="inline-flex items-center gap-1 hover:text-blue-700">
                  Voucher #
                  <SortIcon active={currentSort === 'voucher_number'} direction={currentDir} />
                </Link>
              </th>
              <th className={headerCellClass}>Project #</th>
              <th className={headerCellClass}>Supervisor</th>
              <th className={headerCellClass}>Address</th>
              <th className={`${headerCellClass} text-right`}>
                <Link href={sortHref('amount')} className="inline-flex items-center justify-end gap-1 hover:text-blue-700">
                  Amount
                  <SortIcon active={currentSort === 'amount'} direction={currentDir} />
                </Link>
              </th>
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
                  className={`${isClickable ? 'group cursor-pointer focus:outline-none focus-visible:bg-blue-50 focus-visible:[box-shadow:inset_3px_0_0_rgb(59_130_246)]' : ''} transition-colors hover:bg-blue-50/60`}
                  onClick={() => openPaymentProject(payment)}
                  onKeyDown={(event) => handlePaymentKeyDown(event, payment)}
                >
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(payment.released_date ?? payment.released_at ?? payment.created_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{payment.check_number ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{payment.voucher_number ?? '—'}</td>
                  <td className="px-4 py-3">
                    {payment.project ? (
                      <span className="font-medium text-blue-700">{payment.project.project_number}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-gray-600 ${arabicTextClass(payment.project?.supervisor)}`}>{payment.project?.supervisor ?? '—'}</td>
                  <td className={`px-4 py-3 text-gray-600 max-w-[220px] truncate ${arabicTextClass(payment.project?.address)}`}>{payment.project?.address ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    <span className="inline-flex items-center justify-end gap-1">
                      {formatPHP(payment.amount)}
                      {isClickable && (
                        <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60 group-focus-visible:opacity-60" aria-hidden="true" />
                      )}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
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
          <Pagination currentPage={page} totalPages={totalPages} buildHref={pageHref} />
        </div>
      )}
    </div>
  )
}


