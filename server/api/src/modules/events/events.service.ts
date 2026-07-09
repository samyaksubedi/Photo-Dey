import { prisma } from '../../db/db.client.js';
import { enqueueUpload } from '../../jobs/upload/upload.producer.js';
import { ApiError } from '../../utils/api-output.util.js';
import { photoRepository } from '../photos/photos.repository.js';
import { eventRepository } from './events.repository.js';

const getEvents = async (data: { userId: string }) => {
  //  Get all events  of the user
  const events = await eventRepository.getEvents(data.userId);
  if (!events) {
    return null;
  }
  return events;
};
type CreateEventsInput = {
  photos: Express.Multer.File[];
  userId: string;
  name: string;
};
const createEvents = async (data: CreateEventsInput) => {
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
      filePath: photo.path,
      photoId: newPhoto.id,
      type: 'image',
    });
  }
  await eventRepository.updateEvent(event.id, {
    status: 'PROCESSING',
  });

  return event;
};
const getEvent = async (data: { eventId: string }) => {
  //  Get all details for a single events
  const event = await eventRepository.findById(data.eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  return event;
};
const deleteEvent = async (data: { eventId: string }) => {
  const event = await eventRepository.findById(data.eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  await eventRepository.deleteById(data.eventId);
};
const getStatus = async (data: { eventId: string }) => {
  const event = await eventRepository.findById(data.eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  const status = await eventRepository.getStatus(data.eventId);
  return status;
};
export const eventServices = {
  getEvents,
  createEvents,
  getEvent,
  deleteEvent,
  getStatus,
};
