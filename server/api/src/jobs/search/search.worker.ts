//  This is just a test worker , actual worker is written in Python !
//  No any node worker ! --> The worker for this queue is in python . Worker is written in python using bullmq python support : )

import { Job, Worker } from 'bullmq';
import type { ProcessSearchQueueInput } from './search.producer.js';
import { SEARCH_QUEUE_KEY } from './search.queue.js';
import { redisConnection } from '../../configs/redis.config.js';
import { logger } from '../../configs/logger.config.js';

const processSearchQueue = async (job: Job<ProcessSearchQueueInput>) => {
  const data = job.data;
};

const searchWorker = new Worker(SEARCH_QUEUE_KEY, processSearchQueue, {
  connection: redisConnection,
});

searchWorker.on('completed', async (job) => {
  logger.info('Guest Photo Matching successfully', { ...job.data });
});
searchWorker.on('failed', async (job, err) => {
  logger.error('Guest Photo Matching failed ', {
    ...job?.data,
    message: err.message,
    stack: err.stack,
  });
});
