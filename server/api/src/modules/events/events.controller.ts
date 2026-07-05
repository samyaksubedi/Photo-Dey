import type { RequestHandler } from 'express';
import { eventServices } from './events.service.js';
import type {
  DeleteEventInput,
  GetEventInput,
  GetStatusSchema,
} from './events.schema.js';
import { ApiResponse } from '../../utils/api-output.util.js';

export const createEvents: RequestHandler = async (req, res, next) => {
  try {
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
    const params = req.params as GetStatusSchema;
    const status = await eventServices.getStatus({ eventId: params.eventId });
    return res
      .status(200)
      .json(new ApiResponse(200, { status }, 'Status fetched successfully'));
  } catch (error) {
    next(error);
  }
};
