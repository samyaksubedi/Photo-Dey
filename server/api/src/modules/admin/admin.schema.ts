import { z } from 'zod';

const paginationSchema = z.object({
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const adminUsersQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).max(120).optional(),
});

export const adminEventsQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).max(120).optional(),
  status: z
    .enum(['CREATED', 'PROCESSING', 'COMPLETED', 'PARTIAL_FAILURE', 'FAILED'])
    .optional(),
});

export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;
export type AdminEventsQuery = z.infer<typeof adminEventsQuerySchema>;
