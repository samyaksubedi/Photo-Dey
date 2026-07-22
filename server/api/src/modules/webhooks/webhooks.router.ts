import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { updateEvent, updatePhoto } from './webhooks.controller.js';
import { updateEventSchema, updatePhotoSchema } from './webhooks.schema.js';
import { authenticateAiWebhook } from '../../middlewares/ai.webhook.middleware.js';
export const router = express.Router();

//  update photo  : stats
//  update event  : stats

router.post(
  '/events',
  authenticateAiWebhook,
  validate({ schema: updateEventSchema }),
  updateEvent,
); // Update event stats / status
router.post(
  '/photos',
  authenticateAiWebhook,
  validate({ schema: updatePhotoSchema }),
  updatePhoto,
); // update photo status
