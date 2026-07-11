import type { RequestHandler } from 'express';
import type {
  DeletePhotoInput,
  GetPhotoInput,
  GetPhotosInput,
} from './photos.schema.js';
import { photoServices } from './photos.service.js';
import { ApiResponse } from '../../utils/api-output.util.js';

export const getPhotos: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const params = req.params as GetPhotosInput;
    const photos = await photoServices.getPhotos({
      userId,
      eventId: params.eventId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { photos }, 'Photos fetched successfully'));
  } catch (error) {
    next(error);
  }
};
export const getPhoto: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const params = req.params as GetPhotoInput;
    const photo = await photoServices.getPhoto({
      userId,
      photoId: params.photoId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { photo }, 'Photo fetched successfully'));
  } catch (error) {
    next(error);
  }
};
export const deletePhoto: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const params = req.params as DeletePhotoInput;
    await photoServices.deletePhoto({ userId, photoId: params.photoId });
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Photo deleted successfully'));
  } catch (error) {
    next(error);
  }
};
