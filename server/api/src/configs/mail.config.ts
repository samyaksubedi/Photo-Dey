import { createTransport } from 'nodemailer';
import { envVariables } from './env.config.js';
import { logger } from './logger.config.js';

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: envVariables.GMAIL_USER,
    pass: envVariables.GMAIL_APP_PASSWORD,
  },
});

const testMailTransporter = () => {
  transporter.verify((error) => {
    if (error) {
      logger.error('Mail transporter connection failed', {
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.info('Mail transporter ready');
    }
  });
};

export { transporter, testMailTransporter };
