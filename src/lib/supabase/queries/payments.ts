import { createClient } from '@/lib/supabase/server'
import type { PaymentStatus } from '@/lib/types/database'

export interface PaymentFilters {
  search?: string
  status?: PaymentStatus
  project_id?: string
  released_by?: string
  date_from?: string
  date_to?: string
  page?: number
  pageSize?: number
  sort?: PaymentSortColumn
  dir?: SortDirection
}

export type PaymentSortColumn =
  | 'released_date'
  | 'check_number'
  | 'voucher_number'
  | 'amount'
  | 'status'
  | 'created_at'

export type SortDirection = 'asc' | 'desc'

export async function getPayments(filters: PaymentFilters = {}) {
  const supabase = await createClient()
  const {
    search,
    status,
    project_id,
    released_by,
    date_from,
    date_to,
    page = 1,
    pageSize = 25,
    sort = 'released_date',
    dir = 'desc',
  } = filters

  let query = supabase
    .from('payment_releases')
    .select('*, project:projects(name, project_number, supervisor, address)', { count: 'exact' })
  let amountQuery = supabase
    .from('payment_releases')
    .select('amount')

  if (search) {
    const sanitizedSearch = search.replace(/[,%()]/g, ' ').trim()
    if (sanitizedSearch) {
      const searchFilter = `check_number.ilike.%${sanitizedSearch}%,voucher_number.ilike.%${sanitizedSearch}%,notes.ilike.%${sanitizedSearch}%`
      query = query.or(searchFilter)
      amountQuery = amountQuery.or(searchFilter)
    }
  }
  if (status) {
    query = query.eq('status', status)
    amountQuery = amountQuery.eq('status', status)
  }
  if (project_id) {
    query = query.eq('project_id', project_id)
    amountQuery = amountQuery.eq('project_id', project_id)
  }
  if (released_by) {
    query = query.eq('released_by', released_by)
    amountQuery = amountQuery.eq('released_by', released_by)
  }
  if (date_from) {
    query = query.gte('released_date', date_from)
    amountQuery = amountQuery.gte('released_date', date_from)
  }
  if (date_to) {
    query = query.lte('released_date', date_to)
    amountQuery = amountQuery.lte('released_date', date_to)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const [rowsResult, amountResult] = await Promise.all([
    query
      .order(sort, { ascending: dir === 'asc', nullsFirst: false })
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
