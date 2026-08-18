import { createRequire } from 'node:module';

const require = createRequire(new URL('../../api/package.json', import.meta.url));
const { Queue } = require('bullmq');

const queueName = process.argv[2];
const connection = {
  host: '127.0.0.1',
  port: 6379,
  password: 'photodeyredis123',
};
const queue = new Queue(queueName, { connection });

try {
  let job = await queue.add(
    'node-to-python',
    { message: 'PhotoDey interop' },
    { removeOnComplete: false },
  );

  let state = await job.getState();
  for (let attempt = 0; attempt < 100 && state !== 'completed'; attempt++) {
    if (state === 'failed') {
      throw new Error(`Interop job failed: ${job.failedReason}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    job = await queue.getJob(job.id);
    if (!job) {
      throw new Error('Interop job disappeared before completion');
    }
    state = await job.getState();
  }

  if (state !== 'completed') {
    throw new Error(`Interop job timed out in state: ${state}`);
  }
  if (job.returnvalue?.processedBy !== 'python') {
    throw new Error(`Unexpected return value: ${JSON.stringify(job.returnvalue)}`);
  }
  console.log(JSON.stringify(job.returnvalue));
} finally {
  await queue.obliterate({ force: true });
  await queue.close();
}
