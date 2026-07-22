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
  handleUnknownCommand,
};
