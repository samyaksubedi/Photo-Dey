import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { router as authRouter } from './modules/auth/auth.router.js';
import { router as eventsRouter } from './modules/events/events.router.js';
import { router as photosRouter } from './modules/photos/photos.router.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.set('trust proxy', true); // Get Real IP Address when using  Nginx
app.get('/', (req, res) => {
  res.send({ status: 'Healthy' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/photos', photosRouter);
app.use(errorMiddleware); // Global Error Middleware - Should always be in the end of the middleware

export { app };
