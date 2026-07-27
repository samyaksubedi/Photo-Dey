import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  handlePhotoStatusChanged,
  handleSearchStatusChanged,
} from './ai.controller.js';
import {
  handlePhotoStatusChangedSchema,
  handleSearchStatusChangedSchema,
} from './ai.schema.js';
import { authenticateAiWebhook } from '../../middlewares/ai.webhook.middleware.js';
export const router = express.Router();

// POST /ai/photo-status
// POST /ai/search-status

router.post(
  '/photo-status',
  authenticateAiWebhook,
  validate({ schema: handlePhotoStatusChangedSchema }),
  handlePhotoStatusChanged,
);
router.post(
  '/search-status',
  authenticateAiWebhook,
  validate({ schema: handleSearchStatusChangedSchema }),
  handleSearchStatusChanged,
);
