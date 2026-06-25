import type { RequestHandler } from 'express';
import type { signUpInput } from './auth.schema.js';
export const signUp: RequestHandler = async (req, res) => {
  const body = req.body as signUpInput;
};
export const verifyUser: RequestHandler = async (req, res) => {};
export const resendverificationToken: RequestHandler = async (req, res) => {};
export const signIn: RequestHandler = async (req, res) => {};
export const logout: RequestHandler = async (req, res) => {};
export const logoutFromAllDevices: RequestHandler = async (req, res) => {};
export const getAllLoggedInDeviceInfo: RequestHandler = async (req, res) => {};
export const refresh: RequestHandler = async (req, res) => {};
export const getMe: RequestHandler = async (req, res) => {};
