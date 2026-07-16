import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticateUser } from '../../middlewares/auth.middleware.js';
import {
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  getStatus,
} from './events.controller.js';
import { upload } from '../../middlewares/upload.middleware.js';
import {
  createEventSchema,
  deleteEventSchema,
  getEventSchema,
  getStatusSchema,
} from './events.schema.js';


export const router = express.Router();

router.get('/', authenticateUser, getEvents);
router.post(
  '/',
  authenticateUser,
  upload.array('photos', 1000),
  validate({ schema: createEventSchema }),
  createEvent,
);
router.get(
  '/:eventId',
  authenticateUser,
  validate({ schema: getEventSchema, source: 'params' }),
  getEvent,
);
router.delete(
  '/:eventId',
  authenticateUser,
  validate({ schema: deleteEventSchema, source: 'params' }),
  deleteEvent,
);
router.get(
  '/:eventId/status',
  authenticateUser,
  validate({ schema: getStatusSchema, source: 'params' }),
  getStatus,
);
router.get(
  '/:eventId/',
  authenticateUser,
  validate({ schema: getStatusSchema, source: 'params' }),
  getStatus,
);
