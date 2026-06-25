import express from 'express';
import { send } from 'node:process';

const router = express.Router();

router.get('/', (req, res) => {
  res.send({ route: 'api/v1/auth' });
});

router.post('/signUp');
router.post('/resend-verification');
router.get('/verify/:token');
router.post('/signIn');
router.post('/logout');
router.post('/logout-all');
router.get('/indo-loggedIn-devices');
router.post('/refresh');
router.get('/me');
