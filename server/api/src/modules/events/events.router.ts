import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticateUser } from '../../middlewares/auth.middleware.js';
import {
  createEvents,
  deleteEvent,
  getEvent,
  getEvents,
  getStatus,
} from './events.controller.js';

export const router = express.Router();

router.get('/', authenticateUser, getEvents);
router.post('/', authenticateUser, createEvents);
router.get('/:id', authenticateUser, getEvent);
router.delete('/:id', authenticateUser, deleteEvent);
router.get('/:id/status', authenticateUser, getStatus);
