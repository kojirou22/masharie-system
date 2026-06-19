import { createClient } from '@/lib/supabase/server'
import type { DashboardStats } from '@/lib/types/database'

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const [totalResult, activeResult, budgetResult, releasedResult] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'On Going'),
    supabase.from('projects').select('budget'),
    supabase.from('payment_releases').select('amount'),
  ])

  const total_budget = (budgetResult.data ?? []).reduce((sum, p) => sum + (p.budget ?? 0), 0)
  const total_released = (releasedResult.data ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0)

  return {
    total_projects: totalResult.count ?? 0,
    active_projects: activeResult.count ?? 0,
    total_budget,
    total_released,
  }
}
