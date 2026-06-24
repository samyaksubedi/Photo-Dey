import express from 'express';
import cors from 'cors';
const app = express();

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.send({ status: 'Healthy' });
});

// app.use('api/v1/auth', authRouter);

export { app };
