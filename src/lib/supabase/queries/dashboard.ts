import { createClient } from '@/lib/supabase/server'
import type { DashboardStats } from '@/lib/types/database'

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const [totalResult, activeResult, budgetResult, releasedResult] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'On Going'),
    supabase.from('projects').select('budget'),
    supabase.from('payment_releases').select('amount').eq('status', 'Released'),
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

/**
 * Aggregated data for charts — avoids loading thousands of rows.
 * Returns budget totals grouped by project type and status counts.
 */
export async function getChartData() {
  const supabase = await createClient()

  const [projectsByType, projectsByStatus, budgetByType] = await Promise.all([
    supabase.from('projects').select('type'),
    supabase.from('projects').select('status'),
    supabase.from('projects').select('type, budget'),
  ])

  const typeCounts: Record<string, number> = {}
  for (const p of projectsByType.data ?? []) {
    typeCounts[p.type] = (typeCounts[p.type] || 0) + 1
  }

  const statusCounts: Record<string, number> = {}
  for (const p of projectsByStatus.data ?? []) {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
  }

  const budgetByTypeMap: Record<string, number> = {}
  for (const p of budgetByType.data ?? []) {
    budgetByTypeMap[p.type] = (budgetByTypeMap[p.type] || 0) + (p.budget ?? 0)
  }

  return {
    projectsByType: Object.entries(typeCounts).map(([name, value]) => ({ name, value })),
    projectsByStatus: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
    budgetByType: Object.entries(budgetByTypeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
  }
}
