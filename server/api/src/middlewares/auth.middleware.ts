import type { RequestHandler } from 'express';
import { ApiError } from '../utils/api-output.util.js';
import jwt from 'jsonwebtoken';
import { envVariables } from '../configs/env.config.js';
import { prisma } from '../db/db.client.js';
import type { AccessTokenPayload } from '../modules/auth/auth.types.js';

const authenticateUser: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1] ?? '';

    let decoded: AccessTokenPayload;

    try {
      decoded = jwt.verify(
        token,
        envVariables.ACCESS_TOKEN_SECRET,
      ) as AccessTokenPayload;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(
          401,
          error.name === 'TokenExpiredError'
            ? 'Token expired'
            : 'Invalid token',
        );
      }

      throw new ApiError(401, 'Invalid token');
    }
    //  Switch to redis instead of db lookups here : )
    const session = await prisma.userSession.findUnique({
      where: {
        id: decoded.sessionId,
      },
    });

    if (!session) {
      throw new ApiError(401, 'Session expired or revoked');
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export { authenticateUser };
