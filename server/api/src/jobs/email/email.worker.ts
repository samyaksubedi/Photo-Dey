import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../configs/redis.config.js';
import { EMAIL_QUEUE_KEY } from './email.queue.js';
import {
  sendWelcomeEmail,
  resendVerificationEmail,
} from '../../modules/auth/auth.email.js';
import { logger } from '../../configs/logger.config.js';
const emails = {
  resendVerificationEmail,
  sendWelcomeEmail,
};

type EmailTypes = 'resendVerificationEmail' | 'sendWelcomeEmail';

export type ProcessEmailQueueInput = {
  emailType: EmailTypes;
  to: string;
  name: string;
  emailVerificationToken: string;
};

const processEmailQueue = async (job: Job<ProcessEmailQueueInput>) => {
  const data = job.data;
  if (data.emailType == 'sendWelcomeEmail') {
    await emails.sendWelcomeEmail({ ...data });
  } else if (data.emailType == 'resendVerificationEmail') {
    await emails.resendVerificationEmail({ ...data });
  }
};
const emailWorker = new Worker(EMAIL_QUEUE_KEY, processEmailQueue, {
  connection: redisConnection,
});

emailWorker.on('completed', (job) => {
  logger.info('Email sent', { ...job.data });
});
emailWorker.on('failed', (job, err) => {
  logger.error('Sending Email failed ', {
    ...job?.data,
  });
});
