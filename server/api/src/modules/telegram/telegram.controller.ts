import type { RequestHandler } from 'express';
import { telegramService } from './telegram.service.js';

import type { Update } from 'typegram';

export const telegramWebhook: RequestHandler = async (req, res, next) => {
  try {
    const update = req.body;
    console.log(update);
    const photo = update.message?.photo;

    const chatId = update.message?.chat?.id.toString();
    const text = update.message?.text;
    if (text?.startsWith('/start')) {
      const eventId = text.split(' ')[1];

      await telegramService.handleStart({
        chatId,
        eventId,
      });

      return res.sendStatus(200);
    }
    if (photo) {
      await telegramService.handleSelfieUpload({ chatId, photo });
      return res.sendStatus(200);
    }

    switch (text) {
      case '/help':
        await telegramService.handleHelp({ chatId });
        break;

      case '/archive':
        await telegramService.handleArchive({ chatId });
        break;

      default:
        await telegramService.handleUnknownCommand({ chatId });
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
