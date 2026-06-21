import { createClient } from '@/lib/supabase/server'
import type { PaymentStatus, AccountType } from '@/lib/types/database'

export interface ExpenseFilters {
  search?: string
  status?: PaymentStatus
  account_type?: AccountType
  date_from?: string
  date_to?: string
  page?: number
  pageSize?: number
  sort?: ExpenseSortColumn
  dir?: SortDirection
}

export type ExpenseSortColumn =
  | 'date'
  | 'check_number'
  | 'voucher_number'
  | 'purpose'
  | 'requested_by'
  | 'amount'
  | 'account_type'
  | 'created_at'

export type SortDirection = 'asc' | 'desc'

export async function getExpenses(filters: ExpenseFilters = {}) {
  const supabase = await createClient()
  const {
    search,
    status,
    account_type,
    date_from,
    date_to,
    page = 1,
    pageSize = 25,
    sort = 'date',
    dir = 'desc',
  } = filters

  let query = supabase.from('expenses').select('*', { count: 'exact' })
  let amountQuery = supabase.from('expenses').select('amount')

  if (search) {
    const sanitizedSearch = search.replace(/[,%()]/g, ' ').trim()
    if (sanitizedSearch) {
      const searchFilter = `check_number.ilike.%${sanitizedSearch}%,voucher_number.ilike.%${sanitizedSearch}%,purpose.ilike.%${sanitizedSearch}%,requested_by.ilike.%${sanitizedSearch}%`
      query = query.or(searchFilter)
      amountQuery = amountQuery.or(searchFilter)
    }
  }
  if (status) {
    query = query.eq('status', status)
    amountQuery = amountQuery.eq('status', status)
  }
  if (account_type) {
    query = query.eq('account_type', account_type)
    amountQuery = amountQuery.eq('account_type', account_type)
  }
  if (date_from) {
    query = query.gte('date', date_from)
    amountQuery = amountQuery.gte('date', date_from)
  }
  if (date_to) {
    query = query.lte('date', date_to)
    amountQuery = amountQuery.lte('date', date_to)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const [rowsResult, amountResult] = await Promise.all([
    query
      .order(sort, { ascending: dir === 'asc' })
      .range(from, to),
    amountQuery,
  ])

  if (rowsResult.error) throw rowsResult.error
  if (amountResult.error) throw amountResult.error

  const totalAmount = (amountResult.data ?? []).reduce(
    (sum, row) => sum + (row.amount ?? 0),
    0
  )

  return {
    data: rowsResult.data ?? [],
    count: rowsResult.count ?? 0,
    page,
    pageSize,
    totalAmount,
  }
}
