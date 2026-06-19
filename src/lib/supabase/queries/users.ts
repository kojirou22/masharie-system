import { createClient } from '@/lib/supabase/server'
import type { UserProfile, UserRole } from '@/lib/types/database'

export interface UserFilters {
  search?: string
  role?: UserRole
  page?: number
  pageSize?: number
}

export async function getUsers(filters: UserFilters = {}) {
  const supabase = await createClient()
  const { search, role, page = 1, pageSize = 25 } = filters

  let query = supabase.from('users').select('*')

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }
  if (role) query = query.eq('role', role)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { data: data ?? [], count: count ?? 0, page, pageSize }
}
