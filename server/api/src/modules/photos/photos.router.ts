import express from 'express';
import { deletePhoto, getPhoto, getPhotos } from './photos.controller.js';
import { authenticateUser } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  deletePhotoSchema,
  getPhotoSchema,
  getPhotosSchema,
} from './photos.schema.js';

export const router = express.Router();
router.get(
  '/event/:eventId',
  authenticateUser,
  validate({ schema: getPhotosSchema, source: 'params' }),
  getPhotos,
);
router.get(
  '/:photoId',
  authenticateUser,
  validate({ schema: getPhotoSchema, source: 'params' }),
  getPhoto,
);
router.delete(
  '/:photoId',
  authenticateUser,
  validate({ schema: deletePhotoSchema, source: 'params' }),
  deletePhoto,
);
