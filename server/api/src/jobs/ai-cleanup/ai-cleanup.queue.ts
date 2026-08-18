import { Queue } from 'bullmq';
import { redisConnection } from '../../configs/redis.config.js';

export const AI_CLEANUP_QUEUE_KEY = 'queue-ai-cleanup';

export const aiCleanupQueue = new Queue(AI_CLEANUP_QUEUE_KEY, {
  connection: redisConnection,
});
