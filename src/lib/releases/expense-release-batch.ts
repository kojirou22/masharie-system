import type { ExpenseBatchInput } from '@/lib/validations/expense'

type CreateExpenseReleaseBatchInput = {
  createdBy: string
  input: ExpenseBatchInput
}

export function createExpenseReleaseBatch({ createdBy, input }: CreateExpenseReleaseBatchInput) {
  return input.line_items.map((item) => ({
    date: input.date,
    check_number: input.check_number,
    voucher_number: input.voucher_number,
    amount: item.amount,
    purpose: item.purpose,
    requested_by: item.requested_by,
    account_type: input.account_type,
    status: input.status,
    created_by: createdBy,
  }))
}
