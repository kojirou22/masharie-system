import { z } from 'zod'

export const paymentSchema = z.object({
  project_id: z.string().uuid('Invalid project'),
  check_number: z.string().optional().nullable(),
  voucher_number: z.string().optional().nullable(),
  amount: z.coerce.number().positive('Amount must be positive'),
  status: z.enum(['Pending', 'Released', 'Cancelled']),
  notes: z.string().optional().nullable(),
  released_date: z.string().date().optional().nullable(),
})

export const paymentLineSchema = z.object({
  project_id: z.string().uuid('Select a valid project for every line'),
  amount: z.coerce.number().positive('Every amount must be positive'),
})

export const paymentBatchSchema = z.object({
  check_number: z.string().optional().nullable(),
  voucher_number: z.string().optional().nullable(),
  status: z.enum(['Pending', 'Released', 'Cancelled']),
  notes: z.string().optional().nullable(),
  released_date: z.string().date().optional().nullable(),
  line_items: z.array(paymentLineSchema).min(1, 'Add at least one project allocation'),
}).superRefine((data, ctx) => {
  const seenProjectIds = new Set<string>()

  data.line_items.forEach((item, index) => {
    if (seenProjectIds.has(item.project_id)) {
      ctx.addIssue({
        code: 'custom',
        path: ['line_items', index, 'project_id'],
        message: 'Each project can only appear once in the same payment',
      })
    }

    seenProjectIds.add(item.project_id)
  })
})

export type PaymentInput = z.infer<typeof paymentSchema>
export type PaymentBatchInput = z.infer<typeof paymentBatchSchema>
