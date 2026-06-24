import { configDotenv } from 'dotenv';
configDotenv();

import { app } from './app.js';
import { envVariables } from './configs/env.config.js';

const PORT = envVariables.PORT;

async function server() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at ${envVariables.SERVER_URL}/api`);
  });
}

server();
