import { envVariables } from '../../configs/env.config.js';
import { ApiError } from '../../utils/api-output.util.js';
import {
  buildTelegramDeepLink,
  getPublicEventAvailability,
} from '../events/event-public.util.js';
import { eventRepository } from '../events/events.repository.js';

const getPublicEvent = async (publicCode: string) => {
  const event = await eventRepository.findByPublicCode(publicCode);
  if (!event || !event.publicEnabled) {
    throw new ApiError(404, 'Public event not found');
  }

  const availability = getPublicEventAvailability(event);
  const telegramDeepLink =
    availability === 'READY' && envVariables.TELEGRAM_BOT_USERNAME
      ? buildTelegramDeepLink(
          envVariables.TELEGRAM_BOT_USERNAME,
          event.publicCode,
        )
      : null;

  return {
    name: event.name,
    availability,
    telegramDeepLink,
  };
};

export const publicEventServices = {
  getPublicEvent,
};
