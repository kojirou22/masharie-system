import Link from 'next/link';
import { Suspense } from 'react';
import { AutoFilterForm } from '@/components/auto-filter-form';
import { DateRangeFilter } from '@/components/date-range-filter';
import { Pagination } from '@/components/pagination';
import { getAdminUser } from '@/lib/auth/admin';
import { getExpenses, type ExpenseSortColumn, type SortDirection } from '@/lib/supabase/queries/expenses';
import { formatPHP } from '@/lib/utils/currency';
import { arabicTextClass, formatDate } from '@/lib/utils/formatters';
import type { Expense, PaymentStatus, AccountType } from '@/lib/types/database';

export const revalidate = 3600;

const STATUS_OPTIONS: PaymentStatus[] = ['Released', 'Cancelled'];
const ACCOUNT_OPTIONS: AccountType[] = [
  'Project Account',
  'Expenses Account',
  'Savings Account',
];

const SORT_COLUMNS = [
  'date',
  'check_number',
  'voucher_number',
  'purpose',
  'requested_by',
  'amount',
  'account_type',
  'created_at',
] as const satisfies readonly ExpenseSortColumn[];

function isExpenseSortColumn(value: string): value is ExpenseSortColumn {
  return SORT_COLUMNS.includes(value as ExpenseSortColumn);
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

const headerCellClass =
  'sticky top-0 z-20 bg-slate-100 px-4 py-3 font-bold text-slate-950 shadow-[inset_0_-1px_0_rgba(148,163,184,0.35)]';

function SortIcon({ active, direction }: { active: boolean; direction: string }) {
  if (!active) {
    return <span className="ml-1 text-slate-400" aria-hidden="true">↕</span>;
  }

  return (
    <span className="ml-1 text-slate-900" aria-hidden="true">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  );
}

function ExpensesTable({
  expenses,
  total,
  page,
  currentSearch,
  currentStatus,
  currentAccountType,
  currentDateFrom,
  currentDateTo,
  currentSort,
  currentDir,
}: {
  expenses: Expense[];
  total: number;
  page: number;
  currentSearch: string;
  currentStatus: string;
  currentAccountType: string;
  currentDateFrom: string;
  currentDateTo: string;
  currentSort: string;
  currentDir: string;
}) {
  const pageSize = 25;
  const totalPages = Math.ceil(total / pageSize);

  function baseParams() {
    const params = new URLSearchParams();
    if (currentSearch) params.set('search', currentSearch);
    if (currentStatus) params.set('status', currentStatus);
    if (currentAccountType) params.set('account_type', currentAccountType);
    if (currentDateFrom) params.set('date_from', currentDateFrom);
    if (currentDateTo) params.set('date_to', currentDateTo);
    return params;
  }

  function pageHref(nextPage: number) {
    const params = baseParams();
    if (currentSort && currentDir) {
      params.set('sort', currentSort);
      params.set('dir', currentDir);
    }
    if (nextPage > 1) params.set('page', String(nextPage));

    const query = params.toString();
    return query ? `/expenses?${query}` : '/expenses';
  }

  function sortHref(column: string) {
    const params = baseParams();

    if (currentSort !== column) {
      params.set('sort', column);
      params.set('dir', 'asc');
    } else if (currentDir === 'asc') {
      params.set('sort', column);
      params.set('dir', 'desc');
    }

    const query = params.toString();
    return query ? `/expenses?${query}` : '/expenses';
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm shadow-blue-100/60">
        <div className="border-b border-blue-100 bg-blue-50/60 px-4 py-2 text-xs font-medium text-blue-700 sm:hidden">
          Swipe horizontally to see requester, amount, and account.
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className={headerCellClass}>
                  <Link href={sortHref('date')} className="inline-flex items-center gap-1 hover:text-blue-700">
                    Date
                    <SortIcon active={currentSort === 'date'} direction={currentDir} />
                  </Link>
                </th>
                <th className={headerCellClass}>
                  <Link href={sortHref('check_number')} className="inline-flex items-center gap-1 hover:text-blue-700">
                    Check #
                    <SortIcon active={currentSort === 'check_number'} direction={currentDir} />
                  </Link>
                </th>
                <th className={headerCellClass}>
                  <Link href={sortHref('voucher_number')} className="inline-flex items-center gap-1 hover:text-blue-700">
                    Voucher #
                    <SortIcon active={currentSort === 'voucher_number'} direction={currentDir} />
                  </Link>
                </th>
                <th className={headerCellClass}>
                  <Link href={sortHref('purpose')} className="inline-flex items-center gap-1 hover:text-blue-700">
                    Purpose
                    <SortIcon active={currentSort === 'purpose'} direction={currentDir} />
                  </Link>
                </th>
                <th className={headerCellClass}>
                  <Link href={sortHref('requested_by')} className="inline-flex items-center gap-1 hover:text-blue-700">
                    Requested By
                    <SortIcon active={currentSort === 'requested_by'} direction={currentDir} />
                  </Link>
                </th>
                <th className={`${headerCellClass} text-right`}>
                  <Link href={sortHref('amount')} className="inline-flex items-center justify-end gap-1 hover:text-blue-700">
                    Amount
                    <SortIcon active={currentSort === 'amount'} direction={currentDir} />
                  </Link>
                </th>
                <th className={headerCellClass}>
                  <Link href={sortHref('account_type')} className="inline-flex items-center gap-1 hover:text-blue-700">
                    Account
                    <SortIcon active={currentSort === 'account_type'} direction={currentDir} />
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="hover:bg-blue-50/60 transition-colors"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <p className="text-lg font-medium">No expenses match your filters</p>
          <Link
            href="/expenses"
            className="mt-2 text-blue-700 hover:underline text-sm"
          >
            Clear all filters
          </Link>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, total)} of {total}
          </p>
          <Pagination currentPage={page} totalPages={totalPages} buildHref={pageHref} />
        </div>
      )}
    </div>
  );
}

