import type { RequestHandler } from 'express';
import { ApiResponse } from '../../utils/api-output.util.js';
import type { AdminEventsQuery, AdminUsersQuery } from './admin.schema.js';
import { adminServices } from './admin.service.js';

export const getOverview: RequestHandler = async (req, res, next) => {
  try {
    const overview = await adminServices.getOverview();
    return res
      .status(200)
      .json(new ApiResponse(200, { overview }, 'Admin overview fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await adminServices.getUsers(
      res.locals.validatedQuery as AdminUsersQuery,
    );
    return res
      .status(200)
      .json(new ApiResponse(200, users, 'Admin users fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getEvents: RequestHandler = async (req, res, next) => {
  try {
    const events = await adminServices.getEvents(
      res.locals.validatedQuery as AdminEventsQuery,
    );
    return res
      .status(200)
      .json(new ApiResponse(200, events, 'Admin events fetched successfully'));
  } catch (error) {
    next(error);
  }
};
