import { Suspense } from 'react'
import { AutoFilterForm } from '@/components/auto-filter-form'
import { ProjectsTable } from '@/components/projects/projects-table'
import { getProjects } from '@/lib/supabase/queries/projects'
import type { ProjectStatus, ProjectType } from '@/lib/types/database'

export const revalidate = 3600

const STATUS_OPTIONS: ProjectStatus[] = ['Pending', 'On Going', 'On Hold', 'Completed', 'Cancelled']
const TYPE_OPTIONS: ProjectType[] = ['Mosque', 'House', 'Store', 'School Room', 'Tank', 'Well', 'School', 'Food Aid', 'Markaz']

function FilterBar({
  currentSearch,
  currentStatus,
  currentType,
  currentBatchNumber,
  currentBatchYear,
}: {
  currentSearch: string
  currentStatus: string
  currentType: string
  currentBatchNumber: string
  currentBatchYear: string
}) {
  return (
    <AutoFilterForm action="/projects" className="flex flex-wrap items-end gap-3 rounded-2xl border border-blue-100 bg-white/85 p-4 shadow-sm shadow-blue-100/60">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="search" className="block text-xs font-medium text-blue-700 mb-1">Search</label>
        <input
          id="search"
          name="search"
          type="text"
          defaultValue={currentSearch}
          placeholder="Project #, name, donor, supervisor, address..."
          className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-xs font-medium text-blue-700 mb-1">Status</label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="type" className="block text-xs font-medium text-blue-700 mb-1">Type</label>
        <select
          id="type"
          name="type"
          defaultValue={currentType}
          className="rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="batch_number" className="block text-xs font-medium text-blue-700 mb-1">Batch #</label>
        <input
          id="batch_number"
          name="batch_number"
          type="text"
          defaultValue={currentBatchNumber}
          placeholder="1"
          className="w-24 rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="batch_year" className="block text-xs font-medium text-blue-700 mb-1">Year</label>
        <input
          id="batch_year"
          name="batch_year"
          type="number"
          defaultValue={currentBatchYear}
          placeholder="2026"
          className="w-28 rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </AutoFilterForm>
  )
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : ''
  const status = typeof params.status === 'string' ? params.status : ''
  const type = typeof params.type === 'string' ? params.type : ''
  const batch_number = typeof params.batch_number === 'string' ? params.batch_number : ''
  const batch_year = typeof params.batch_year === 'string' ? params.batch_year : ''
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1

  const { data: projects, count: total } = await getProjects({
    search,
    status: status as ProjectStatus | undefined,
    type: type as ProjectType | undefined,
    batch_number,
    batch_year: batch_year ? parseInt(batch_year) || undefined : undefined,
    page,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-950 font-[family-name:var(--font-fira-code)]">
          Projects
        </h1>
        <span className="text-sm text-gray-500">{total} total projects</span>
      </div>

      <div className="mb-6">
        <FilterBar
          currentSearch={search}
          currentStatus={status}
          currentType={type}
          currentBatchNumber={batch_number}
          currentBatchYear={batch_year}
        />
      </div>

      <Suspense fallback={<div className="animate-pulse py-16 text-center text-blue-400">Loading projects...</div>}>
        <ProjectsTable
          projects={projects}
          total={total}
          page={page}
          currentSearch={search}
          currentStatus={status}
          currentType={type}
          currentBatchNumber={batch_number}
          currentBatchYear={batch_year}
        />
      </Suspense>
    </div>
  )
}
