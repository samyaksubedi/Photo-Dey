//  This is just a test worker , actual worker is written in Python !
//  No any node worker ! --> The worker for this queue is in python . Worker is written in python using bullmq python support : )


import { Worker, Job } from 'bullmq';
import type { EnqueueAiInput } from './ai.producer.js';
import { AI_QUEUE_KEY } from './ai.queue.js';
import { redisConnection } from '../../configs/redis.config.js';
import { logger } from '../../configs/logger.config.js';

const processAiQueue = async (job: Job<EnqueueAiInput>) => {
  const data = job.data;
};
const uploadWorker = new Worker(AI_QUEUE_KEY, processAiQueue, {
  connection: redisConnection,
});

uploadWorker.on('completed', async (job) => {
  const data = job.data;

  logger.info('Photo test processed successfully', { ...job.data });
});
uploadWorker.on('failed', async (job, err) => {
  logger.error('Photo uploading failed ', {
    ...job?.data,
    message: err.message,
    stack: err.stack,
  });
});
