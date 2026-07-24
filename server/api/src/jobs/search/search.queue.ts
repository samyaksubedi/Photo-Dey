import { Queue } from 'bullmq';
import { redisConnection } from '../../configs/redis.config.js';

export const SEARCH_QUEUE_KEY = 'queue-search';

export const searchQueue = new Queue(SEARCH_QUEUE_KEY, {
  connection: redisConnection,
});
