import { enqueueUpload } from '../../jobs/upload/upload.producer.js';
import { ApiError } from '../../utils/api-output.util.js';
import { photoRepository } from '../photos/photos.repository.js';
import { eventRepository } from './events.repository.js';
import { deleteSourceFiles } from './events.upload.js';
import { enqueueAiCleanup } from '../../jobs/ai-cleanup/ai-cleanup.producer.js';
import { generatePublicCode } from './event-public.util.js';
import { deleteTempFile } from '../../utils/file.util.js';
import { logger } from '../../configs/logger.config.js';

const getEvents = async (data: { userId: string }) => {
  //  Get all events  of the user
  const events = await eventRepository.getEvents(data.userId);
  return events;
};
type CreateEventInput = {
  userId: string;
  name: string;
  expectedTotalPhotos: number;
};
const createEvent = async (data: CreateEventInput) => {
  return eventRepository.createEvent({
    name: data.name,
    userId: data.userId,
    totalPhotos: data.expectedTotalPhotos,
    publicCode: generatePublicCode(),
  });
};

type UploadEventPhotoBatchInput = {
  eventId: string;
  userId: string;
  clientBatchId: string;
  photos: Express.Multer.File[];
  totalBytes: number;
};

const cleanupFiles = async (photos: Express.Multer.File[]) => {
  await Promise.allSettled(photos.map((photo) => deleteTempFile(photo.path)));
};

const uploadEventPhotoBatch = async (data: UploadEventPhotoBatchInput) => {
  let acceptedBatch: Awaited<
    ReturnType<typeof eventRepository.acceptPhotoBatch>
  >;

  try {
    acceptedBatch = await eventRepository.acceptPhotoBatch({
      eventId: data.eventId,
      userId: data.userId,
      clientBatchId: data.clientBatchId,
      totalBytes: data.totalBytes,
      photos: data.photos,
    });
  } catch (error) {
    await cleanupFiles(data.photos);
    throw error;
  }

  if (acceptedBatch.idempotent) {
    await cleanupFiles(data.photos);
  }

  if (acceptedBatch.batch.status !== 'QUEUED') {
    try {
      for (const photo of acceptedBatch.batch.photos) {
        if (photo.status !== 'PENDING_UPLOAD' || !photo.localPath) continue;
        await enqueueUpload({
          eventId: data.eventId,
          userId: data.userId,
          filePath: photo.localPath,
          photoId: photo.id,
          jobType: 'event-photo',
        });
      }
      await eventRepository.markUploadBatchQueued(acceptedBatch.batch.id);
    } catch (error) {
      logger.error('Photo batch was accepted but could not be fully queued', {
        eventId: data.eventId,
        clientBatchId: data.clientBatchId,
        message: error instanceof Error ? error.message : String(error),
      });
      throw new ApiError(
        503,
        'Photo batch was accepted but queueing was interrupted. Retry with the same clientBatchId.',
      );
    }
  }

  return {
    clientBatchId: acceptedBatch.batch.clientBatchId,
    acceptedPhotos: acceptedBatch.batch.photoCount,
    totalBytes: acceptedBatch.batch.totalBytes,
    receivedPhotos: acceptedBatch.event.receivedPhotos,
    totalPhotos: acceptedBatch.event.totalPhotos,
    idempotent: acceptedBatch.idempotent,
  };
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

  const photos = await photoRepository.getPhotosByEventIdAndUserId(
    data.eventId,
    data.userId,
  );
  const publicIds = photos
    .map((photo) => photo.publicId)
    .filter((publicId): publicId is string => Boolean(publicId));

  await deleteSourceFiles({ publicIds, type: 'image' });
  await enqueueAiCleanup({ eventId: data.eventId });
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
const updatePublicAccess = async (data: {
  eventId: string;
  userId: string;
  publicEnabled: boolean;
}) => {
  const event = await eventRepository.findByIdAndUserId(
    data.eventId,
    data.userId,
  );
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  await eventRepository.updateEvent(data.eventId, data.userId, {
    publicEnabled: data.publicEnabled,
  });

  return {
    publicCode: event.publicCode,
    publicEnabled: data.publicEnabled,
  };
};
export const eventServices = {
  getEvents,
  createEvent,
  uploadEventPhotoBatch,
  getEvent,
  deleteEvent,
  getStatus,
  updatePublicAccess,
};
