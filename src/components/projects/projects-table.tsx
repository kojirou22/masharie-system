'use client'

import type { KeyboardEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPHP } from '@/lib/utils/currency'
import type { Project } from '@/lib/types/database'

export type ProjectWithTotals = Project & {
  total_released: number
}

export function ProjectsTable({
  projects,
  total,
  page,
  currentSearch,
  currentStatus,
  currentType,
  currentBatchNumber,
  currentBatchYear,
}: {
  projects: ProjectWithTotals[]
  total: number
  page: number
  currentSearch: string
  currentStatus: string
  currentType: string
  currentBatchNumber: string
  currentBatchYear: string
}) {
  const router = useRouter()
  const pageSize = 25
  const totalPages = Math.ceil(total / pageSize)

  function pageHref(nextPage: number) {
    const params = new URLSearchParams()
    if (currentSearch) params.set('search', currentSearch)
    if (currentStatus) params.set('status', currentStatus)
    if (currentType) params.set('type', currentType)
    if (currentBatchNumber) params.set('batch_number', currentBatchNumber)
    if (currentBatchYear) params.set('batch_year', currentBatchYear)
    if (nextPage > 1) params.set('page', String(nextPage))

    const query = params.toString()
    return query ? `/projects?${query}` : '/projects'
  }

  function openProject(projectId: string) {
    router.push(`/projects/${projectId}`)
  }

  function handleProjectKeyDown(event: KeyboardEvent<HTMLTableRowElement>, projectId: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openProject(projectId)
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-100/60">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/95 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-950">Batch #</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Project #</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Supervisor</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Address</th>
              <th className="px-4 py-3 font-semibold text-slate-950">Type</th>
              <th className="px-4 py-3 font-semibold text-slate-950 text-right">Budget</th>
              <th className="px-4 py-3 font-semibold text-slate-950 text-right">Total Released</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => (
              <tr
                key={project.id}
                role="link"
                tabIndex={0}
                aria-label={`Open project ${project.project_number}`}
                className="cursor-pointer hover:bg-blue-50/60 transition-colors focus:outline-none focus-visible:bg-blue-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                onClick={() => openProject(project.id)}
                onKeyDown={(event) => handleProjectKeyDown(event, project.id)}
              >
                <td className="px-4 py-3 font-mono text-xs">{project.batch_number}</td>
                <td className="px-4 py-3 font-mono text-xs font-medium text-blue-700">{project.project_number}</td>
                <td className="px-4 py-3">{project.supervisor}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{project.address}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {project.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPHP(project.budget)}</td>
                <td className="px-4 py-3 text-right font-medium">
                  <span className={project.total_released > 0 ? 'text-green-700' : 'text-gray-400'}>
                    {formatPHP(project.total_released)}
                  </span>
                </td>
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
                href={pageHref(page - 1)}
                className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={pageHref(page + 1)}
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
