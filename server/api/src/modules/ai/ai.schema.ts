import { z } from 'zod';
import {
  PhotoStatus,
  SearchRequestStatus,
} from '../../generated/prisma/enums.js';

export const handlePhotoStatusChangedSchema = z.object({
  photoId: z.uuid(),
  status: z.nativeEnum(PhotoStatus),
});

export type HandlePhotoStatusChangedInput = z.infer<
  typeof handlePhotoStatusChangedSchema
>;

const matchedPhotoMetadataSchema = z.object({
  photoId: z.uuid(),
  confidence: z.number().min(0).max(1),
});

export const handleSearchStatusChangedSchema = z.discriminatedUnion('status', [
  z.object({
    searchRequestId: z.uuid(),
    status: z.literal(SearchRequestStatus.PROCESSING),
  }),

  z.object({
    searchRequestId: z.uuid(),
    status: z.literal(SearchRequestStatus.FAILED),
  }),

  z.object({
    searchRequestId: z.uuid(),
    status: z.literal(SearchRequestStatus.COMPLETED),
    matchedPhotosMetadata: z.array(matchedPhotoMetadataSchema),
  }),
]);

export type HandleSearchStatusChangedInput = z.infer<
  typeof handleSearchStatusChangedSchema
>;
