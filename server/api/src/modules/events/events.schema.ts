import { string, uuid, z } from 'zod';

export const createEventSchema = z.object({
  name: string(),
});
export type CreateEventBody = z.infer<typeof createEventSchema>;

export const getEventSchema = z.object({
  eventId: uuid(),
});
export type GetEventInput = z.infer<typeof getEventSchema>;

export const deleteEventSchema = z.object({
  eventId: uuid(),
});
export type DeleteEventInput = z.infer<typeof deleteEventSchema>;

export const getStatusSchema = z.object({
  eventId: uuid(),
});
export type GetStatusInput = z.infer<typeof getStatusSchema>;
