import { createClient } from '@/lib/supabase/server'
import type { Expense, PaymentStatus, AccountType } from '@/lib/types/database'

export interface ExpenseFilters {
  search?: string
  status?: PaymentStatus
  account_type?: AccountType
  date_from?: string
  date_to?: string
  page?: number
  pageSize?: number
}

export async function getExpenses(filters: ExpenseFilters = {}) {
  const supabase = await createClient()
  const { search, status, account_type, date_from, date_to, page = 1, pageSize = 25 } = filters

  let query = supabase.from('expenses').select('*')

  if (search) {
    query = query.or(
      `check_number.ilike.%${search}%,voucher_number.ilike.%${search}%,purpose.ilike.%${search}%,requested_by.ilike.%${search}%`
    )
  }
  if (status) query = query.eq('status', status)
  if (account_type) query = query.eq('account_type', account_type)
  if (date_from) query = query.gte('date', date_from)
  if (date_to) query = query.lte('date', date_to)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query
    .order('date', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { data: data ?? [], count: count ?? 0, page, pageSize }
}
