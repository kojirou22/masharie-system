'use client'

import type { KeyboardEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import {
  RegistryEmptyState,
  RegistryPaginationFooter,
  RegistrySortIcon,
  RegistryTableShell,
  registryHeaderCellClass,
} from '@/components/registry'
import { formatPHP } from '@/lib/utils/currency'
import { arabicTextClass, formatDate } from '@/lib/utils/formatters'
import type { PaymentRelease } from '@/lib/types/database'

export type PaymentWithProject = PaymentRelease & {
  project: { name: string; project_number: string; supervisor: string; address: string } | null
}

function SortIcon({ active, direction }: { active: boolean; direction: string }) {
  return <RegistrySortIcon active={active} direction={direction} />
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
  isAdmin,
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
  isAdmin: boolean
}) {
  const router = useRouter()
  const pageSize = 25

  function openPayment(payment: PaymentWithProject) {
    if (isAdmin) {
      router.push(`/payments/${payment.id}/edit`)
      return
    }

    if (payment.project_id) {
      router.push(`/projects/${payment.project_id}`)
    }
  }

  function handlePaymentKeyDown(event: KeyboardEvent<HTMLTableRowElement>, payment: PaymentWithProject) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openPayment(payment)
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
      <RegistryTableShell
        hint={`Click a payment row to ${isAdmin ? 'edit it' : 'open its project'}.`}
        mobileHint="Swipe horizontally to see project details and amounts."
        minWidth="840px"
        tableClassName="table-fixed"
      >
          <colgroup>
            <col className="w-[76px]" />
            <col className="w-[82px]" />
            <col className="w-[92px]" />
            <col className="w-[190px]" />
            <col className="w-[120px]" />
            <col className="w-[170px]" />
            <col className="w-[110px]" />
          </colgroup>
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className={registryHeaderCellClass}>
                <Link href={sortHref('released_date')} className="inline-flex items-center gap-1 hover:text-primary">
                  Date
                  <SortIcon active={currentSort === 'released_date'} direction={currentDir} />
                </Link>
              </th>
              <th className={registryHeaderCellClass}>
                <Link href={sortHref('check_number')} className="inline-flex items-center gap-1 hover:text-primary">
                  Check #
                  <SortIcon active={currentSort === 'check_number'} direction={currentDir} />
                </Link>
              </th>
              <th className={registryHeaderCellClass}>
                <Link href={sortHref('voucher_number')} className="inline-flex items-center gap-1 hover:text-primary">
                  Voucher #
                  <SortIcon active={currentSort === 'voucher_number'} direction={currentDir} />
                </Link>
              </th>
              <th className={registryHeaderCellClass}>Project</th>
              <th className={registryHeaderCellClass}>Supervisor</th>
              <th className={registryHeaderCellClass}>Address</th>
              <th className={`${registryHeaderCellClass} text-right`}>
                <Link href={sortHref('amount')} className="inline-flex items-center justify-end gap-1 hover:text-primary">
                  Amount
                  <SortIcon active={currentSort === 'amount'} direction={currentDir} />
                </Link>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {payments.map((payment) => {
              const isClickable = isAdmin || Boolean(payment.project_id)

              return (
                <tr
                  key={payment.id}
                  role={isClickable ? 'link' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  aria-label={isClickable ? (isAdmin ? 'Edit payment' : `Open project ${payment.project?.project_number ?? ''}`) : undefined}
                  className={`${isClickable ? 'group cursor-pointer focus:outline-none focus-visible:bg-muted focus-visible:[box-shadow:inset_3px_0_0_var(--ring)]' : ''} transition-colors hover:bg-muted/50`}
                  onClick={() => openPayment(payment)}
                  onKeyDown={(event) => handlePaymentKeyDown(event, payment)}
                >
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground">{formatDate(payment.released_date ?? payment.released_at ?? payment.created_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{payment.check_number ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{payment.voucher_number ?? '—'}</td>
                  <td className="px-4 py-3">
                    {payment.project ? (
                      <div className="space-y-0.5">
                        <span className="block font-mono text-xs font-medium text-primary">{payment.project.project_number}</span>
                        <span className={`block max-w-[220px] truncate text-sm font-medium text-foreground ${arabicTextClass(payment.project.name)}`}>
                          {payment.project.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-muted-foreground ${arabicTextClass(payment.project?.supervisor)}`}>{payment.project?.supervisor ?? '—'}</td>
                  <td className={`max-w-[220px] truncate px-4 py-3 text-muted-foreground ${arabicTextClass(payment.project?.address)}`}>{payment.project?.address ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
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
      </RegistryTableShell>

      {total === 0 && (
        <RegistryEmptyState clearHref="/payments" message="No payments match your filters" />
      )}

      <RegistryPaginationFooter currentPage={page} total={total} pageSize={pageSize} buildHref={pageHref} />
    </div>
  )
}


