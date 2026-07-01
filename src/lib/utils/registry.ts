export function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number.parseInt(raw ?? '', 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export function sanitizeSearch(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value

  return (raw ?? '').trim().replace(/\s+/g, ' ')
}

type ParseSortInput<TSort extends string> = {
  allowedSorts: readonly TSort[]
  defaultDirection?: 'asc' | 'desc'
  defaultSort: TSort
  direction?: string | string[]
  sort?: string | string[]
}

export function parseSort<TSort extends string>({
  allowedSorts,
  defaultDirection = 'desc',
  defaultSort,
  direction,
  sort,
}: ParseSortInput<TSort>) {
  const rawSort = Array.isArray(sort) ? sort[0] : sort
  const rawDirection = Array.isArray(direction) ? direction[0] : direction
  const selectedSort = allowedSorts.includes(rawSort as TSort) ? (rawSort as TSort) : defaultSort
  const selectedDirection = rawDirection === 'asc' || rawDirection === 'desc' ? rawDirection : defaultDirection

  return {
    sort: selectedSort,
    ascending: selectedDirection === 'asc',
  }
}

type PaginationRangeInput = {
  currentPage: number
  totalPages: number
}

export function buildPaginationRange({ currentPage, totalPages }: PaginationRangeInput) {
  const safeTotal = Math.max(1, Math.floor(totalPages))
  const safeCurrent = Math.min(Math.max(1, Math.floor(currentPage)), safeTotal)
  const pages = new Set<number>([1, safeTotal])
  const windowStart = safeCurrent <= 2 ? 1 : safeCurrent >= safeTotal - 1 ? safeTotal - 2 : safeCurrent - 1
  const windowEnd = safeCurrent <= 2 ? 3 : safeCurrent >= safeTotal - 1 ? safeTotal : safeCurrent + 1

  for (let page = windowStart; page <= windowEnd; page += 1) {
    if (page >= 1 && page <= safeTotal) {
      pages.add(page)
    }
  }

  return Array.from(pages).sort((a, b) => a - b)
}
