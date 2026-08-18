import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { router as authRouter } from './modules/auth/auth.router.js';
import { router as eventsRouter } from './modules/events/events.router.js';
import { router as photosRouter } from './modules/photos/photos.router.js';
import { router as aiRouter } from './modules/ai/ai.router.js';
// import { router as adminRouter } from './modules/admin/admin.router.js';
import { router as telegramRouter } from './modules/telegram/telegram.router.js';
import { router as galleriesRouter } from './modules/galleries/galleries.router.js';
import { router as publicEventsRouter } from './modules/public-events/public-events.router.js';
import { envVariables } from './configs/env.config.js';

const app = express();

app.use(
  cors({
    origin: envVariables.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', true); // Get Real IP Address when using  Nginx
app.get('/', (req, res) => {
  res.send({ status: 'Healthy' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/photos', photosRouter);
app.use('/api/v1/ai', aiRouter);
// app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/galleries', galleriesRouter);
app.use('/api/v1/telegram', telegramRouter);
app.use('/api/v1/public/events', publicEventsRouter);
app.use(errorMiddleware); // Global Error Middleware - Should always be in the end of the middleware

export { app };
