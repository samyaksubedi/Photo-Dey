import type { tryCatch } from 'bullmq';
import type { RequestHandler } from 'express';
import {
  webhooksServices,
  type UpdateEventInput,
  type UpdatePhotoInput,
} from './webhooks.service.js';
import { ApiResponse } from '../../utils/api-output.util.js';
export const updateEvent: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as UpdateEventInput;
    await webhooksServices.updateEvent(body);
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Event updated successfully'));
  } catch (error) {
    next(error);
  }
}; 
export const updatePhoto: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as UpdatePhotoInput;
    await webhooksServices.updatePhoto(body);
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Photo updated successfully'));
  } catch (error) {
    next(error);
  }
};
