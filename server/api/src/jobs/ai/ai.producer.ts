import { aiQueue } from './ai.queue.js';
export type EnqueueAiInput = {
  eventId: string;
  photoId: string;
  secureUrl: string;
};

export const enqueueAi = async (data: EnqueueAiInput) => {
  await aiQueue.add(
    'ai',
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
