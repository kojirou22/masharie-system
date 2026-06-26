'use client'

import type { KeyboardEvent, MouseEvent } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  RegistryEmptyState,
  RegistryPaginationFooter,
  RegistrySortIcon,
  RegistryTableShell,
  registryHeaderCellClass,
} from '@/components/registry'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatPHP } from '@/lib/utils/currency'
import { arabicTextClass, formatDate } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'
import type { PaymentRelease, Project } from '@/lib/types/database'

export type ProjectWithTotals = Project & {
  total_released: number
  payment_releases?: PaymentRelease[] | null
}

function SortIcon({ active, direction }: { active: boolean; direction: string }) {
  return <RegistrySortIcon active={active} direction={direction} />
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
  currentSort,
  currentDir,
}: {
  projects: ProjectWithTotals[]
  total: number
  page: number
  currentSearch: string
  currentStatus: string
  currentType: string
  currentBatchNumber: string
  currentBatchYear: string
  currentSort: string
  currentDir: string
}) {
  const [selectedProject, setSelectedProject] = useState<ProjectWithTotals | null>(null)
  const pageSize = 25
  const releasedTone = (value: number) => (value > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground/70')

  useEffect(() => {
    if (!selectedProject) return

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setSelectedProject(null)
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [selectedProject])

  function baseParams() {
    const params = new URLSearchParams()
    if (currentSearch) params.set('search', currentSearch)
    if (currentStatus) params.set('status', currentStatus)
    if (currentType) params.set('type', currentType)
    if (currentBatchNumber) params.set('batch_number', currentBatchNumber)
    if (currentBatchYear) params.set('batch_year', currentBatchYear)
    return params
  }

  function pageHref(nextPage: number) {
    const params = baseParams()
    if (currentSort && currentDir) {
      params.set('sort', currentSort)
      params.set('dir', currentDir)
    }
    if (nextPage > 1) params.set('page', String(nextPage))

    const query = params.toString()
    return query ? `/projects?${query}` : '/projects'
  }

  function sortHref(column: string) {
    const params = baseParams()

    if (currentSort !== column) {
      params.set('sort', column)
      params.set('dir', 'asc')
    } else if (currentDir === 'asc') {
      params.set('sort', column)
      params.set('dir', 'desc')
    }

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
      <RegistryTableShell
        hint="Click a row to view project details."
        mobileHint="Swipe horizontally to see budget and release totals."
        minWidth="920px"
      >
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className={registryHeaderCellClass}>
                  <Link href={sortHref('batch_number')} className="inline-flex items-center gap-1 hover:text-primary">
                    Batch #
                    <SortIcon active={currentSort === 'batch_number'} direction={currentDir} />
                  </Link>
                </th>
                <th className={registryHeaderCellClass}>
                  <Link href={sortHref('project_number')} className="inline-flex items-center gap-1 hover:text-primary">
                    Project #
                    <SortIcon active={currentSort === 'project_number'} direction={currentDir} />
                  </Link>
                </th>
                <th className={registryHeaderCellClass}>
                  <Link href={sortHref('supervisor')} className="inline-flex items-center gap-1 hover:text-primary">
                    Supervisor
                    <SortIcon active={currentSort === 'supervisor'} direction={currentDir} />
                  </Link>
                </th>
                <th className={registryHeaderCellClass}>
                  <Link href={sortHref('address')} className="inline-flex items-center gap-1 hover:text-primary">
                    Address
                    <SortIcon active={currentSort === 'address'} direction={currentDir} />
                  </Link>
                </th>
                <th className={registryHeaderCellClass}>
                  <Link href={sortHref('type')} className="inline-flex items-center gap-1 hover:text-primary">
                    Type
                    <SortIcon active={currentSort === 'type'} direction={currentDir} />
                  </Link>
                </th>
                <th className={`${registryHeaderCellClass} text-right`}>
                  <Link href={sortHref('budget')} className="inline-flex items-center justify-end gap-1 hover:text-primary">
                    Budget
                    <SortIcon active={currentSort === 'budget'} direction={currentDir} />
                  </Link>
                </th>
                <th className={`${registryHeaderCellClass} text-right`}>Total Released</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`Open project ${project.project_number} details`}
                  className="group cursor-pointer transition-colors hover:bg-muted/50 focus:outline-none focus-visible:bg-muted focus-visible:[box-shadow:inset_3px_0_0_var(--ring)]"
                  onClick={() => openProject(project)}
                  onKeyDown={(event) => handleProjectKeyDown(event, project)}
                >
                  <td className="px-4 py-3 font-mono text-xs">{project.batch_number}</td>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{project.project_number}</td>
                  <td className={`px-4 py-3 ${arabicTextClass(project.supervisor)}`}>{project.supervisor}</td>
                  <td className={`max-w-[200px] truncate px-4 py-3 text-muted-foreground ${arabicTextClass(project.address)}`}>{project.address}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {project.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatPHP(project.budget)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    <span className={cn('inline-flex items-center justify-end gap-1', releasedTone(project.total_released))}>
                      {formatPHP(project.total_released)}
                      <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60 group-focus-visible:opacity-60" aria-hidden="true" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
      </RegistryTableShell>

      {total === 0 && (
        <RegistryEmptyState clearHref="/projects" message="No projects match your filters" />
      )}

      <RegistryPaginationFooter currentPage={page} total={total} pageSize={pageSize} buildHref={pageHref} />

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
      <aside className="project-drawer-panel absolute right-0 top-0 flex h-full w-full flex-col border-l border-border bg-card text-card-foreground shadow-2xl shadow-slate-950/20 sm:w-1/2 sm:rounded-l-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Project Number</p>
            <h2 id="project-drawer-title" className="font-mono text-2xl font-black tracking-tight text-foreground">
              {project.project_number}
            </h2>
            <p className={`mt-2 text-lg font-bold leading-7 text-foreground ${arabicTextClass(project.address)}`}>{project.address || '—'}</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-primary shadow-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {project.type}
            </span>
          </div>

          <section className="rounded-3xl border border-border bg-background/60 p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">Project Details</h3>
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

          <section className="rounded-3xl border border-border bg-background/60 p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">Funding Progress</h3>
            <div className="mb-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-black text-foreground">{formatPHP(released)}</p>
                <p className="text-sm font-medium text-muted-foreground">released of {formatPHP(budget)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{progress}%</p>
                <p className="text-sm font-medium text-muted-foreground">{formatPHP(remaining)} remaining</p>
              </div>
            </div>
            <div className="h-3 w-full rounded-full bg-muted">
              <div
                className="h-3 rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background/60 p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">Payment Releases</h3>
            {paymentReleases.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="max-h-72 overflow-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="sticky top-0 z-10 bg-muted px-3 py-2 font-semibold text-foreground">Check #</th>
                        <th className="sticky top-0 z-10 bg-muted px-3 py-2 font-semibold text-foreground">Voucher #</th>
                        <th className="sticky top-0 z-10 bg-muted px-3 py-2 text-right font-semibold text-foreground">Amount</th>
                        <th className="sticky top-0 z-10 bg-muted px-3 py-2 font-semibold text-foreground">Status</th>
                        <th className="sticky top-0 z-10 bg-muted px-3 py-2 font-semibold text-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/70">
                      {paymentReleases.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-3 py-2 font-mono text-xs">{payment.check_number ?? '—'}</td>
                          <td className="px-3 py-2 font-mono text-xs">{payment.voucher_number ?? '—'}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatPHP(payment.amount)}</td>
                          <td className="px-3 py-2 text-xs font-medium">{payment.status}</td>
                          <td className="px-3 py-2 text-xs font-medium text-muted-foreground">
                            {formatDate(payment.released_at ?? payment.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-muted-foreground">No payment releases yet.</p>
            )}
          </section>
        </div>

        <div className="border-t border-border px-5 py-4">
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring/50"
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
    <div className={`rounded-2xl border border-border bg-muted/35 p-3 ${wide ? 'sm:col-span-2' : ''}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 break-words text-sm font-semibold leading-6 text-foreground ${arabicTextClass(value)}`}>{value || '—'}</p>
    </div>
  )
}
