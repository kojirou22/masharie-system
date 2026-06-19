import { z } from 'zod'

export const expenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  check_number: z.string().min(1, 'Check number is required'),
  voucher_number: z.string().min(1, 'Voucher number is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  purpose: z.string().min(1, 'Purpose is required'),
  requested_by: z.string().min(1, 'Requested by is required'),
  account_type: z.enum(['Project Account', 'Expenses Account', 'Savings Account']),
  status: z.enum(['Released', 'Cancelled']),
})

export type ExpenseInput = z.infer<typeof expenseSchema>
