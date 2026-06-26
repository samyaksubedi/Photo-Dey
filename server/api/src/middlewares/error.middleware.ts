import { logger } from '../configs/logger.config.js';
import { ApiError } from '../utils/api-output.util.js';
import type { ErrorRequestHandler } from 'express';
const errorMiddleware: ErrorRequestHandler = async (err, req, res, next) => {
  try {
    if (err instanceof ApiError) {
      logger.warn('Predicted Error :', {
        method: req.method,
        route: req.originalUrl,
        message: err.message,
      });
      return res.status(err.statusCode).json(err);
    }
    if (err instanceof Error) {
      logger.error('Unhandled Error :', {
        method: req.method,
        route: req.originalUrl,
        message: err.message,
        stack: err.stack,
      });
    }
    logger.error('Unhandled Error :', {
      error: err,
    });
    return res.status(500).json(new ApiError(500, 'Internal Server Error'));
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error in errorMiddleware 💀', {
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error('Error in errorMiddleware', {
        error,
      });
    }
  }
};

export { errorMiddleware };
