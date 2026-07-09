import { v2 as cloudinary } from 'cloudinary';
import { envVariables } from './env.config.js';
import { logger } from './logger.config.js';

cloudinary.config({
  cloud_name: envVariables.CLOUDINARY_CLOUD_NAME,
  api_key: envVariables.CLOUDINARY_API_KEY,
  api_secret: envVariables.CLOUDINARY_API_SECRET,
});

const testCloudinaryConnection = async () => {
  try {
    const res = await cloudinary.api.ping();
    logger.info('Cloudinary connected:', res);
  } catch (err) {
    if (err instanceof Error) {
      logger.error('Cloudinary connection failed:', err.message);
    }
    logger.error('Cloudinary connection failed:', err);
  }
};
export { cloudinary, testCloudinaryConnection };
