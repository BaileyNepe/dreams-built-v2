import { z } from 'zod'

export const PaginationSchema = z.object({
  page: z.number().int(),
  perPage: z.number().int(),
  query: z.string().optional(),
})

export type Pagination = z.infer<typeof PaginationSchema>
