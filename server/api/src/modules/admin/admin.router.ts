import express from 'express';
import { authenticateUser } from '../../middlewares/auth.middleware.js';
import { authorizeAdmin } from '../../middlewares/authorization.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { getEvents, getOverview, getUsers } from './admin.controller.js';
import { adminEventsQuerySchema, adminUsersQuerySchema } from './admin.schema.js';

export const router = express.Router();

router.use(authenticateUser, authorizeAdmin);
router.get('/overview', getOverview);
router.get('/users', validate({ schema: adminUsersQuerySchema, source: 'query' }), getUsers);
router.get('/events', validate({ schema: adminEventsQuerySchema, source: 'query' }), getEvents);
