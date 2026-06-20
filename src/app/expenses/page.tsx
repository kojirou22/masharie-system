import Link from 'next/link';
import { Suspense } from 'react';
import { AutoFilterForm } from '@/components/auto-filter-form';
import { getExpenses } from '@/lib/supabase/queries/expenses';
import { formatPHP } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/formatters';
import type { Expense, PaymentStatus, AccountType } from '@/lib/types/database';

export const revalidate = 3600;

const STATUS_OPTIONS: PaymentStatus[] = ['Released', 'Cancelled'];
const ACCOUNT_OPTIONS: AccountType[] = [
  'Project Account',
  'Expenses Account',
  'Savings Account',
];

function ExpensesTable({
  expenses,
  total,
  page,
  currentSearch,
  currentStatus,
  currentAccountType,
  currentDate,
}: {
  expenses: Expense[];
  total: number;
  page: number;
  currentSearch: string;
  currentStatus: string;
  currentAccountType: string;
  currentDate: string;
}) {
  const pageSize = 25;
  const totalPages = Math.ceil(total / pageSize);

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (currentSearch) params.set('search', currentSearch);
    if (currentStatus) params.set('status', currentStatus);
    if (currentAccountType) params.set('account_type', currentAccountType);
    if (currentDate) params.set('date', currentDate);
    if (nextPage > 1) params.set('page', String(nextPage));

    const query = params.toString();
    return query ? `/expenses?${query}` : '/expenses';
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm shadow-blue-100/60">
        <div className="border-b border-blue-100 bg-blue-50/60 px-4 py-2 text-xs font-medium text-blue-700 sm:hidden">
          Swipe horizontally to see requester, amount, and account.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-950">Date</th>
                <th className="px-4 py-3 font-bold text-slate-950">Check #</th>
                <th className="px-4 py-3 font-bold text-slate-950">
                  Voucher #
                </th>
                <th className="px-4 py-3 font-bold text-slate-950">Purpose</th>
                <th className="px-4 py-3 font-bold text-slate-950">
                  Requested By
                </th>
                <th className="px-4 py-3 font-bold text-slate-950 text-right">
                  Amount
                </th>
                <th className="px-4 py-3 font-bold text-slate-950">Account</th>
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
                  <td className="px-4 py-3 text-gray-600">{expense.purpose}</td>
                  <td className="px-4 py-3 text-gray-600">
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
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={pageHref(page - 1)}
                className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={pageHref(page + 1)}
                className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBar({
  currentSearch,
  currentStatus,
  currentAccountType,
  currentDate,
}: {
  currentSearch: string;
  currentStatus: string;
  currentAccountType: string;
  currentDate: string;
}) {
  return (
    <AutoFilterForm
      action="/expenses"
      className="grid gap-3 rounded-3xl border border-blue-100 bg-white/90 p-4 shadow-sm shadow-blue-100/60 backdrop-blur sm:grid-cols-2 lg:grid-cols-[minmax(260px,1fr)_auto_auto_auto] lg:items-end"
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
          placeholder="Check #, voucher #, purpose, requester..."
          className="h-11 w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="h-11 w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="h-11 w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="h-11 w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  const date = typeof params.date === 'string' ? params.date : '';
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1;

  const [{ data: expenses, count: total }, { isAdmin }] = await Promise.all([
    getExpenses({
      search,
      status: status as PaymentStatus | undefined,
      account_type: account_type as AccountType | undefined,
      date_from: date || undefined,
      date_to: date || undefined,
      page,
    }),
    getAdminUser(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <div className="mb-6 rounded-3xl border border-blue-100 bg-white/85 p-5 shadow-sm shadow-blue-100/60 backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Expense control
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Expenses
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review checks, vouchers, and recorded expense amounts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {total} total expenses
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
      </div>

      <div className="mb-6">
        <FilterBar
          currentSearch={search}
          currentStatus={status}
          currentAccountType={account_type}
          currentDate={date}
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
          currentDate={date}
        />
      </Suspense>
    </div>
  );
}
