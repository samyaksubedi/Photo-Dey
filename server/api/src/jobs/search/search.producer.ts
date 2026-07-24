import { SEARCH_QUEUE_KEY, searchQueue } from './search.queue.js';

export type ProcessSearchQueueInput = {
  jobType: 'telegram-selfie';
  searchRequestId: string; // For webhook to update status
  selfieUrl: string; // The real cloud url
  eventId: string; // TO sort and search in Qdrant
};
export const enqueueSearch = async (data: ProcessSearchQueueInput) => {
  await searchQueue.add(
    data.jobType,
    { ...data },
    {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 4000,
      },
    },
  );
};
