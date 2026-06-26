import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { router as authRouter } from './modules/auth/auth.router.js';
const app = express();

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.send({ status: 'Healthy' });
});

app.use('/api/v1/auth', authRouter);
app.use(errorMiddleware); // Global Error Middleware - Should always be in the end of the middleware

export { app };
