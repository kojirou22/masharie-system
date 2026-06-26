import Link from 'next/link'

import { cn } from '@/lib/utils'

type PageItem = number | 'ellipsis'

type PaginationProps = {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
}

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages])
  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page > 1 && page < totalPages) pages.add(page)
  }

  const sortedPages = [...pages].sort((a, b) => a - b)
  const items: PageItem[] = []

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1]
    if (previousPage && page - previousPage > 1) {
      items.push('ellipsis')
    }
    items.push(page)
  })

  return items
}

const pageLinkClass =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring/50'

export function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null

  const pageItems = getPageItems(currentPage, totalPages)

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-end gap-1.5">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className={cn(pageLinkClass, 'bg-background text-foreground hover:bg-muted')}
        >
          Previous
        </Link>
      )}
      {pageItems.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
            aria-current={item === currentPage ? 'page' : undefined}
            className={cn(
              pageLinkClass,
              item === currentPage
                ? 'border-primary bg-primary text-primary-foreground shadow-primary/20'
                : 'bg-background text-foreground hover:bg-muted'
            )}
          >
            {item}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className={cn(pageLinkClass, 'bg-background text-foreground hover:bg-muted')}
        >
          Next
        </Link>
      )}
    </nav>
  )
}
