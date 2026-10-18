import axios from 'axios';
import { envVariables } from '../../configs/env.config.js';

const telegramApi = axios.create({
  baseURL: `https://api.telegram.org/bot${envVariables.TELEGRAM_BOT_TOKEN}`,
  timeout: 10000,
});

const telegramFileApi = axios.create({
  baseURL: `https://api.telegram.org/file/bot${envVariables.TELEGRAM_BOT_TOKEN}`,
  timeout: 10000,
});

type SendMessageInput = {
  chatId: string;
  text: string;
  // Telegram only accepts public https links in buttons, so we skip the
  // button (and rely on the link in the text) for local http URLs.
  button?: { text: string; url: string };
};

export const sendMessage = async (data: SendMessageInput) => {
  const canShowButton = Boolean(data.button?.url.startsWith('https://'));
  return telegramApi.post('/sendMessage', {
    chat_id: data.chatId,
    text: data.text,
    ...(canShowButton && data.button
      ? {
          reply_markup: {
            inline_keyboard: [[{ text: data.button.text, url: data.button.url }]],
          },
        }
      : {}),
  });
};

export const getFile = async (fileId: string) => {
  const { data } = await telegramApi.get('/getFile', {
    params: {
      file_id: fileId,
    },
  });

  return data.result as {
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    file_path: string;
  };
};

export const downloadFile = async (filePath: string) => {
  const { data } = await telegramFileApi.get(`/${filePath}`, {
    responseType: 'stream',
  });

  return data;
};
