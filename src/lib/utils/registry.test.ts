import { describe, expect, it } from 'vitest'

import { buildPaginationRange, parsePage, parseSort, sanitizeSearch } from './registry'

describe('registry primitives', () => {
  it('parses invalid pages to page 1', () => {
    expect(parsePage(undefined)).toBe(1)
    expect(parsePage('')).toBe(1)
    expect(parsePage('0')).toBe(1)
    expect(parsePage('-4')).toBe(1)
    expect(parsePage('abc')).toBe(1)
  })

  it('parses positive integer pages', () => {
    expect(parsePage('3')).toBe(3)
    expect(parsePage(['5'])).toBe(5)
  })

  it('sanitizes search text by trimming and collapsing whitespace', () => {
    expect(sanitizeSearch('  masjid   project  ')).toBe('masjid project')
    expect(sanitizeSearch([' first ', 'ignored'])).toBe('first')
    expect(sanitizeSearch(undefined)).toBe('')
  })

  it('accepts only allowed sort fields and directions', () => {
    const result = parseSort({
      sort: 'amount',
      direction: 'asc',
      allowedSorts: ['date', 'amount'],
      defaultSort: 'date',
    })

    expect(result).toEqual({ sort: 'amount', ascending: true })
  })

  it('falls back when sort field or direction is invalid', () => {
    const result = parseSort({
      sort: 'drop table',
      direction: 'sideways',
      allowedSorts: ['date', 'amount'],
      defaultSort: 'date',
      defaultDirection: 'desc',
    })

    expect(result).toEqual({ sort: 'date', ascending: false })
  })

  it('builds compact pagination ranges with edge pages', () => {
    expect(buildPaginationRange({ currentPage: 1, totalPages: 1 })).toEqual([1])
    expect(buildPaginationRange({ currentPage: 1, totalPages: 11 })).toEqual([1, 2, 3, 11])
    expect(buildPaginationRange({ currentPage: 6, totalPages: 11 })).toEqual([1, 5, 6, 7, 11])
    expect(buildPaginationRange({ currentPage: 11, totalPages: 11 })).toEqual([1, 9, 10, 11])
  })
})
