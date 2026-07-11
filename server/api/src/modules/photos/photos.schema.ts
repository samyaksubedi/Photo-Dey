import { uuid, z } from 'zod';

export const getPhotoSchema = z.object({
  photoId: uuid(),
});
export type GetPhotoInput = z.infer<typeof getPhotoSchema>;
export const getPhotosSchema = z.object({
  eventId: uuid(),
});
export type GetPhotosInput = z.infer<typeof getPhotosSchema>;
export const deletePhotoSchema = z.object({
  photoId: uuid(),
});
export type DeletePhotoInput = z.infer<typeof deletePhotoSchema>;
