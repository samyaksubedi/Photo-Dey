import { Queue } from 'bullmq';
import { redisConnection } from '../../configs/redis.config.js';
export const UPLOAD_QUEUE_KEY = 'queue-upload';
export const uploadQueue = new Queue(UPLOAD_QUEUE_KEY, {
  connection: redisConnection,
});
