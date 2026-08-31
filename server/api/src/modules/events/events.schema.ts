import { z } from 'zod';
import { MAX_EVENT_PHOTOS } from './event-upload.util.js';

export const createEventSchema = z.object({
  name: z.string().trim().min(1).max(160),
  expectedTotalPhotos: z.number().int().min(1).max(MAX_EVENT_PHOTOS),
});
export type CreateEventBody = z.infer<typeof createEventSchema>;

export const uploadPhotoBatchSchema = z.object({
  clientBatchId: z.uuid(),
});
export type UploadPhotoBatchBody = z.infer<typeof uploadPhotoBatchSchema>;

export const getEventSchema = z.object({
  eventId: z.uuid(),
});
export type GetEventInput = z.infer<typeof getEventSchema>;

export const deleteEventSchema = z.object({
  eventId: z.uuid(),
});
export type DeleteEventInput = z.infer<typeof deleteEventSchema>;

export const getStatusSchema = z.object({
  eventId: z.uuid(),
});
export type GetStatusInput = z.infer<typeof getStatusSchema>;

export const updatePublicAccessSchema = z.object({
  publicEnabled: z.boolean(),
});
export type UpdatePublicAccessBody = z.infer<
  typeof updatePublicAccessSchema
>;
