import type { RequestHandler } from 'express';
import type {
  EmailInput,
  SignInInput,
  SignUpInput,
  VerifyUserInput,
} from './auth.schema.js';
import { authService } from './auth.service.js';
import { ApiError, ApiResponse } from '../../utils/api-output.util.js';
import { getDeviceInfo } from './auth.device.js';
import { envVariables } from '../../configs/env.config.js';
export const signUp: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as SignUpInput;
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
    next(error);
  }
};
export const resendverificationToken: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const body = req.body as EmailInput;
    await authService.resendVerificationToken(body);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          'Verification email resent, Check your email',
        ),
      );
  } catch (error) {
    next(error);
  }
};
export const verifyUser: RequestHandler = async (req, res, next) => {
  try {
    const params = req.params as VerifyUserInput;
    await authService.verifyUser(params);
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'User verified successfully'));
  } catch (error) {
    next(error);
  }
};
export const signIn: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as SignInInput;
    const ipAddress = req.ip ?? 'Unknown';

    const deviceInfo = getDeviceInfo(req.headers['user-agent'] ?? '');

    const { accessToken, refreshToken, refreshTokenExpires, user } =
      await authService.signIn({ ...body, deviceInfo, ipAddress });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: envVariables.NODE_ENV == 'production',
      sameSite: 'strict',
      expires: refreshTokenExpires,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken, user },
          'User loggedIn successfully',
        ),
      );
  } catch (error) {
    next(error);
  }
};
export const logout: RequestHandler = async (req, res, next) => {
  try {
    const { sessionId } = req.user;
    await authService.logout({ sessionId });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: envVariables.NODE_ENV == 'production',
      sameSite: 'strict',
    });
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'User logged out successfully'));
  } catch (error) {
    next(error);
  }
};
export const logoutFromAllDevices: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const deviceCount = await authService.logoutFromAllDevices({ userId });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: envVariables.NODE_ENV == 'production',
      sameSite: 'strict',
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          `User logged out from all ${deviceCount} devices`,
        ),
      );
  } catch (error) {
    next(error);
  }
};
export const getAllLoggedInDeviceInfo: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const userId = req.user.id;
    const sessionInfo = await authService.getAllLoggedInDeviceInfo({ userId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...sessionInfo },
          'Users sessions fetched successfully',
        ),
      );
  } catch (error) {
    next(error);
  }
};
export const refresh: RequestHandler = async (req, res, next) => {
  try {
    if (!req.cookies?.refreshToken) {
      return res
        .status(400)
        .json(new ApiError(400, 'refreshToken is missing in cookies !'));
    }
    const accessToken = await authService.refresh({
      refreshToken: req.cookies.refreshToken,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken },
          'Access token generated successfully',
        ),
      );
  } catch (error) {
    next(error);
  }
};
export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.getMe({ userId });
    return res
      .status(200)
      .json(new ApiResponse(200, { ...user }, 'User fetched successfully'));
  } catch (error) {
    next(error);
  }
};
