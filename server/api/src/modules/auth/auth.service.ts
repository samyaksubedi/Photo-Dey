import { prisma } from '../../db/db.client.js';
import { ApiError } from '../../utils/api-output.util.js';
import { hashPassword } from './auth.crypto.js';
import type { signInInput, signUpInput } from './auth.schema.js';

const signUp = async (data: signUpInput) => {
  const userExists = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });
  if (userExists) {
    throw new ApiError(400, 'User already exists with this email');
  }
  const passwordHash = await hashPassword(data.password);
  
};
// const verifyUser = async (data) => {};
// const resendVerificationToken = async (data) => {};
// const signIn = async (data: signInInput) => {};
// const logout = async (data) => {};
// const logoutFromAllDevices = async (data) => {};
// const refresh = async (data) => {};
// const getAllLoggedInDeviceInfo = async (data) => {};
// const getMe = async (data) => {};
