import type { RequestHandler } from 'express';
import { envVariables } from '../configs/env.config.js';
import { ApiError } from '../utils/api-output.util.js';

const authenticateWebhook: RequestHandler = async (req, res, next) => {
  try {
    const webhookSecret = req.headers['x-webhook-secret'];

    if (!webhookSecret || typeof webhookSecret !== 'string') {
      throw new ApiError(401, 'Webhook secret missing');
    }

    if (webhookSecret !== envVariables.WEBHOOK_SECRET) {
      throw new ApiError(401, 'Invalid webhook secret');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export { authenticateWebhook };
