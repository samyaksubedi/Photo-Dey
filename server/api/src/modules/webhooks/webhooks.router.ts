import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { updateEvent, updatePhoto } from './webhooks.controller.js';
import { updateEventSchema, updatePhotoSchema } from './webhooks.schema.js';
import { authenticateWebhook } from '../../middlewares/webhook.middleware.js';
export const router = express.Router();

//  update photo  : stats
//  update event  : stats

router.post(
  '/events',
  authenticateWebhook,
  validate({ schema: updateEventSchema }),
  updateEvent,
); // Update event stats / status
router.post(
  '/photos',
  authenticateWebhook,
  validate({ schema: updatePhotoSchema }),
  updatePhoto,
); // update photo status
