import type { RequestHandler } from 'express';
import { ApiError } from '../utils/api-output.util.js';
import { prisma } from '../db/db.client.js';

export const authorizeAdmin: RequestHandler = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      return next(new ApiError(403, 'Administrator access is required'));
    }
    next();
  } catch (error) {
    next(error);
  }
};
