import { ApiError } from '../../utils/api-output.util.js';
import { eventRepository } from '../events/events.repository.js';

import { photoRepository } from './photos.repository.js';

const getPhotos = async (data: { userId: string; eventId: string }) => {
  const event = await eventRepository.findByIdAndUserId(
    data.eventId,
    data.userId,
  );
  if (!event) {
    throw new ApiError(400, 'Event not found');
  }
  const photos = await photoRepository.getPhotosByEventIdAndUserId(
    data.eventId,
    data.userId,
  );
  return photos;
};
const getPhoto = async (data: { userId: string; photoId: string }) => {
  const photo = await photoRepository.findByIdAndUserId(
    data.photoId,
    data.userId,
  );
  if (!photo) {
    throw new ApiError(404, 'Photo not found');
  }
  return photo;
};
const deletePhoto = async (data: { userId: string; photoId: string }) => {
  const photo = await photoRepository.findByIdAndUserId(
    data.photoId,
    data.userId,
  );
  if (!photo) {
    throw new ApiError(404, 'Photo not found');
  }
  //TODO Delte from cloudinary too
  await photoRepository.deleteById(data.photoId);
};
export const photoServices = { getPhoto, getPhotos, deletePhoto };
