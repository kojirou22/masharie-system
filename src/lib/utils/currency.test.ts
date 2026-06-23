import { describe, expect, it } from 'vitest'
import { formatPHP } from './currency'

describe('formatPHP', () => {
  it('formats Philippine Peso amounts and blank values', () => {
    expect(formatPHP(1234)).toBe('\u20b11,234.00')
    expect(formatPHP(null)).toBe('\u2014')
  })
})
