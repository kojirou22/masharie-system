import Link from 'next/link';
import { Suspense } from 'react';
import { AutoFilterForm } from '@/components/auto-filter-form';
import {
  PaymentsTable,
  type PaymentWithProject,
} from '@/components/payments/payments-table';
import { getAdminUser } from '@/lib/auth/admin';
import { getPayments } from '@/lib/supabase/queries/payments';
import type { PaymentStatus } from '@/lib/types/database';

export const revalidate = 3600;

const STATUS_OPTIONS: PaymentStatus[] = ['Pending', 'Released', 'Cancelled'];

function FilterBar({
  currentSearch,
  currentStatus,
  currentDate,
}: {
  currentSearch: string;
  currentStatus: string;
  currentDate: string;
}) {
  return (
    <AutoFilterForm
      action="/payments"
      className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(420px,1fr)_auto_auto] lg:items-end"
    >
      <div className="sm:col-span-2 lg:col-span-1">
        <label
          htmlFor="search"
          className="block text-xs font-medium text-blue-700 mb-1"
        >
          Search
        </label>
        <input
          id="search"
          name="search"
          type="text"
          defaultValue={currentSearch}
          placeholder="Check #, voucher #, notes..."
          className="h-9 w-full rounded-lg border border-blue-200 px-3 py-1.5 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label
          htmlFor="date"
          className="block text-xs font-medium text-blue-700 mb-1"
        >
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={currentDate}
          className="h-9 w-full rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-40"
        />
      </div>
      <div>
        <label
          htmlFor="status"
          className="block text-xs font-medium text-blue-700 mb-1"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="h-9 w-full rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-28"
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </AutoFilterForm>
  );
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : '';
  const status = typeof params.status === 'string' ? params.status : '';
  const date = typeof params.date === 'string' ? params.date : '';
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1;

  const [{ data: payments, count: total }, { isAdmin }] = await Promise.all([
    getPayments({
      search,
      status: status as PaymentStatus | undefined,
      date_from: date || undefined,
      date_to: date || undefined,
      page,
    }),
    getAdminUser(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
      <div className="mb-4 rounded-3xl border border-blue-100 bg-white/85 p-5 shadow-sm shadow-blue-100/60 backdrop-blur sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Payment Releases
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {total} total payments
            </span>
            {isAdmin && (
              <Link
                href="/payments/new"
                className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
              >
                New Payment
              </Link>
            )}
          </div>
        </div>
        <FilterBar
          currentSearch={search}
          currentStatus={status}
          currentDate={date}
        />
      </div>

      <Suspense
        fallback={
          <div className="animate-pulse py-16 text-center text-blue-400">
            Loading payments...
          </div>
        }
      >
        <PaymentsTable
          payments={payments as PaymentWithProject[]}
          total={total}
          page={page}
          currentSearch={search}
          currentStatus={status}
          currentDate={date}
        />
      </Suspense>
    </div>
  );
}
