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
}

export async function getPayments(filters: PaymentFilters = {}) {
  const supabase = await createClient()
  const { search, status, project_id, released_by, date_from, date_to, page = 1, pageSize = 25 } = filters

  let query = supabase
    .from('payment_releases')
    .select('*, project:projects(name, project_number, supervisor, address)', { count: 'exact' })

  if (search) {
    const sanitizedSearch = search.replace(/[,%()]/g, ' ').trim()
    if (sanitizedSearch) {
      query = query.or(`check_number.ilike.%${sanitizedSearch}%,voucher_number.ilike.%${sanitizedSearch}%,notes.ilike.%${sanitizedSearch}%`)
    }
  }
  if (status) query = query.eq('status', status)
  if (project_id) query = query.eq('project_id', project_id)
  if (released_by) query = query.eq('released_by', released_by)
  if (date_from) query = query.gte('released_date', date_from)
  if (date_to) query = query.lte('released_date', date_to)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query
    .order('released_date', { ascending: false, nullsFirst: false })
    .range(from, to)

  if (error) throw error
  return { data: data ?? [], count: count ?? 0, page, pageSize }
}
