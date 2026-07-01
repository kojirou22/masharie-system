'use client'

import type { KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatPHP } from '@/lib/utils/currency'
import { arabicTextClass, formatDate } from '@/lib/utils/formatters'
import type { Expense } from '@/lib/types/database'

export function ExpenseRow({ expense, isAdmin }: { expense: Expense; isAdmin: boolean }) {
  const router = useRouter()

  function openExpense() {
    if (isAdmin) {
      router.push(`/expenses/${expense.id}/edit`)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
    if (!isAdmin) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openExpense()
    }
  }

  return (
    <tr
      role={isAdmin ? 'link' : undefined}
      tabIndex={isAdmin ? 0 : undefined}
      aria-label={isAdmin ? 'Edit expense' : undefined}
      className={`${isAdmin ? 'group cursor-pointer focus:outline-none focus-visible:bg-muted focus-visible:[box-shadow:inset_3px_0_0_var(--ring)]' : ''} transition-colors hover:bg-muted/50`}
      onClick={openExpense}
      onKeyDown={handleKeyDown}
    >
      <td className="px-4 py-3 text-xs font-medium text-muted-foreground">
        {formatDate(expense.date)}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
        {expense.check_number || '—'}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
        {expense.voucher_number || '—'}
      </td>
      <td className={`max-w-[240px] truncate px-4 py-3 text-foreground ${arabicTextClass(expense.purpose)}`}>
        {expense.purpose}
      </td>
      <td className={`px-4 py-3 text-muted-foreground ${arabicTextClass(expense.requested_by)}`}>
        {expense.requested_by}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={expense.status} />
      </td>
      <td className="px-4 py-3 text-right font-medium text-foreground">
        <span className="inline-flex items-center justify-end gap-1">
          {formatPHP(expense.amount)}
          {isAdmin && (
            <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60 group-focus-visible:opacity-60" aria-hidden="true" />
          )}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {expense.account_type}
        </span>
      </td>
    </tr>
  )
}

export function ExpenseMobileCard({ expense, isAdmin }: { expense: Expense; isAdmin: boolean }) {
  const router = useRouter()

  function openExpense() {
    router.push(`/expenses/${expense.id}/edit`)
  }

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{formatDate(expense.date)}</p>
          <p className={`mt-1 line-clamp-2 text-sm font-medium leading-6 text-foreground ${arabicTextClass(expense.purpose)}`}>
            {expense.purpose}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-foreground">{formatPHP(expense.amount)}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={expense.status} />
        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {expense.account_type}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span className="rounded-xl bg-muted/60 px-2.5 py-2">Check: {expense.check_number || '—'}</span>
        <span className="rounded-xl bg-muted/60 px-2.5 py-2">Voucher: {expense.voucher_number || '—'}</span>
      </div>
      <p className={`mt-3 text-xs text-muted-foreground ${arabicTextClass(expense.requested_by)}`}>
        Requested by: {expense.requested_by || '—'}
      </p>
    </>
  )

  if (!isAdmin) {
    return (
      <article className="rounded-2xl border border-border bg-background/70 p-4 text-left shadow-sm">
        {content}
      </article>
    )
  }

  return (
    <button
      type="button"
      onClick={openExpense}
      className="rounded-2xl border border-border bg-background/70 p-4 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      aria-label="Edit expense"
    >
      {content}
    </button>
  )
}
