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
import { parsePage, parseSort, sanitizeSearch } from '@/lib/utils/registry';
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
  const defaultDateRange = getDefaultDateRange();
  const hasDateRangeFilter =
    currentDateFrom !== defaultDateRange.from || currentDateTo !== defaultDateRange.to;

  return (
    <AutoFilterForm
      action="/payments"
      className="registry-compact-filter-grid grid gap-3"
      hideMobileSubmit
    >
      {currentSort && currentDir && (
        <>
          <input type="hidden" name="sort" value={currentSort} />
          <input type="hidden" name="dir" value={currentDir} />
        </>
      )}
      <div className="min-w-0">
        <label
          htmlFor="search"
          className={`${registryLabelClass} sr-only sm:not-sr-only`}
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
      <input
        id="payment-filter-toggle"
        type="checkbox"
        className="peer sr-only"
        data-no-auto-submit
        defaultChecked={Boolean(currentStatus || hasDateRangeFilter)}
      />
      <label
        htmlFor="payment-filter-toggle"
        className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 peer-checked:hidden"
      >
        Filters
      </label>
      <label
        htmlFor="payment-filter-toggle"
        className="hidden h-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 peer-checked:flex"
      >
        Hide
      </label>
      <div className="col-span-2 hidden gap-3 peer-checked:grid sm:grid-cols-2 lg:grid-cols-[auto_auto] lg:items-end">
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
        <button
          type="submit"
          className="inline-flex h-11 touch-manipulation items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 sm:hidden"
        >
          Apply filters
        </button>
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
  const search = sanitizeSearch(params.search);
  const status = typeof params.status === 'string' ? params.status : '';
  const legacyDate = typeof params.date === 'string' ? params.date : '';
  const rawDateFrom = typeof params.date_from === 'string' ? params.date_from : undefined;
  const rawDateTo = typeof params.date_to === 'string' ? params.date_to : undefined;
  const hasDateRangeParams = rawDateFrom !== undefined || rawDateTo !== undefined;
  const defaultDateRange = getDefaultDateRange();
  const dateFrom = legacyDate || (hasDateRangeParams ? rawDateFrom ?? '' : defaultDateRange.from);
  const dateTo = legacyDate || (hasDateRangeParams ? rawDateTo ?? '' : defaultDateRange.to);
  const page = parsePage(params.page);
  const rawSort = typeof params.sort === 'string' ? params.sort : '';
  const rawDir = typeof params.dir === 'string' ? params.dir : '';
  const parsedSort = parseSort({
    sort: params.sort,
    direction: params.dir,
    allowedSorts: SORT_COLUMNS,
    defaultSort: 'released_date',
  });
  const sort = parsedSort.sort;
  const dir: SortDirection = parsedSort.ascending ? 'asc' : 'desc';
  const hasExplicitSort = Boolean(
    rawSort && rawDir && SORT_COLUMNS.includes(rawSort as PaymentSortColumn) && isSortDirection(rawDir)
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
