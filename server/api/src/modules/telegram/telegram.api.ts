import axios from 'axios';
import { envVariables } from '../../configs/env.config.js';

export const sendMessage = async (data: {
  chatId: string | number;
  text: string;
}) => {
  return axios.post(
    `https://api.telegram.org/bot${envVariables.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      chat_id: data.chatId,
      text: data.text,
    },
  );
};
