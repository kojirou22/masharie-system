import Link from 'next/link'
import { Suspense } from 'react'
import { AutoFilterForm } from '@/components/auto-filter-form'
import { PaymentsTable, type PaymentWithProject } from '@/components/payments/payments-table'
import { getPayments } from '@/lib/supabase/queries/payments'
import type { PaymentStatus } from '@/lib/types/database'

export const revalidate = 3600

const STATUS_OPTIONS: PaymentStatus[] = ['Pending', 'Released', 'Cancelled']

function FilterBar({ currentSearch, currentStatus }: { currentSearch: string; currentStatus: string }) {
  return (
    <AutoFilterForm action="/payments" className="flex flex-wrap items-end gap-3 rounded-2xl border border-blue-100 bg-white/85 p-4 shadow-sm shadow-blue-100/60">
      <div className="flex-1 min-w-[220px]">
        <label htmlFor="search" className="block text-xs font-medium text-blue-700 mb-1">Search</label>
        <input
          id="search"
          name="search"
          type="text"
          defaultValue={currentSearch}
          placeholder="Check #, voucher #, notes..."
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
    </AutoFilterForm>
  )
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : ''
  const status = typeof params.status === 'string' ? params.status : ''
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1

  const { data: payments, count: total } = await getPayments({
    search,
    status: status as PaymentStatus | undefined,
    page,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-950 font-[family-name:var(--font-fira-code)]">
          Payment Releases
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{total} total payments</span>
          <Link
            href="/payments/new"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
          >
            New Payment
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <FilterBar currentSearch={search} currentStatus={status} />
      </div>

      <Suspense fallback={<div className="animate-pulse py-16 text-center text-blue-400">Loading payments...</div>}>
        <PaymentsTable
          payments={payments as PaymentWithProject[]}
          total={total}
          page={page}
          currentSearch={search}
          currentStatus={status}
        />
      </Suspense>
    </div>
  )
}
