import { z } from 'zod'

export const paymentSchema = z.object({
  project_id: z.string().uuid('Invalid project'),
  check_number: z.string().optional().nullable(),
  voucher_number: z.string().optional().nullable(),
  amount: z.coerce.number().positive('Amount must be positive'),
  status: z.enum(['Pending', 'Released', 'Cancelled']),
  notes: z.string().optional().nullable(),
  released_date: z.string().optional().nullable(),
})

export type PaymentInput = z.infer<typeof paymentSchema>
