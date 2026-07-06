import { Redis } from 'ioredis';
import { envVariables } from './env.config.js';
import { logger } from './logger.config.js';
export const redisConnection = new Redis(envVariables.REDIS_URL, {
  maxRetriesPerRequest: null,
});
export const testRedisConnection = async () => {
  try {
    await redisConnection.ping();
    logger.info('Redis connected');
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Redis connection failed : ', error.message);
    }
    logger.error('Redis connection failed : ', error);
    process.exit(1); // Shutdown API process
  }
};
