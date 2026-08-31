import { UPLOAD_QUEUE_KEY, uploadQueue } from './upload.queue.js';
import type { ProcessUploadQueueInput } from './upload.worker.js';

export const enqueueUpload = async (data: ProcessUploadQueueInput) => {
  const jobId =
    data.jobType === 'event-photo'
      ? `event-photo-${data.photoId}`
      : `telegram-selfie-${data.searchRequestId}`;

  await uploadQueue.add(
    data.jobType,
    { ...data },
    {
      jobId,
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 4000,
      },
    },
  );
};
