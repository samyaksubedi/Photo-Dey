import { z } from 'zod';

export const getPublicEventSchema = z.object({
  publicCode: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
});

export type GetPublicEventInput = z.infer<typeof getPublicEventSchema>;
