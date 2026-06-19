import Link from 'next/link'
import { Suspense } from 'react'
import { AutoFilterForm } from '@/components/auto-filter-form'
import { getAdminUser } from '@/lib/auth/admin'
import { getExpenses } from '@/lib/supabase/queries/expenses'
import { formatPHP } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/formatters'
import type { Expense, PaymentStatus, AccountType } from '@/lib/types/database'

export const revalidate = 3600

const STATUS_OPTIONS: PaymentStatus[] = ['Released', 'Cancelled']
const ACCOUNT_OPTIONS: AccountType[] = ['Project Account', 'Expenses Account', 'Savings Account']

function ExpensesTable({
  expenses,
  total,
  page,
  currentSearch,
  currentStatus,
  currentAccountType,
}: {
  expenses: Expense[]
  total: number
  page: number
  currentSearch: string
  currentStatus: string
  currentAccountType: string
}) {
  const pageSize = 25
  const totalPages = Math.ceil(total / pageSize)

  function pageHref(nextPage: number) {
    const params = new URLSearchParams()
    if (currentSearch) params.set('search', currentSearch)
    if (currentStatus) params.set('status', currentStatus)
    if (currentAccountType) params.set('account_type', currentAccountType)
    if (nextPage > 1) params.set('page', String(nextPage))

    const query = params.toString()
    return query ? `/expenses?${query}` : '/expenses'
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-100/60">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/95 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-950">Date</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Check #</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Voucher #</th>
              <th className="px-4 py-3 font-semibold text-slate-950 text-right">Amount</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Purpose</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Account</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-blue-50/60 transition-colors">
                <td className="px-4 py-3 text-gray-600">{formatDate(expense.date)}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{expense.check_number}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{expense.voucher_number}</td>
                <td className="px-4 py-3 text-right font-medium">{formatPHP(expense.amount)}</td>
                <td className="px-4 py-3 text-gray-600">{expense.purpose}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {expense.account_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    expense.status === 'Released' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {expense.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <p className="text-lg font-medium">No expenses match your filters</p>
          <Link href="/expenses" className="mt-2 text-blue-700 hover:underline text-sm">Clear all filters</Link>
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

function FilterBar({ currentSearch, currentStatus, currentAccountType }: { currentSearch: string; currentStatus: string; currentAccountType: string }) {
  return (
    <AutoFilterForm action="/expenses" className="flex flex-wrap items-end gap-3 rounded-2xl border border-blue-100 bg-white/85 p-4 shadow-sm shadow-blue-100/60">
      <div className="flex-1 min-w-[220px]">
        <label htmlFor="search" className="block text-xs font-medium text-blue-700 mb-1">Search</label>
        <input
          id="search"
          name="search"
          type="text"
          defaultValue={currentSearch}
          placeholder="Check #, voucher #, purpose, requester..."
          className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-xs font-medium text-blue-700 mb-1">Status</label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="account_type" className="block text-xs font-medium text-blue-700 mb-1">Account Type</label>
        <select
          id="account_type"
          name="account_type"
          defaultValue={currentAccountType}
          className="rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All</option>
          {ACCOUNT_OPTIONS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
    </AutoFilterForm>
  )
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : ''
  const status = typeof params.status === 'string' ? params.status : ''
  const account_type = typeof params.account_type === 'string' ? params.account_type : ''
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1

  const [{ data: expenses, count: total }, { isAdmin }] = await Promise.all([
    getExpenses({
      search,
      status: status as PaymentStatus | undefined,
      account_type: account_type as AccountType | undefined,
      page,
    }),
    getAdminUser(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-950 font-[family-name:var(--font-fira-code)]">
          Expenses
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{total} total expenses</span>
          {isAdmin && (
            <Link
              href="/expenses/new"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
            >
              New Expense
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6">
        <FilterBar currentSearch={search} currentStatus={status} currentAccountType={account_type} />
      </div>

      <Suspense fallback={<div className="animate-pulse py-16 text-center text-blue-400">Loading expenses...</div>}>
        <ExpensesTable
          expenses={expenses}
          total={total}
          page={page}
          currentSearch={search}
          currentStatus={status}
          currentAccountType={account_type}
        />
      </Suspense>
    </div>
  )
}
