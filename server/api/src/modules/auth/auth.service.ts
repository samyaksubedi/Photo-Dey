import { ApiError } from '../../utils/api-output.util.js';
import { comparePassword, hashPassword } from './auth.crypto.js';
import { resendVerificationEmail, sendWelcomeEmail } from './auth.email.js';
import type {
  EmailInput,
  SignUpInput,
  VerifyUserInput,
} from './auth.schema.js';
import {
  generateAccessToken,
  generateEmailVerificationToken,
  generateRefreshToken,
} from './auth.tokens.js';
import type { SignInServiceInput } from './auth.types.js';
import { userSessionRepository } from './user-session.repository.js';
import { userRepository } from './user.repository.js';

const signUp = async (data: SignUpInput) => {
  const userExists = await userRepository.findByEmail(data.email);

  if (userExists)
    throw new ApiError(400, 'User already exists with this email');
  const passwordHash = await hashPassword(data.password);
  const { emailVerificationToken, emailVerificationTokenExpires } =
    generateEmailVerificationToken();
  const user = await userRepository.createUser({
    name: data.name,
    email: data.email,
    passwordHash,
    emailVerificationToken,
    emailVerificationTokenExpires,
  });
  await sendWelcomeEmail({
    to: data.email,
    name: data.name,
    emailVerificationToken: emailVerificationToken,
  });
  return user;
};
const resendVerificationToken = async (data: EmailInput) => {
  const user = await userRepository.findByEmail(data.email);

  if (!user) throw new ApiError(404, 'User not found with this email');
  const isUserVerified = user.isVerified;
  if (isUserVerified) {
    throw new ApiError(400, 'User is already Verified');
  }
  const { emailVerificationToken, emailVerificationTokenExpires } =
    generateEmailVerificationToken();

  await userRepository.updateEmailVerificationTokenAndExpiry({
    email: data.email,
    emailVerificationToken: emailVerificationToken,
    emailVerificationTokenExpires: emailVerificationTokenExpires,
  });
  await resendVerificationEmail({
    emailVerificationToken,
    name: user.name,
    to: data.email,
  });
};
const verifyUser = async (data: VerifyUserInput) => {
  const user = await userRepository.findByEmailVerificationToken(data.token);
  if (!user) {
    throw new ApiError(400, 'Verification line invalid');
  }
  if (
    !user.emailVerificationTokenExpires ||
    user.emailVerificationTokenExpires < new Date()
  ) {
    throw new ApiError(400, 'Verification link expired');
  }
  await userRepository.updateUser(user.id, {
    isVerified: true,
    emailVerificationToken: null,
    emailVerificationTokenExpires: null,
  });
};
const signIn = async (data: SignInServiceInput) => {
  const user = await userRepository.findByEmail(data.email);
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }
  if (!user.isVerified) {
    throw new ApiError(401, 'Please verify your email first');
  }
  const isMatch = await comparePassword(data.password, user.passwordHash ?? '');
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }
  const { refreshToken, refreshTokenExpires } = generateRefreshToken();
  const userSession = await userSessionRepository.createUserSession({
    refreshToken,
    refreshTokenExpires,
    userId: user.id,
    deviceInfo: data.deviceInfo,
    ipAddress: data.ipAddress,
  });
  const accessToken = generateAccessToken(user.id, user.email, userSession.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
    refreshTokenExpires,
  };
};
// const logout = async (data) => {};
// const logoutFromAllDevices = async (data) => {};
// const refresh = async (data) => {};
// const getAllLoggedInDeviceInfo = async (data) => {};
// const getMe = async (data) => {};

export const authService = {
  signUp,
  resendVerificationToken,
  verifyUser,
  signIn,
};
