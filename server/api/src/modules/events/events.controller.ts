import type { RequestHandler } from 'express';
import { eventServices } from './events.service.js';
import type {
  CreateEventBody,
  DeleteEventInput,
  GetEventInput,
  GetStatusInput,
} from './events.schema.js';
import { ApiError, ApiResponse } from '../../utils/api-output.util.js';

export const createEvents: RequestHandler = async (req, res, next) => {
  try {
    const photos = req.files as Express.Multer.File[];
    const body = req.body as CreateEventBody;
    const userId = req.user.id;
    if (!Array.isArray(photos) || photos.length === 0) {
      throw new ApiError(400, 'At least one photo is required');
    }
    const event = await eventServices.createEvents({
      name: body.name,
      photos,
      userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { event }, 'Event created successfully'));
  } catch (error) {
    next(error);
  }
};
export const getEvents: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const events = await eventServices.getEvents({ userId });
    if (!events) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            'No any events found . Please Create one !',
          ),
        );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { events }, 'Events fetched successfully !'));
  } catch (error) {
    next(error);
  }
};
export const getEvent: RequestHandler = async (req, res, next) => {
  try {
    const params = req.params as GetEventInput;
    const event = await eventServices.getEvent({ eventId: params.eventId });
    return res
      .status(200)
      .json(new ApiResponse(200, { event }, 'Event fetched successfully '));
  } catch (error) {
    next(error);
  }
};
export const deleteEvent: RequestHandler = async (req, res, next) => {
  try {
    const params = req.params as DeleteEventInput;
    await eventServices.deleteEvent({ eventId: params.eventId });
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Event deleted successfully'));
  } catch (error) {
    next(error);
  }
};
export const getStatus: RequestHandler = async (req, res, next) => {
  try {
    const params = req.params as GetStatusInput;
    const status = await eventServices.getStatus({ eventId: params.eventId });
    return res
      .status(200)
      .json(new ApiResponse(200, { status }, 'Status fetched successfully'));
  } catch (error) {
    next(error);
  }
};
