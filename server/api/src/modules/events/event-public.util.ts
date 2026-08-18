import { randomBytes } from 'node:crypto';

export type PublicEventAvailability = 'PROCESSING' | 'READY' | 'UNAVAILABLE';

type PublicEventState = {
  status: 'CREATED' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL_FAILURE' | 'FAILED';
  completedPhotos: number;
  publicEnabled: boolean;
};

export const generatePublicCode = () => randomBytes(9).toString('base64url');

export const getPublicEventAvailability = (
  event: PublicEventState,
): PublicEventAvailability => {
  if (!event.publicEnabled || event.status === 'FAILED') {
    return 'UNAVAILABLE';
  }

  if (
    (event.status === 'COMPLETED' || event.status === 'PARTIAL_FAILURE') &&
    event.completedPhotos > 0
  ) {
    return 'READY';
  }

  return 'PROCESSING';
};

export const isEventPubliclySearchable = (event: PublicEventState) =>
  getPublicEventAvailability(event) === 'READY';

export const buildTelegramDeepLink = (
  botUsername: string,
  publicCode: string,
) => {
  const normalizedUsername = botUsername.replace(/^@/, '');
  return `https://t.me/${normalizedUsername}?start=${publicCode}`;
};
