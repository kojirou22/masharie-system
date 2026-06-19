import Link from 'next/link'
import { Suspense } from 'react'
import { getProjects } from '@/lib/supabase/queries/projects'
import { formatPHP } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/formatters'
import type { Project, ProjectStatus, ProjectType } from '@/lib/types/database'

export const revalidate = 3600

const STATUS_OPTIONS: ProjectStatus[] = ['Pending', 'On Going', 'On Hold', 'Completed', 'Cancelled']
const TYPE_OPTIONS: ProjectType[] = ['Mosque', 'House', 'Store', 'School Room', 'Tank', 'Well', 'School', 'Food Aid', 'Markaz']

function ProjectsTable({ projects, total, page }: { projects: Project[]; total: number; page: number }) {
  const pageSize = 25
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-100/60">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/95 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-950">Project #</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Name</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Donor</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Type</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-950 text-right">Budget</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-blue-50/60 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700">{project.project_number}</td>
                <td className="px-4 py-3 font-medium">
                  <Link href={`/projects/${project.id}`} className="text-blue-700 hover:text-slate-950 hover:underline">
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{project.donor}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {project.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPHP(project.budget)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(project.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <svg className="w-12 h-12 mb-3 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg font-medium">No projects match your filters</p>
          <Link href="/projects" className="mt-2 text-blue-700 hover:underline text-sm">Clear all filters</Link>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/projects?page=${page - 1}`}
                className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/projects?page=${page + 1}`}
                className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    'Pending': 'bg-amber-100 text-amber-800',
    'On Going': 'bg-blue-100 text-blue-800',
    'On Hold': 'bg-orange-100 text-orange-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

function FilterBar({ currentSearch, currentStatus, currentType }: { currentSearch: string; currentStatus: string; currentType: string }) {
  return (
    <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-blue-100 bg-white/85 p-4 shadow-sm shadow-blue-100/60">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="search" className="block text-xs font-medium text-blue-700 mb-1">Search</label>
        <input
          id="search"
          name="search"
          type="text"
          defaultValue={currentSearch}
          placeholder="Project #, name, donor, supervisor..."
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
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
      >
        Filter
      </button>
    </form>
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
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1

  const { data: projects, count: total } = await getProjects({
    search,
    status: status as ProjectStatus | undefined,
    type: type as ProjectType | undefined,
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
        <FilterBar currentSearch={search} currentStatus={status} currentType={type} />
      </div>

      <Suspense fallback={<div className="animate-pulse py-16 text-center text-blue-400">Loading projects...</div>}>
        <ProjectsTable projects={projects} total={total} page={page} />
      </Suspense>
    </div>
  )
}
