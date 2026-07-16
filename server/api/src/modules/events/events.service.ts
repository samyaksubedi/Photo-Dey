import { enqueueUpload } from '../../jobs/upload/upload.producer.js';
import { ApiError } from '../../utils/api-output.util.js';
import { photoRepository } from '../photos/photos.repository.js';
import { eventRepository } from './events.repository.js';

const getEvents = async (data: { userId: string }) => {
  //  Get all events  of the user
  const events = await eventRepository.getEvents(data.userId);
  return events;
};
type CreateEventInput = {
  photos: Express.Multer.File[];
  userId: string;
  name: string;
};
const createEvent = async (data: CreateEventInput) => {
  // Create the event

  const event = await eventRepository.createEvent({
    name: data.name,
    userId: data.userId,
    totalPhotos: data.photos.length,
  });
  const photos = data.photos;
  for (const photo of photos) {
    const newPhoto = await photoRepository.createPhoto({
      localPath: photo.path,
      eventId: event.id,
    });
    await enqueueUpload({
      eventId: event.id,
      userId: data.userId,
      filePath: photo.path,
      photoId: newPhoto.id,
      type: 'image',
    });
  }
  await eventRepository.updateEvent(event.id, data.userId, {
    status: 'PROCESSING',
  });

  return event;
};
const getEvent = async (data: { eventId: string; userId: string }) => {
  //  Get all details for a single events
  const event = await eventRepository.findByIdAndUserId(
    data.eventId,
    data.userId,
  );
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  return event;
};
const deleteEvent = async (data: { eventId: string; userId: string }) => {
  const event = await eventRepository.findByIdAndUserId(
    data.eventId,
    data.userId,
  );
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  // TODO Delete all photo from cloudinary too
  await eventRepository.deleteById(data.eventId);
};
const getStatus = async (data: { eventId: string; userId: string }) => {
  const event = await eventRepository.findByIdAndUserId(
    data.eventId,
    data.userId,
  );
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const status = await eventRepository.getStatus(data.eventId);
  return status;
};
export const eventServices = {
  getEvents,
  createEvent,
  getEvent,
  deleteEvent,
  getStatus,
};
