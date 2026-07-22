import type { RequestHandler } from 'express';
import { envVariables } from '../configs/env.config.js';
import { ApiError } from '../utils/api-output.util.js';

const authenticateAiWebhook: RequestHandler = async (req, res, next) => {
  try {
    const aiWebhookSecret = req.headers['x-webhook-secret'];

    if (!aiWebhookSecret || typeof aiWebhookSecret !== 'string') {
      throw new ApiError(401, 'Webhook secret missing');
    }

    if (aiWebhookSecret !== envVariables.AI_WEBHOOK_SECRET) {
      throw new ApiError(401, 'Invalid webhook secret');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export { authenticateAiWebhook };
