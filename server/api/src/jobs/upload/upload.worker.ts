import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../configs/redis.config.js';
import { logger } from '../../configs/logger.config.js';
import { UPLOAD_QUEUE_KEY } from './upload.queue.js';
import { uploadSourceFile } from '../../modules/events/events.upload.js';
import { eventRepository } from '../../modules/events/events.repository.js';
import { photoRepository } from '../../modules/photos/photos.repository.js';
import { enqueueAi } from '../ai/ai.producer.js';
import { searchRequestRepository } from '../../modules/search-request/search_req.repository.js';
import { enqueueSearch } from '../search/search.producer.js';
import { sendMessage } from '../../modules/telegram/telegram.api.js';

export type ProcessUploadQueueInput =
  | {
      jobType: 'event-photo';
      userId: string;
      eventId: string;
      photoId: string;
      filePath: string;
    }
  | {
      jobType: 'telegram-selfie';
      eventId: string;
      searchRequestId: string;
      filePath: string;
    };
const processUploadQueue = async (job: Job<ProcessUploadQueueInput>) => {
  // Update event counters for photos
  // Update photo : data , status
  const data = job.data;
  const { publicId, secureUrl } = await uploadSourceFile({
    filePath: data.filePath,
    jobType: data.jobType,
  });
  switch (data.jobType) {
    case 'event-photo': {
      const event = await eventRepository.findById(data.eventId);
      // const photo = await photoRepository.findById(data.photoId);
      const photo = await photoRepository.findByIdAndUserId(
        data.photoId,
        data.userId,
      );
      if (!event) {
        return;
      }
      if (!photo) {
        return;
      }
      const uploadedPhotos = event.uploadedPhotos;
      await eventRepository.updateEvent(data.eventId, data.userId, {
        uploadedPhotos: uploadedPhotos + 1,
      });
      await photoRepository.updatePhoto(data.photoId, {
        status: 'UPLOADED',
        publicId,
        secureUrl,
      });

      await enqueueAi({
        eventId: data.eventId,
        photoId: data.photoId,
        secureUrl,
      }); //  Python worker picks the job and starts processing the job (Generate faceembedding bla bla ....)--> It's kinda worker pushing another job into another queue haha
      break;
    }

    case 'telegram-selfie': {
      const event = await eventRepository.findById(data.eventId);
      if (!event) {
        return;
      }
      const searchRequest = await searchRequestRepository.findById(
        data.searchRequestId,
      );

      if (!searchRequest) {
        return;
      }
      await searchRequestRepository.updateSearchRequest(data.searchRequestId, {
        selfieUrl: secureUrl,
        status: 'PROCESSING',
      });
      await enqueueSearch({
        jobType: data.jobType,
        eventId: data.eventId,
        searchRequestId: data.searchRequestId,
        selfieUrl: secureUrl,
      });
      await sendMessage({
        chatId: searchRequest.chatId,
        text: `📸 Selfie received!

We're processing your photos from ${event.name}.

You'll receive a gallery link here as soon as it's ready.`,
      });
      break;
    }
    default:
      break;
  }

  // TODO -> remove temp photo from disk
};
const uploadWorker = new Worker(UPLOAD_QUEUE_KEY, processUploadQueue, {
  connection: redisConnection,
});

uploadWorker.on('completed', async (job) => {
  const data = job.data;

  logger.info('Photo uploaded successfully', { ...job.data });
});
uploadWorker.on('failed', async (job, err) => {
  if (!job) {
    logger.error('Photo uploading failed', {
      message: err.message,
      stack: err.stack,
    });
    return;
  }

  const data = job.data;

  // BullMQ retry info
  const maxAttempts = job.opts.attempts ?? 1;
  const isLastAttempt = job.attemptsMade >= maxAttempts;

  // Log every failure
  logger.error('Photo uploading failed', {
    ...data,
    attemptsMade: job.attemptsMade,
    maxAttempts,
    message: err.message,
    stack: err.stack,
  });

  // Don't mark anything as failed until retries are exhausted
  if (!isLastAttempt) {
    return;
  }

  switch (data.jobType) {
    case 'event-photo': {
      const event = await eventRepository.findById(data.eventId);

      if (!event) {
        return;
      }

      await photoRepository.updatePhoto(data.photoId, {
        status: 'FAILED',
      });

      const failedPhotos = event.failedPhotos;
      const totalPhotos = event.totalPhotos;

      if (failedPhotos === totalPhotos - 1) {
        await eventRepository.updateEvent(data.eventId, data.userId, {
          status: 'FAILED',
          failedPhotos: failedPhotos + 1,
        });
      } else {
        await eventRepository.updateEvent(data.eventId, data.userId, {
          status: 'PARTIAL_FAILURE',
          failedPhotos: failedPhotos + 1,
        });
      }

      break;
    }

    case 'telegram-selfie': {
      const searchRequest = await searchRequestRepository.findById(
        data.searchRequestId,
      );

      if (!searchRequest) {
        return;
      }

      await searchRequestRepository.updateSearchRequest(data.searchRequestId, {
        status: 'FAILED',
      });

      await sendMessage({
        chatId: searchRequest.chatId,
        text: `❌ We couldn't process your selfie.

This seems to be a temporary issue.

Please upload your selfie again in a few minutes.

If the problem continues, contact the event organizer.

We apologize for the inconvenience.`,
      });

      break;
    }
  }

  // TODO -> remove temp photo from disk
});
