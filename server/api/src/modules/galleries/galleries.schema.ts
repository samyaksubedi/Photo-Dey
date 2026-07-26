import { z } from 'zod';

export const getGallerySchema = z.object({
  searchRequestId: z.uuid(),
});
export type GetGalleryInput = z.infer<typeof getGallerySchema>;
