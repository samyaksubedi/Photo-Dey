import type { RequestHandler } from 'express';
import { ApiResponse } from '../../utils/api-output.util.js';
import type { GetPublicEventInput } from './public-events.schema.js';
import { publicEventServices } from './public-events.service.js';

export const getPublicEvent: RequestHandler = async (req, res, next) => {
  try {
    const params = req.params as GetPublicEventInput;
    const event = await publicEventServices.getPublicEvent(params.publicCode);
    return res
      .status(200)
      .json(new ApiResponse(200, { event }, 'Public event fetched successfully'));
  } catch (error) {
    next(error);
  }
};
