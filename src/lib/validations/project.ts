import { z } from 'zod'

export const projectSchema = z.object({
  project_number: z.string().min(1, 'Project number is required'),
  name: z.string().min(1, 'Name is required'),
  donor: z.string().min(1, 'Donor is required'),
  type: z.enum(['Mosque', 'House', 'Store', 'School Room', 'Tank', 'Well', 'School', 'Food Aid', 'Markaz']),
  area_sqm: z.coerce.number().nonnegative().optional().nullable(),
  supervisor: z.string().min(1, 'Supervisor is required'),
  address: z.string().min(1, 'Address is required'),
  batch_number: z.string().min(1, 'Batch number is required'),
  batch_year: z.coerce.number().int().min(2000).max(2100),
  budget: z.coerce.number().nonnegative('Budget must be non-negative'),
  status: z.enum(['Pending', 'On Going', 'On Hold', 'Completed', 'Cancelled']),
  has_tank: z.boolean().default(false),
  size: z.string().optional().nullable(),
})

export type ProjectInput = z.infer<typeof projectSchema>
