'use client'

import type { KeyboardEvent, MouseEvent } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPHP } from '@/lib/utils/currency'
import { arabicTextClass, formatDate } from '@/lib/utils/formatters'
import type { PaymentRelease, Project, ProjectStatus } from '@/lib/types/database'

export type ProjectWithTotals = Project & {
  total_released: number
  payment_releases?: PaymentRelease[] | null
}

const headerCellClass =
  'sticky top-0 z-20 bg-slate-100 px-4 py-3 font-bold text-slate-950 shadow-[inset_0_-1px_0_rgba(148,163,184,0.35)]'

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    Pending: 'bg-amber-100 text-amber-800',
    'On Going': 'bg-blue-100 text-blue-800',
    'On Hold': 'bg-orange-100 text-orange-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
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
  const [selectedProject, setSelectedProject] = useState<ProjectWithTotals | null>(null)
  const pageSize = 25
  const totalPages = Math.ceil(total / pageSize)

  useEffect(() => {
    if (!selectedProject) return

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setSelectedProject(null)
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [selectedProject])

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

  function openProject(project: ProjectWithTotals) {
    setSelectedProject(project)
  }

  function handleProjectKeyDown(event: KeyboardEvent<HTMLTableRowElement>, project: ProjectWithTotals) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openProject(project)
    }
  }

  function closeDrawer(event?: MouseEvent) {
    event?.stopPropagation()
    setSelectedProject(null)
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm shadow-blue-100/60">
        <div className="border-b border-blue-100 bg-blue-50/60 px-4 py-2 text-xs font-medium text-blue-700 sm:hidden">
          Swipe horizontally to see budget and release totals.
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className={headerCellClass}>Batch #</th>
                <th className={headerCellClass}>Project #</th>
                <th className={headerCellClass}>Supervisor</th>
                <th className={headerCellClass}>Address</th>
                <th className={headerCellClass}>Type</th>
                <th className={`${headerCellClass} text-right`}>Budget</th>
                <th className={`${headerCellClass} text-right`}>Total Released</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`Open project ${project.project_number} details`}
                  className="cursor-pointer transition-colors hover:bg-blue-50/60 focus:outline-none focus-visible:bg-blue-50 focus-visible:[box-shadow:inset_3px_0_0_rgb(59_130_246)]"
                  onClick={() => openProject(project)}
                  onKeyDown={(event) => handleProjectKeyDown(event, project)}
                >
                  <td className="px-4 py-3 font-mono text-xs">{project.batch_number}</td>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-blue-700">{project.project_number}</td>
                  <td className={`px-4 py-3 ${arabicTextClass(project.supervisor)}`}>{project.supervisor}</td>
                  <td className={`max-w-[200px] truncate px-4 py-3 text-gray-600 ${arabicTextClass(project.address)}`}>{project.address}</td>
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
      </div>

      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <svg className="mb-3 h-12 w-12 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg font-medium">No projects match your filters</p>
          <Link href="/projects" className="mt-2 text-sm text-blue-700 hover:underline">Clear all filters</Link>
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
                className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={pageHref(page + 1)}
                className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}

      {selectedProject && (
        <ProjectDetailsDrawer project={selectedProject} onClose={closeDrawer} />
      )}
    </div>
  )
}

function ProjectDetailsDrawer({
  project,
  onClose,
}: {
  project: ProjectWithTotals
  onClose: (event?: MouseEvent) => void
}) {
  const budget = project.budget ?? 0
  const paymentReleases = project.payment_releases ?? []
  const released = project.total_released ?? 0
  const remaining = budget - released
  const progress = budget > 0 ? Math.round((released / budget) * 100) : 0
  const showMosqueFields = project.type === 'Mosque'

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="project-drawer-title">
      <button
        type="button"
        aria-label="Close project details"
        className="project-drawer-backdrop absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside className="project-drawer-panel absolute right-0 top-0 flex h-full w-full flex-col border-l border-blue-100 bg-white shadow-2xl shadow-slate-950/20 sm:w-1/2 sm:rounded-l-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-blue-100 px-5 py-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Project Number</p>
            <h2 id="project-drawer-title" className="font-mono text-2xl font-black tracking-tight text-slate-950">
              {project.project_number}
            </h2>
            <p className={`mt-2 text-lg font-bold leading-7 text-slate-950 ${arabicTextClass(project.address)}`}>{project.address || '—'}</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {project.type}
            </span>
          </div>

          <section className="rounded-3xl border border-blue-100 bg-white/90 p-4 shadow-sm shadow-blue-100/60">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-950">Project Details</h3>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <InfoField label="Name" value={project.name} />
              <InfoField label="Donor" value={project.donor} />
              <InfoField label="Supervisor" value={project.supervisor} />
              <InfoField label="Batch" value={`${project.batch_number} (${project.batch_year})`} />
              <InfoField label="Address" value={project.address} wide />
              {showMosqueFields && <InfoField label="Size" value={project.size ?? '—'} />}
              {showMosqueFields && <InfoField label="Has Tank" value={project.has_tank ? 'Yes' : 'No'} />}
              {project.area_sqm !== null && <InfoField label="Area" value={`${project.area_sqm} sqm`} />}
            </div>
          </section>

          <section className="rounded-3xl border border-blue-100 bg-white/90 p-4 shadow-sm shadow-blue-100/60">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-950">Funding Progress</h3>
            <div className="mb-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-black text-slate-950">{formatPHP(released)}</p>
                <p className="text-sm font-medium text-slate-600">released of {formatPHP(budget)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-700">{progress}%</p>
                <p className="text-sm font-medium text-slate-600">{formatPHP(remaining)} remaining</p>
              </div>
            </div>
            <div className="h-3 w-full rounded-full bg-blue-100">
              <div
                className="h-3 rounded-full bg-blue-600 transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-blue-100 bg-white/90 p-4 shadow-sm shadow-blue-100/60">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-950">Payment Releases</h3>
            {paymentReleases.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-blue-100">
                <div className="max-h-72 overflow-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="sticky top-0 z-10 bg-slate-100 px-3 py-2 font-bold text-slate-950">Check #</th>
                        <th className="sticky top-0 z-10 bg-slate-100 px-3 py-2 font-bold text-slate-950">Voucher #</th>
                        <th className="sticky top-0 z-10 bg-slate-100 px-3 py-2 text-right font-bold text-slate-950">Amount</th>
                        <th className="sticky top-0 z-10 bg-slate-100 px-3 py-2 font-bold text-slate-950">Status</th>
                        <th className="sticky top-0 z-10 bg-slate-100 px-3 py-2 font-bold text-slate-950">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paymentReleases.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-3 py-2 font-mono text-xs">{payment.check_number ?? '—'}</td>
                          <td className="px-3 py-2 font-mono text-xs">{payment.voucher_number ?? '—'}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatPHP(payment.amount)}</td>
                          <td className="px-3 py-2 text-xs font-medium">{payment.status}</td>
                          <td className="px-3 py-2 text-xs font-medium text-slate-600">
                            {formatDate(payment.released_at ?? payment.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-600">No payment releases yet.</p>
            )}
          </section>
        </div>

        <div className="border-t border-blue-100 px-5 py-4">
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Open full project page
          </Link>
        </div>
      </aside>
    </div>
  )
}

function InfoField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl border border-blue-100 bg-slate-50/80 p-3 ${wide ? 'sm:col-span-2' : ''}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{label}</p>
      <p className={`mt-1 break-words text-sm font-semibold leading-6 text-slate-950 ${arabicTextClass(value)}`}>{value || '—'}</p>
    </div>
  )
}
