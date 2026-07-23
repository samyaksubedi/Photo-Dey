import { saveStreamToFile } from '../../utils/file.util.js';
import { eventRepository } from '../events/events.repository.js';
import { searchRequestRepository } from '../search-request/search_req.repository.js';
import { telegramSessionRepository } from './telegram-session.repository.js';
import { downloadFile, getFile, sendMessage } from './telegram.api.js';
import type { PhotoSize } from 'typegram';
const handleStart = async (data: { chatId: string; eventId?: string }) => {
  if (!data.eventId) {
    return sendMessage({
      chatId: data.chatId,
      text: `📸 Welcome to PhotoDey!

Please open the bot using an event invitation link.

Commands:
/help - Show help
/archive - View your previous galleries`,
    });
  }
  const event = await eventRepository.findById(data.eventId);
  if (!event) {
    return sendMessage({
      chatId: data.chatId,
      text: `🎉 Welcome to PhotoDey!

Sorry your event can't be found.

Please contact to your event manager.`,
    });
  }
  const telegramSession = await telegramSessionRepository.findByChatId(
    data.chatId,
  );
  // On intial bot start we dont have any telegramSession so create one !
  if (!telegramSession) {
    await telegramSessionRepository.createTelegramSession({
      chatId: data.chatId,
      eventId: data.eventId,
    });
  }
  // Else update the eventId so user can search photo for any other event !
  else {
    await telegramSessionRepository.updateTelegramSession(data.chatId, {
      eventId: data.eventId,
    });
  }

  return sendMessage({
    chatId: data.chatId,
    text: `🎉 Welcome to PhotoDey!

${event.name} has been connected successfully.

Now send me a selfie and I'll find your photos from this event.`,
  });
};
const handleHelp = async (data: { chatId: string }) => {
  return sendMessage({
    chatId: data.chatId,
    text: `📖 Available Commands

/start - Start PhotoDey
/archive - View your previous galleries
/help - Show this help message

To find photos:
1. Open the bot from an event link
2. Send a selfie
3. Receive your gallery link`,
  });
};
const handleArchive = async (data: { chatId: string }) => {
  // TODO

  return sendMessage({
    chatId: data.chatId,
    text: `📂 Archive

Your previous galleries will appear here.

(No galleries found yet.)`,
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
    return;
  }
  const event = await eventRepository.findById(telegramSession.eventId);
  if (!event) {
    return sendMessage({
      chatId: data.chatId,
      text: 'This event no longer exists.',
    });
  }
  const largestPhoto = data.photo?.at(-1)!;
  const file_id = largestPhoto?.file_id;
  const file = await getFile(file_id);
  const stream = await downloadFile(file.file_path);
  const localPath = await saveStreamToFile(stream);
  await searchRequestRepository.createSearchRequest({
    chatId: data.chatId,
    eventId: telegramSession.eventId,
    localPath: localPath,
  });
  //TODO  Push to  upload queue with local_path

  return sendMessage({
    chatId: data.chatId,
    text: `📸 Selfie received!

We're processing your photos from ${event.name}.

You'll receive a gallery link here as soon as it's ready.`,
  });
};
const handleUnknownCommand = async (data: { chatId: string }) => {
  return sendMessage({
    chatId: data.chatId,
    text: `❓ Unknown command.

Use /help to see available commands.`,
  });
};

export const telegramService = {
  handleStart,
  handleHelp,
  handleArchive,
  handleSelfieUpload,
  handleUnknownCommand,
};
