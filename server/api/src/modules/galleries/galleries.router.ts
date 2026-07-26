import express from 'express';
import { getGallery } from './galleries.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { getGallerySchema } from './galleries.schema.js';
export const router = express.Router();

router.get(
  '/:searchRequestId',
  validate({ schema: getGallerySchema, source: 'params' }),
  getGallery,
);
