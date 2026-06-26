import Link from 'next/link';
import { Suspense } from 'react';
import { AutoFilterForm } from '@/components/auto-filter-form';
import { DateRangeFilter } from '@/components/date-range-filter';
import {
  RegistryHeader,
  RegistryPageShell,
  RegistryStatBadge,
  registryInputClass,
  registryLabelClass,
  registrySelectClass,
} from '@/components/registry';
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
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(420px,1fr)_auto_auto] lg:items-end"
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
          className={registryLabelClass}
        >
          Search
        </label>
        <input
          id="search"
          name="search"
          type="text"
          defaultValue={currentSearch}
          placeholder="Check #, voucher #, notes..."
          className={registryInputClass}
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
          className={registryLabelClass}
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className={`${registrySelectClass} lg:w-28`}
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
    <RegistryPageShell>
      <RegistryHeader
        title="Payment Releases"
        stats={
          <>
            <RegistryStatBadge>{total} total payments</RegistryStatBadge>
            <RegistryStatBadge tone="emerald">{formatPHP(totalAmount)} total amount</RegistryStatBadge>
          </>
        }
        actions={
          isAdmin && (
            <Link
              href="/payments/new"
              className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/80"
            >
              New Payment
            </Link>
          )
        }
      >
        <FilterBar
          currentSearch={search}
          currentStatus={status}
          currentDateFrom={dateFrom}
          currentDateTo={dateTo}
          currentSort={hasExplicitSort ? sort : ''}
          currentDir={hasExplicitSort ? dir : ''}
        />
      </RegistryHeader>

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
    </RegistryPageShell>
  );
}
