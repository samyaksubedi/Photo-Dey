import type { RequestHandler } from 'express';
import { envVariables } from '../configs/env.config.js';
import { ApiError } from '../utils/api-output.util.js';

const authenticateTelegramWebhook: RequestHandler = async (req, res, next) => {
  try {
    const telegramWebhookSecret =
      req.headers['x-telegram-bot-api-secret-token'];

    if (!telegramWebhookSecret || typeof telegramWebhookSecret !== 'string') {
      throw new ApiError(401, 'Webhook secret missing');
    }

    if (telegramWebhookSecret !== envVariables.TELEGRAM_WEBHOOK_SECRET) {
      throw new ApiError(401, 'Invalid webhook secret');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export { authenticateTelegramWebhook };
