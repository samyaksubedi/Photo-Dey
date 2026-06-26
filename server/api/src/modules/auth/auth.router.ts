import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { signUpSchema } from './auth.schema.js';
import { signUp } from './auth.controller.js';

export const router = express.Router();

router.get('/', (req, res) => {
  res.send({ route: 'api/v1/auth' });
});

router.post('/signUp', validate({ schema: signUpSchema }), signUp);
// router.post('/resend-verification');
// router.get('/verify/:token');
// router.post('/signIn');
// router.post('/logout');
// router.post('/logout-all');
// router.get('/indo-loggedIn-devices');
// router.post('/refresh');
// router.get('/me');
