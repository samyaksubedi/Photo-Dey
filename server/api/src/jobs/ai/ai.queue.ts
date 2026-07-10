import { Queue } from 'bullmq';
import { redisConnection } from '../../configs/redis.config.js';
export const AI_QUEUE_KEY = 'queue-ai';
export const aiQueue = new Queue(AI_QUEUE_KEY, { connection: redisConnection });
