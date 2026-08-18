import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { getPublicEvent } from './public-events.controller.js';
import { getPublicEventSchema } from './public-events.schema.js';

export const router = express.Router();

router.get(
  '/:publicCode',
  validate({ schema: getPublicEventSchema, source: 'params' }),
  getPublicEvent,
);
