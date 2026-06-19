import { createClient } from '@/lib/supabase/server'
import type { PaymentRelease, Project, ProjectStatus, ProjectType } from '@/lib/types/database'

export interface ProjectFilters {
  search?: string
  status?: ProjectStatus
  type?: ProjectType
  batch_year?: number
  donor?: string
  supervisor?: string
  page?: number
  pageSize?: number
}

type ProjectReleaseSummary = Pick<PaymentRelease, 'amount' | 'status'>
type ProjectWithReleaseRows = Project & {
  payment_releases?: ProjectReleaseSummary[] | null
}

export async function getProjects(filters: ProjectFilters = {}) {
  const supabase = await createClient()
  const { search, status, type, batch_year, donor, supervisor, page = 1, pageSize = 25 } = filters

  let query = supabase
    .from('projects')
    .select('*, payment_releases(amount, status)', { count: 'exact' })

  if (search) {
    const sanitizedSearch = search.replace(/[,%()]/g, ' ').trim()
    if (sanitizedSearch) {
      query = query.or(
        `project_number.ilike.%${sanitizedSearch}%,name.ilike.%${sanitizedSearch}%,donor.ilike.%${sanitizedSearch}%,supervisor.ilike.%${sanitizedSearch}%,address.ilike.%${sanitizedSearch}%`
      )
    }
  }
  if (status) query = query.eq('status', status)
  if (type) query = query.eq('type', type)
  if (batch_year) query = query.eq('batch_year', batch_year)
  if (donor) query = query.ilike('donor', `%${donor}%`)
  if (supervisor) query = query.ilike('supervisor', `%${supervisor}%`)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  // Calculate total released per project
  const projectsWithTotals = ((data ?? []) as ProjectWithReleaseRows[]).map((project) => {
    const releases = project.payment_releases ?? []
    const totalReleased = releases
      .filter((r) => r.status === 'Released')
      .reduce((sum, r) => sum + (r.amount ?? 0), 0)

    return {
      ...project,
      total_released: totalReleased,
    }
  })

  return { data: projectsWithTotals, count: count ?? 0, page, pageSize }
}

export async function getProjectById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_phases(*), payment_releases(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
