import type { tryCatch } from 'bullmq';
import type { RequestHandler } from 'express';
import { aiServices } from './ai.service.js';
import { ApiResponse } from '../../utils/api-output.util.js';
import type {
  HandlePhotoStatusChangedInput,
  HandleSearchStatusChangedInput,
} from './ai.schema.js';
export const handlePhotoStatusChanged: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const body = req.body as HandlePhotoStatusChangedInput;
    await aiServices.handlePhotoStatusChanged(body);
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Handled photo status changed'));
  } catch (error) {
    next(error);
  }
};
export const handleSearchStatusChanged: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const body = req.body as HandleSearchStatusChangedInput;
    await aiServices.handleSearchStatusChanged(body);
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Handled search status changed !'));
  } catch (error) {
    next(error);
  }
};
