import Link from 'next/link';
import { Suspense } from 'react';
import { AutoFilterForm } from '@/components/auto-filter-form';
import { DateRangeFilter } from '@/components/date-range-filter';
import {
  PaymentsTable,
  type PaymentWithProject,
} from '@/components/payments/payments-table';
import { getAdminUser } from '@/lib/auth/admin';
import { getPayments, type PaymentSortColumn, type SortDirection } from '@/lib/supabase/queries/payments';
import { formatPHP } from '@/lib/utils/currency';
import type { PaymentStatus } from '@/lib/types/database';

export const revalidate = 3600;

const STATUS_OPTIONS: PaymentStatus[] = ['Pending', 'Released', 'Cancelled'];

const SORT_COLUMNS = [
  'released_date',
  'check_number',
  'voucher_number',
  'amount',
  'status',
  'created_at',
] as const satisfies readonly PaymentSortColumn[];

function isPaymentSortColumn(value: string): value is PaymentSortColumn {
  return SORT_COLUMNS.includes(value as PaymentSortColumn);
}

function isSortDirection(value: string): value is SortDirection {
  return value === 'asc' || value === 'desc';
}

function getDefaultDateRange() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${day}`,
  };
}

function FilterBar({
  currentSearch,
  currentStatus,
  currentDateFrom,
  currentDateTo,
  currentSort,
  currentDir,
}: {
  currentSearch: string;
  currentStatus: string;
  currentDateFrom: string;
  currentDateTo: string;
  currentSort: string;
  currentDir: string;
}) {
  return (
    <AutoFilterForm
      action="/payments"
      className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(420px,1fr)_auto_auto] lg:items-end"
    >
      {currentSort && currentDir && (
        <>
          <input type="hidden" name="sort" value={currentSort} />
          <input type="hidden" name="dir" value={currentDir} />
        </>
      )}
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
      <DateRangeFilter
        key={`${currentDateFrom}:${currentDateTo}`}
        from={currentDateFrom}
        to={currentDateTo}
      />
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
  const legacyDate = typeof params.date === 'string' ? params.date : '';
  const rawDateFrom = typeof params.date_from === 'string' ? params.date_from : undefined;
  const rawDateTo = typeof params.date_to === 'string' ? params.date_to : undefined;
  const hasDateRangeParams = rawDateFrom !== undefined || rawDateTo !== undefined;
  const defaultDateRange = getDefaultDateRange();
  const dateFrom = legacyDate || (hasDateRangeParams ? rawDateFrom ?? '' : defaultDateRange.from);
  const dateTo = legacyDate || (hasDateRangeParams ? rawDateTo ?? '' : defaultDateRange.to);
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1;
  const rawSort = typeof params.sort === 'string' ? params.sort : '';
  const rawDir = typeof params.dir === 'string' ? params.dir : '';
  const sort = isPaymentSortColumn(rawSort) ? rawSort : 'released_date';
  const dir = isSortDirection(rawDir) ? rawDir : 'desc';
  const hasExplicitSort = Boolean(
    rawSort && rawDir && isPaymentSortColumn(rawSort) && isSortDirection(rawDir)
  );

  const [{ data: payments, count: total, totalAmount }, { isAdmin }] = await Promise.all([
    getPayments({
      search,
      status: status as PaymentStatus | undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page,
      sort,
      dir,
    }),
    getAdminUser(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
      <div className="relative z-30 mb-4 rounded-3xl border border-blue-100 bg-white/85 p-5 shadow-sm shadow-blue-100/60 backdrop-blur sm:p-6">
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
            <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              {formatPHP(totalAmount)} total amount
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
          currentDateFrom={dateFrom}
          currentDateTo={dateTo}
          currentSort={hasExplicitSort ? sort : ''}
          currentDir={hasExplicitSort ? dir : ''}
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
          currentDateFrom={dateFrom}
          currentDateTo={dateTo}
          currentSort={hasExplicitSort ? sort : ''}
          currentDir={hasExplicitSort ? dir : ''}
          isAdmin={isAdmin}
        />
      </Suspense>
    </div>
  );
}
