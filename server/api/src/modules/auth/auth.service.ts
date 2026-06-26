import { ApiError } from '../../utils/api-output.util.js';
import { hashPassword } from './auth.crypto.js';
import { sendWelcomeEmail } from './auth.email.js';
import type { signInInput, signUpInput } from './auth.schema.js';
import { generateEmailVerificationToken } from './auth.tokens.js';
import { userRepository } from './user.repository.js';

const signUp = async (data: signUpInput) => {
  const userExists = await userRepository.userExists({ email: data.email });
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
// const verifyUser = async (data) => {};
// const resendVerificationToken = async (data) => {};
// const signIn = async (data: signInInput) => {};
// const logout = async (data) => {};
// const logoutFromAllDevices = async (data) => {};
// const refresh = async (data) => {};
// const getAllLoggedInDeviceInfo = async (data) => {};
// const getMe = async (data) => {};

export const authService = { signUp };
