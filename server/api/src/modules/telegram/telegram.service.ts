import { eventRepository } from '../events/events.repository.js';
import { telegramSessionRepository } from './telegram-session.repository.js';
import { sendMessage } from './telegram.api.js';

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

Your event has been connected successfully.

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
  // Later you'll fetch galleries from DB

  return sendMessage({
    chatId: data.chatId,
    text: `📂 Archive

Your previous galleries will appear here.

(No galleries found yet.)`,
  });
};
const handleSelfieUpload = async (data: { chatId: string; photo: object }) => {
  sendMessage({
    chatId: data.chatId,
    // text: 'Thanks for the selfie wait for a minute ',
    text: JSON.stringify(data.photo),
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
