import { UPLOAD_QUEUE_KEY, uploadQueue } from './upload.queue.js';
import type { ProcessUploadQueueInput } from './upload.worker.js';

export const enqueueUpload = async (data: ProcessUploadQueueInput) => {
  await uploadQueue.add(
    data.jobType,
    { ...data },
    {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 4000,
      },
    },
  );
};
