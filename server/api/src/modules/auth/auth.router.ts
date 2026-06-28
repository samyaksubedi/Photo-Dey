import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  resendVerificationTokenSchema,
  signInSchema,
  signUpSchema,
  verifyUserSchema,
} from './auth.schema.js';
import {
  resendverificationToken,
  signIn,
  signUp,
  verifyUser,
} from './auth.controller.js';

export const router = express.Router();

router.get('/', (req, res) => {
  res.send({ route: 'api/v1/auth' });
});

router.post('/signUp', validate({ schema: signUpSchema }), signUp);
router.post(
  '/resend-verification',
  validate({ schema: resendVerificationTokenSchema }),
  resendverificationToken,
);
router.get(
  '/verify/:token',
  validate({ schema: verifyUserSchema, source: 'params' }),
  verifyUser,
);
router.post('/signIn', validate({ schema: signInSchema }), signIn);
// router.post('/logout');
// router.post('/logout-all');
// router.get('/indo-loggedIn-devices');
// router.post('/refresh');
// router.get('/me');
