import { info } from 'node:console';
import { logger } from '../configs/logger.config.js';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

const testPostgresConnection = async () => {
  try {
    await prisma.$connect();
    logger.info('Postgres connected');
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Postgres connection failed', {
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error('Postgres connection failed', { error });
    }
    process.exit(1);
  }
};
export { prisma, testPostgresConnection };
 