'use client'

import type { KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
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
      className={`${isAdmin ? 'cursor-pointer focus:outline-none focus-visible:bg-blue-50 focus-visible:[box-shadow:inset_3px_0_0_rgb(59_130_246)]' : ''} hover:bg-blue-50/60 transition-colors`}
      onClick={openExpense}
      onKeyDown={handleKeyDown}
    >
      <td className="px-4 py-3 text-gray-600">
        {formatDate(expense.date)}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-gray-600">
        {expense.check_number}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-gray-600">
        {expense.voucher_number}
      </td>
      <td className={`px-4 py-3 text-gray-600 ${arabicTextClass(expense.purpose)}`}>{expense.purpose}</td>
      <td className={`px-4 py-3 text-gray-600 ${arabicTextClass(expense.requested_by)}`}>
        {expense.requested_by}
      </td>
      <td className="px-4 py-3 text-right font-medium">
        {formatPHP(expense.amount)}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {expense.account_type}
        </span>
      </td>
    </tr>
  )
}
