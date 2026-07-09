import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/api-output.util.js';

const baseUploadPath = path.resolve('./uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(baseUploadPath, { recursive: true });
    cb(null, baseUploadPath);
  },

  filename: (req, file, cb) => {
    const sanitizedFileName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${sanitizedFileName}`);
  },
});
const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new ApiError(400, 'Only JPG, JPEG, PNG, and WEBP images are allowed'),
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

export { upload };
