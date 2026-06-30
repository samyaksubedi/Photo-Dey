import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { envVariables } from '../../configs/env.config.js';
import type { AccessTokenPayload } from './auth.types.js';

export const generateEmailVerificationToken = () => {
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationTokenExpires = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  );
  return { emailVerificationToken, emailVerificationTokenExpires };
};

export const generateAccessToken = ({
  email,
  id,
  sessionId,
}: AccessTokenPayload) => {
  return jwt.sign({ id, email, sessionId }, envVariables.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = () => {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); //30 days
  return { refreshToken, refreshTokenExpires };
};
