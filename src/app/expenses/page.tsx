import Link from 'next/link';
import { Suspense } from 'react';
import { AutoFilterForm } from '@/components/auto-filter-form';
import { DateRangeFilter } from '@/components/date-range-filter';
import {
  RegistryEmptyState,
  RegistryHeader,
  RegistryPageShell,
  RegistryPaginationFooter,
  RegistrySortIcon,
  RegistryStatBadge,
  RegistryTableShell,
  registryFilterGridClass,
  registryHeaderCellClass,
  registryInputClass,
  registryLabelClass,
  registrySelectClass,
} from '@/components/registry';
import { ExpenseMobileCard, ExpenseRow } from '@/components/expenses/expense-row';
import { getAdminUser } from '@/lib/auth/admin';
import { getExpenses, type ExpenseSortColumn, type SortDirection } from '@/lib/supabase/queries/expenses';
import { formatPHP } from '@/lib/utils/currency';
import { parsePage, parseSort, sanitizeSearch } from '@/lib/utils/registry';
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

function SortIcon({ active, direction }: { active: boolean; direction: string }) {
  return <RegistrySortIcon active={active} direction={direction} />;
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
  isAdmin,
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
  isAdmin: boolean;
}) {
  const pageSize = 25;

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
      <RegistryTableShell
        hint={isAdmin ? 'Click an expense row to edit it.' : 'Expense rows are read-only.'}
        mobileCards={expenses.map((expense) => (
          <ExpenseMobileCard key={expense.id} expense={expense} isAdmin={isAdmin} />
        ))}
        mobileHint={isAdmin ? 'Tap an expense card to edit it.' : 'Expense cards are read-only.'}
        minWidth="940px"
      >
        <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className={registryHeaderCellClass}>
              <Link href={sortHref('date')} className="inline-flex items-center gap-1 hover:text-primary">
                Date
                <SortIcon active={currentSort === 'date'} direction={currentDir} />
              </Link>
            </th>
            <th className={registryHeaderCellClass}>
              <Link href={sortHref('check_number')} className="inline-flex items-center gap-1 hover:text-primary">
                Check #
                <SortIcon active={currentSort === 'check_number'} direction={currentDir} />
              </Link>
            </th>
            <th className={registryHeaderCellClass}>
              <Link href={sortHref('voucher_number')} className="inline-flex items-center gap-1 hover:text-primary">
                Voucher #
                <SortIcon active={currentSort === 'voucher_number'} direction={currentDir} />
              </Link>
            </th>
            <th className={registryHeaderCellClass}>
              <Link href={sortHref('purpose')} className="inline-flex items-center gap-1 hover:text-primary">
                Purpose
                <SortIcon active={currentSort === 'purpose'} direction={currentDir} />
              </Link>
            </th>
            <th className={registryHeaderCellClass}>
              <Link href={sortHref('requested_by')} className="inline-flex items-center gap-1 hover:text-primary">
                Requested By
                <SortIcon active={currentSort === 'requested_by'} direction={currentDir} />
              </Link>
            </th>
            <th className={registryHeaderCellClass}>Status</th>
            <th className={`${registryHeaderCellClass} text-right`}>
              <Link href={sortHref('amount')} className="inline-flex items-center justify-end gap-1 hover:text-primary">
                Amount
                <SortIcon active={currentSort === 'amount'} direction={currentDir} />
              </Link>
            </th>
            <th className={registryHeaderCellClass}>
              <Link href={sortHref('account_type')} className="inline-flex items-center gap-1 hover:text-primary">
                Account
                <SortIcon active={currentSort === 'account_type'} direction={currentDir} />
              </Link>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {expenses.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} isAdmin={isAdmin} />
          ))}
        </tbody>
      </RegistryTableShell>

      {total === 0 && (
        <RegistryEmptyState clearHref="/expenses" message="No expenses match your filters" />
      )}

      <RegistryPaginationFooter currentPage={page} total={total} pageSize={pageSize} buildHref={pageHref} />
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
      className={registryFilterGridClass}
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
          placeholder="Check #, voucher #, purpose, requester..."
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
      <div>
        <label
          htmlFor="account_type"
          className={registryLabelClass}
        >
          Account Type
        </label>
        <select
          id="account_type"
          name="account_type"
          defaultValue={currentAccountType}
          className={`${registrySelectClass} lg:w-44`}
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
  const search = sanitizeSearch(params.search);
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
  const page = parsePage(params.page);
  const rawSort = typeof params.sort === 'string' ? params.sort : '';
  const rawDir = typeof params.dir === 'string' ? params.dir : '';
  const parsedSort = parseSort({
    sort: params.sort,
    direction: params.dir,
    allowedSorts: SORT_COLUMNS,
    defaultSort: 'date',
  });
  const sort = parsedSort.sort;
  const dir: SortDirection = parsedSort.ascending ? 'asc' : 'desc';
  const hasExplicitSort = Boolean(
    rawSort && rawDir && SORT_COLUMNS.includes(rawSort as ExpenseSortColumn) && isSortDirection(rawDir)
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
    <RegistryPageShell>
      <RegistryHeader
        title="Expenses"
        stats={
          <>
            <RegistryStatBadge>{total} total expenses</RegistryStatBadge>
            <RegistryStatBadge tone="rose">{formatPHP(totalAmount)} total amount</RegistryStatBadge>
          </>
        }
        actions={
          isAdmin && (
            <Link
              href="/expenses/new"
              className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/80"
            >
              New Expense
            </Link>
          )
        }
      >
        <FilterBar
          currentSearch={search}
          currentStatus={status}
          currentAccountType={account_type}
          currentDateFrom={dateFrom}
          currentDateTo={dateTo}
          currentSort={hasExplicitSort ? sort : ''}
          currentDir={hasExplicitSort ? dir : ''}
        />
      </RegistryHeader>

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
          isAdmin={isAdmin}
        />
      </Suspense>
    </RegistryPageShell>
  );
}
