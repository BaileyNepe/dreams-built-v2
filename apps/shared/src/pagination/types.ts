import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.number().min(1).catch(1),
  perPage: z.number().min(1).catch(100),
  query: z.string().optional()
});

export type Pagination = z.infer<typeof PaginationSchema>;
