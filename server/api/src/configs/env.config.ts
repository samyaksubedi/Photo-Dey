import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from './logger.config.js';
// import { logger } from './logger.config.js';

dotenv.config();

const envSchema = z.object({
  // OPENAI_API_KEY: z.string().min(1),
  // TAVILY_API_KEY: z.string().min(1),
  PORT: z.string().min(1),
  GMAIL_APP_PASSWORD: z.string().min(1),
  GMAIL_USER: z.string().min(1),
  CLIENT_URL: z.string().min(1),
  SERVER_URL: z.string().min(1),
  // AI_URL: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(1),
  // WEBHOOK_SECRET: z.string().min(1),
  REDIS_URL: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production']),
  // CLOUDINARY_CLOUD_NAME: z.string().min(1),
  // CLOUDINARY_API_KEY: z.string().min(1),
  // CLOUDINARY_API_SECRET: z.string().min(1),
});

export const envVariables = envSchema.parse(process.env);

// export const envVariables = {
//   OPENAI_API_KEY: process.env.OPENAI_API_KEY,
//   TAVILY_API_KEY: process.env.TAVILY_API_KEY,
//   PORT: process.env.PORT,
//   GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
//   GMAIL_USER: process.env.GMAIL_USER,
//   CLIENT_URL: process.env.CLIENT_URL,
//   SERVER_URL: process.env.SERVER_URL,
//   AI_URL: process.env.AI_URL,
//   ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
//   WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
//   REDIS_URL: process.env.REDIS_URL,
//   DATABASE_URL: process.env.DATABASE_URL,
//   NODE_ENV: process.env.NODE_ENV,
//   CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
//   CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
//   CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
// };
