import type { RequestHandler } from 'express';
import { ApiError } from '../utils/api-output.util.js';

export const authorizeAdmin: RequestHandler = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Access denied'));
  }

  next();
};
