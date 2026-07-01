import { describe, expect, it } from 'vitest'

import { expenseBatchSchema } from './expense'
import { paymentBatchSchema } from './payment'

const PROJECT_A = '11111111-1111-4111-8111-111111111111'
const PROJECT_B = '22222222-2222-4222-8222-222222222222'

describe('payment batch validation', () => {
  it('accepts multiple unique project allocations with positive amounts', () => {
    const parsed = paymentBatchSchema.safeParse({
      check_number: 'CHK-1',
      voucher_number: 'VCH-1',
      status: 'Released',
      notes: null,
      released_date: '2026-06-30',
      line_items: [
        { project_id: PROJECT_A, amount: '1500.50' },
        { project_id: PROJECT_B, amount: '2500' },
      ],
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.line_items).toHaveLength(2)
      expect(parsed.data.line_items[0].amount).toBe(1500.5)
    }
  })

  it('rejects duplicate projects in one payment batch', () => {
    const parsed = paymentBatchSchema.safeParse({
      check_number: null,
      voucher_number: null,
      status: 'Released',
      notes: null,
      released_date: null,
      line_items: [
        { project_id: PROJECT_A, amount: '100' },
        { project_id: PROJECT_A, amount: '200' },
      ],
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.message)).toContain(
        'Each project can only appear once in the same payment',
      )
    }
  })
})

describe('expense batch validation', () => {
  it('accepts multiple expense purposes under shared release fields', () => {
    const parsed = expenseBatchSchema.safeParse({
      date: '2026-06-30',
      check_number: 'CHK-2',
      voucher_number: 'VCH-2',
      account_type: 'Expenses Account',
      status: 'Released',
      line_items: [
        { purpose: 'Fuel', requested_by: 'Operations', amount: '1000' },
        { purpose: 'Supplies', requested_by: 'Operations', amount: '500.25' },
      ],
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.line_items[1].amount).toBe(500.25)
    }
  })

  it('rejects empty purpose rows and non-positive amounts', () => {
    const parsed = expenseBatchSchema.safeParse({
      date: '2026-06-30',
      check_number: 'CHK-2',
      voucher_number: 'VCH-2',
      account_type: 'Expenses Account',
      status: 'Released',
      line_items: [{ purpose: '', requested_by: '', amount: '0' }],
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          'Every purpose is required',
          'Requested by is required for every purpose',
          'Every amount must be positive',
        ]),
      )
    }
  })
})
