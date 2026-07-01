import type { PaymentBatchInput } from '@/lib/validations/payment'

type CreatePaymentReleaseBatchInput = {
  input: PaymentBatchInput
  releasedBy: string
}

export function createPaymentReleaseBatch({ input, releasedBy }: CreatePaymentReleaseBatchInput) {
  return input.line_items.map((item) => ({
    project_id: item.project_id,
    check_number: input.check_number,
    voucher_number: input.voucher_number,
    amount: item.amount,
    status: input.status,
    notes: input.notes,
    released_date: input.released_date,
    released_at: input.released_date || null,
    released_by: releasedBy,
  }))
}
