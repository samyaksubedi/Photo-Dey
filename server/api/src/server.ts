import { configDotenv } from 'dotenv';
configDotenv();

import { app } from './app.js';
import { envVariables } from './configs/env.config.js';
import { logger } from './configs/logger.config.js';
import { testPostgresConnection } from './db/db.client.js';
import { testMailTransporter } from './configs/mail.config.js';
import { testRedisConnection } from './configs/redis.config.js';
import { testCloudinaryConnection } from './configs/cloudinary.config.js';

const PORT = envVariables.PORT;
async function testDependency() {
  testMailTransporter();
  await testPostgresConnection();
  await testRedisConnection();
  await testCloudinaryConnection();
}
async function server() {
  await testDependency();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`API endpoints available at ${envVariables.SERVER_URL}/api`);
  });
}

server();
