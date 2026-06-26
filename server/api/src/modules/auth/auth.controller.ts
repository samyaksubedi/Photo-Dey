import type { RequestHandler } from 'express';
import type { signUpInput } from './auth.schema.js';
import { authService } from './auth.service.js';
import { ApiResponse } from '../../utils/api-output.util.js';
export const signUp: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as signUpInput;
    const user = await authService.signUp(body);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user,
          'User Registered Successfully! Please check your Email and Verify it.',
        ),
      );
  } catch (error) {
    // console.log(error)
    next(error);
  }
};
// export const verifyUser: RequestHandler = async (req, res) => {};
// export const resendverificationToken: RequestHandler = async (req, res) => {};
// export const signIn: RequestHandler = async (req, res) => {};
// export const logout: RequestHandler = async (req, res) => {};
// export const logoutFromAllDevices: RequestHandler = async (req, res) => {};
// export const getAllLoggedInDeviceInfo: RequestHandler = async (req, res) => {};
// export const refresh: RequestHandler = async (req, res) => {};
// export const getMe: RequestHandler = async (req, res) => {};
