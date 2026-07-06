import { EMAIL_QUEUE_KEY, emailQueue } from './email.queue.js';
import type { ProcessEmailQueueInput } from './email.worker.js';

export const enqueueEmail = async (data: ProcessEmailQueueInput) => {
  await emailQueue.add(
    data.emailType,
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
