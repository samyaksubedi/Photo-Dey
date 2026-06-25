import { configDotenv } from 'dotenv';
configDotenv();

import { app } from './app.js';
import { envVariables } from './configs/env.config.js';
import { logger } from './configs/logger.config.js';
import { testPostgresConnection } from './db/db.client.js';

const PORT = envVariables.PORT;
async function testDependency() {
  await testPostgresConnection();
}
async function server() {
  await testDependency();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`API endpoints available at ${envVariables.SERVER_URL}/api`);
  });
}

server();
