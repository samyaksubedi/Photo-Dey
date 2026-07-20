import { EventStatus, PhotoStatus } from '../../generated/prisma/enums.js';
import { ApiError } from '../../utils/api-output.util.js';
import { eventRepository } from '../events/events.repository.js';
import { photoRepository } from '../photos/photos.repository.js';
// import type { UpdatePhotoInput , UpdateEventInput} from './webhooks.schema.js';

export type UpdateEventInput = {
  eventId: string;
  processingPhotos?: number;
  completedPhotos?: number;
  failedPhotos?: number;
  status?: EventStatus;
};

const updateEvent = async (data: UpdateEventInput) => {
  const event = await eventRepository.findById(data.eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  const { eventId, ...updateData } = data;

  await eventRepository.updateEventInternal(eventId, updateData);
};

export type UpdatePhotoInput = {
  photoId: string;
  status: PhotoStatus;
};
const updatePhoto = async (data: UpdatePhotoInput) => {
  const photo = await photoRepository.findById(data.photoId);
  if (!photo) {
    throw new ApiError(404, 'Photo not found');
  }
  await photoRepository.updatePhoto(data.photoId, { status: data.status });
};
export const webhooksServices = { updateEvent, updatePhoto };
