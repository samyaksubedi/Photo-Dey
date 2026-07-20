import { z } from 'zod';
import { EventStatus, PhotoStatus } from '../../generated/prisma/enums.js';

export const updateEventSchema = z.object({
  eventId: z.uuid(),
  processingPhotos: z.number().optional(),
  completedPhotos: z.number().optional(),
  failedPhotos: z.number().optional(),
  status: z.nativeEnum(EventStatus).optional(),
});
// export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const updatePhotoSchema = z.object({
  photoId: z.uuid(),
  status: z.nativeEnum(PhotoStatus),
});
// export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;
