import { redisConnection } from '../../configs/redis.config.js';
import { aiCleanupQueue } from './ai-cleanup.queue.js';

export const DELETED_EVENT_KEY_PREFIX = 'ai:deleted-event:';

export type EnqueueAiCleanupInput = {
  eventId: string;
};

export const getDeletedEventKey = (eventId: string) =>
  `${DELETED_EVENT_KEY_PREFIX}${eventId}`;

export const enqueueAiCleanup = async (data: EnqueueAiCleanupInput) => {
  await redisConnection.set(getDeletedEventKey(data.eventId), '1');

  await aiCleanupQueue.add('delete-event-vectors', data, {
    jobId: `delete-event-${data.eventId}`,
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 4000,
    },
    removeOnComplete: {
      count: 1000,
    },
  });
};
