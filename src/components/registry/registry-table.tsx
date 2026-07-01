import type { ReactNode } from 'react'
import Link from 'next/link'

import { Pagination } from '@/components/pagination'
import { Surface } from '@/components/ui/surface'
import { cn } from '@/lib/utils'

export const registryHeaderCellClass =
  'sticky top-0 z-20 bg-muted px-4 py-3 font-semibold text-foreground shadow-[inset_0_-1px_0_rgba(148,163,184,0.35)] dark:shadow-[inset_0_-1px_0_rgba(30,58,95,0.9)]'

export function RegistrySortIcon({ active, direction }: { active: boolean; direction: string }) {
  if (!active) {
    return <span className="ml-1 text-muted-foreground/70" aria-hidden="true">↕</span>
  }

  return (
    <span className="ml-1 text-foreground" aria-hidden="true">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  )
}

export function RegistryTableShell({
  children,
  className,
  hint,
  mobileCards,
  mobileHint,
  minWidth = '900px',
  tableClassName,
}: {
  children: ReactNode
  className?: string
  hint?: ReactNode
  mobileCards?: ReactNode
  mobileHint?: ReactNode
  minWidth?: string
  tableClassName?: string
}) {
  const hasMobileCards = Array.isArray(mobileCards) ? mobileCards.length > 0 : Boolean(mobileCards)

  return (
    <Surface className={cn('overflow-hidden', className)}>
      {(hint || mobileHint) && (
        <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
          {mobileHint && <span className="sm:hidden">{mobileHint}</span>}
          {hint && <span className={mobileHint ? 'hidden sm:inline' : undefined}>{hint}</span>}
        </div>
      )}
      {hasMobileCards && <div className="grid gap-3 p-3 sm:hidden">{mobileCards}</div>}
      <div className={cn('max-h-[calc(100vh-10rem)] overflow-auto', hasMobileCards && 'hidden sm:block')}>
        <table className={cn('w-full text-sm', tableClassName)} style={{ minWidth }}>
          {children}
        </table>
      </div>
    </Surface>
  )
}

export function RegistryPaginationFooter({
  buildHref,
  currentPage,
  pageSize = 25,
  total,
}: {
  currentPage: number
  total: number
  buildHref: (page: number) => string
  pageSize?: number
}) {
  const totalPages = Math.ceil(total / pageSize)

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col gap-3 px-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} of {total}
      </p>
      <Pagination currentPage={currentPage} totalPages={totalPages} buildHref={buildHref} />
    </div>
  )
}

export function RegistryEmptyState({
  clearHref,
  message,
}: {
  message: string
  clearHref: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 py-16 text-center text-muted-foreground">
      <p className="text-lg font-medium text-foreground">{message}</p>
      <Link href={clearHref} className="mt-2 text-sm font-medium text-primary hover:underline">
        Clear all filters
      </Link>
    </div>
  )
}
