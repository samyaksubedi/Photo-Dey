import express from 'express';
import { authenticateTelegramWebhook } from '../../middlewares/telegram.webhook.middleware.js';
import { telegramWebhook } from './telegram.controller.js';

export const router = express.Router();

router.post('/webhook', authenticateTelegramWebhook, telegramWebhook);
