import { describe, expect, it } from 'vitest'

import { createExpenseReleaseBatch } from './expense-release-batch'
import { createPaymentReleaseBatch } from './payment-release-batch'

const PROJECT_A = '11111111-1111-4111-8111-111111111111'
const PROJECT_B = '22222222-2222-4222-8222-222222222222'
const USER_ID = '33333333-3333-4333-8333-333333333333'

describe('createPaymentReleaseBatch', () => {
  it('maps one shared payment release into one row per project allocation', () => {
    const rows = createPaymentReleaseBatch({
      input: {
        check_number: 'CHK-10',
        voucher_number: 'VCH-10',
        status: 'Released',
        notes: 'June release',
        released_date: '2026-06-30',
        line_items: [
          { project_id: PROJECT_A, amount: 1000 },
          { project_id: PROJECT_B, amount: 2000 },
        ],
      },
      releasedBy: USER_ID,
    })

    expect(rows).toEqual([
      {
        project_id: PROJECT_A,
        check_number: 'CHK-10',
        voucher_number: 'VCH-10',
        amount: 1000,
        status: 'Released',
        notes: 'June release',
        released_date: '2026-06-30',
        released_at: '2026-06-30',
        released_by: USER_ID,
      },
      {
        project_id: PROJECT_B,
        check_number: 'CHK-10',
        voucher_number: 'VCH-10',
        amount: 2000,
        status: 'Released',
        notes: 'June release',
        released_date: '2026-06-30',
        released_at: '2026-06-30',
        released_by: USER_ID,
      },
    ])
  })
})

describe('createExpenseReleaseBatch', () => {
  it('maps one shared expense release into one row per expense purpose', () => {
    const rows = createExpenseReleaseBatch({
      input: {
        date: '2026-06-30',
        check_number: 'CHK-20',
        voucher_number: 'VCH-20',
        account_type: 'Expenses Account',
        status: 'Released',
        line_items: [
          { purpose: 'Fuel', requested_by: 'Ops', amount: 300 },
          { purpose: 'Supplies', requested_by: 'Ops', amount: 400 },
        ],
      },
      createdBy: USER_ID,
    })

    expect(rows).toEqual([
      {
        date: '2026-06-30',
        check_number: 'CHK-20',
        voucher_number: 'VCH-20',
        amount: 300,
        purpose: 'Fuel',
        requested_by: 'Ops',
        account_type: 'Expenses Account',
        status: 'Released',
        created_by: USER_ID,
      },
      {
        date: '2026-06-30',
        check_number: 'CHK-20',
        voucher_number: 'VCH-20',
        amount: 400,
        purpose: 'Supplies',
        requested_by: 'Ops',
        account_type: 'Expenses Account',
        status: 'Released',
        created_by: USER_ID,
      },
    ])
  })
})