function FilterBar({
  currentSearch,
  currentStatus,
  currentAccountType,
  currentDateFrom,
  currentDateTo,
  currentSort,
  currentDir,
}: {
  currentSearch: string;
  currentStatus: string;
  currentAccountType: string;
  currentDateFrom: string;
  currentDateTo: string;
  currentSort: string;
  currentDir: string;
}) {
  return (
    <AutoFilterForm
      action="/expenses"
      className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(360px,1fr)_auto_auto_auto] lg:items-end"
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
          placeholder="Check #, voucher #, purpose, requester..."
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
      <div>
        <label
          htmlFor="account_type"
          className="block text-xs font-medium text-blue-700 mb-1"
        >
          Account Type
        </label>
        <select
          id="account_type"
          name="account_type"
          defaultValue={currentAccountType}
          className="h-9 w-full rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-44"
        >
          <option value="">All</option>
          {ACCOUNT_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
    </AutoFilterForm>
  );
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : '';
  const status = typeof params.status === 'string' ? params.status : '';
  const account_type =
    typeof params.account_type === 'string' ? params.account_type : '';
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
  const sort = isExpenseSortColumn(rawSort) ? rawSort : 'date';
  const dir = isSortDirection(rawDir) ? rawDir : 'desc';
  const hasExplicitSort = Boolean(
    rawSort && rawDir && isExpenseSortColumn(rawSort) && isSortDirection(rawDir)
  );

  const [{ data: expenses, count: total, totalAmount }, { isAdmin }] = await Promise.all([
    getExpenses({
      search,
      status: status as PaymentStatus | undefined,
      account_type: account_type as AccountType | undefined,
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
              Expenses
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {total} total expenses
            </span>
            <span className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
              {formatPHP(totalAmount)} total amount
            </span>
            {isAdmin && (
              <Link
                href="/expenses/new"
                className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
              >
                New Expense
              </Link>
            )}
          </div>
        </div>
        <FilterBar
          currentSearch={search}
          currentStatus={status}
          currentAccountType={account_type}
          currentDateFrom={dateFrom}
          currentDateTo={dateTo}
          currentSort={hasExplicitSort ? sort : ''}
          currentDir={hasExplicitSort ? dir : ''}
        />
      </div>

      <Suspense
        fallback={
          <div className="animate-pulse py-16 text-center text-blue-400">
            Loading expenses...
          </div>
        }
      >
        <ExpensesTable
          expenses={expenses}
          total={total}
          page={page}
          currentSearch={search}
          currentStatus={status}
          currentAccountType={account_type}
          currentDateFrom={dateFrom}
          currentDateTo={dateTo}
          currentSort={hasExplicitSort ? sort : ''}
          currentDir={hasExplicitSort ? dir : ''}
        />
      </Suspense>
    </div>
  );
}
