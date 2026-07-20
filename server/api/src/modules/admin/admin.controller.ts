// import type { tryCatch } from 'bullmq';
// import type { RequestHandler } from 'express';
// import { adminServices } from './admin.service.js';
// import { ApiResponse } from '../../utils/api-output.util.js';

// const getUsers: RequestHandler = async (req, res, next) => {
//   try {
//     const users = await adminServices.getUsers();
//     return res
//       .status(200)
//       .json(new ApiResponse(200, { users }, 'Users fetched successfully'));
//   } catch (error) {
//     next(error);
//   }
// };
// const getAdmins: RequestHandler = async (req, res, next) => {
//   try {
//     const admins = await adminServices.getAdmins();
//     return res
//       .status(200)
//       .json(new ApiResponse(200, { admins }, 'Admins fetched successfully'));
//   } catch (error) {
//     next(error);
//   }
// };

// const getUserSessions: RequestHandler = async (req, res, next) => {
//   try {
//     const body = req.body as 
//     await adminServices.getUserSessions(body);
//   } catch (error) {
//     next(error);
//   }
// };
