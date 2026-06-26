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
