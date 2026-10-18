import { envVariables } from '../../configs/env.config.js';
import { enqueueUpload } from '../../jobs/upload/upload.producer.js';
import { saveStreamToFile } from '../../utils/file.util.js';
import { eventRepository } from '../events/events.repository.js';
import { isEventPubliclySearchable } from '../events/event-public.util.js';
import { searchRequestRepository } from '../search-request/search_req.repository.js';
import { telegramSessionRepository } from './telegram-session.repository.js';
import { downloadFile, getFile, sendMessage } from './telegram.api.js';
import type { PhotoSize } from 'typegram';
import { logger } from '../../configs/logger.config.js';
const handleStart = async (data: { chatId: string; publicCode?: string }) => {
  if (!data.publicCode) {
    return sendMessage({
      chatId: data.chatId,
      text: `Welcome to PhotoDey.

Open this bot from an event invitation link to find your photos.

/help shows how it works.
/archive lists your earlier galleries.`,
    });
  }
  const event = await eventRepository.findByPublicCode(data.publicCode);
  if (!event) {
    return sendMessage({
      chatId: data.chatId,
      text: `We couldn't find this event.

The link may be wrong. Ask the event organizer for a new one.`,
    });
  }
  if (!event.publicEnabled) {
    return sendMessage({
      chatId: data.chatId,
      text: `This event isn't accepting photo searches any more.

Ask the event organizer if you think this is a mistake.`,
    });
  }
  if (!isEventPubliclySearchable(event)) {
    const isProcessing =
      event.status === 'CREATED' || event.status === 'PROCESSING';
    return sendMessage({
      chatId: data.chatId,
      text: isProcessing
        ? `The photos for ${event.name} are still being prepared.

Try again in a few minutes.`
        : `Photo search isn't available for ${event.name} right now.

Ask the event organizer.`,
    });
  }
  const telegramSession = await telegramSessionRepository.findByChatId(
    data.chatId,
  );
  // On intial bot start we dont have any telegramSession so create one !
  if (!telegramSession) {
    await telegramSessionRepository.createTelegramSession({
      chatId: data.chatId,
      eventId: event.id,
    });
  }
  // Else update the eventId so user can search photo for any other event !
  else {
    await telegramSessionRepository.updateTelegramSession(data.chatId, {
      eventId: event.id,
    });
  }

  return sendMessage({
    chatId: data.chatId,
    text: `You're connected to ${event.name}.

Send me one clear, front-facing selfie and I'll find the photos you're in.`,
  });
};
const handleHelp = async (data: { chatId: string }) => {
  return sendMessage({
    chatId: data.chatId,
    text: `How to find your photos

1. Open this bot from the event's QR code or link.
2. Send one clear, front-facing selfie.
3. Open the gallery link I send back.

Commands
/start - Start again
/archive - Your earlier galleries
/help - Show this message`,
  });
};
const handleArchive = async (data: { chatId: string }) => {
  const completedSearchRequests =
    await searchRequestRepository.findCompletedGalleriesByChatId(data.chatId);

  if (!completedSearchRequests.length) {
    return sendMessage({
      chatId: data.chatId,
      text: `You don't have any galleries yet.

Open an event link and send a selfie to create one.`,
    });
  }

  const GALLERY_LINK = `${envVariables.CLIENT_URL}/gallery`;

  const galleries = completedSearchRequests
    .map(
      (searchRequest, index) =>
        `${index + 1}. ${GALLERY_LINK}/${searchRequest.id}`,
    )
    .join('\n\n');

  return sendMessage({
    chatId: data.chatId,
    text: `Your galleries

${galleries}

Tap a link to open it.`,
  });
};
const handleSelfieUpload = async (data: {
  chatId: string;
  photo: PhotoSize[];
}) => {
  const telegramSession = await telegramSessionRepository.findByChatId(
    data.chatId,
  );
  if (!telegramSession) {
    logger.error('No telegram session found for user !');
    return;
  }
  const event = await eventRepository.findById(telegramSession.eventId);
  if (!event) {
    return sendMessage({
      chatId: data.chatId,
      text: 'This event no longer exists.',
    });
  }
  if (!event.publicEnabled) {
    return sendMessage({
      chatId: data.chatId,
      text: `This event isn't accepting photo searches any more.

Ask the event organizer if you think this is a mistake.`,
    });
  }
  if (!isEventPubliclySearchable(event)) {
    const isProcessing =
      event.status === 'CREATED' || event.status === 'PROCESSING';
    return sendMessage({
      chatId: data.chatId,
      text: isProcessing
        ? `The event photos are still being prepared.

Try again in a few minutes.`
        : "Photo search isn't available for this event right now.",
    });
  }
  const largestPhoto = data.photo?.at(-1)!;
  const file_id = largestPhoto?.file_id;
  const file = await getFile(file_id);
  const stream = await downloadFile(file.file_path);
  const localPath = await saveStreamToFile(stream);
  const searchRequest = await searchRequestRepository.createSearchRequest({
    chatId: data.chatId,
    eventId: telegramSession.eventId,
    localPath: localPath,
  });
  // {
  //   jobType: 'telegram-selfie';
  //   eventId: string;
  //   searchRequestId: string;
  //   filePath: string;
  // }
  enqueueUpload({
    jobType: 'telegram-selfie',
    eventId: event.id,
    searchRequestId: searchRequest.id,
    filePath: localPath,
  });
};
const handleUnknownCommand = async (data: { chatId: string }) => {
  sendMessage({
    chatId: data.chatId,
    text: `I don't know that command.

Send /help to see what I can do.`,
  });
};

export const telegramService = {
  handleStart,
  handleHelp,
  handleArchive,
  handleSelfieUpload,
  handleUnknownCommand,
};
