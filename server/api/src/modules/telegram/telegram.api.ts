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

export const sendMessage = async (data: {
  chatId: string | number;
  text: string;
}) => {
  return telegramApi.post('/sendMessage', {
    chat_id: data.chatId,
    text: data.text,
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
