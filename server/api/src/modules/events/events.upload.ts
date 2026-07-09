// Handles medias to be uploaded to Cloudinary for frontend preview :)

import { cloudinary } from '../../configs/cloudinary.config.js';
import { logger } from '../../configs/logger.config.js';
import { ApiError } from '../../utils/api-output.util.js';

const CLOUDINARY_FOLDERS = {
  image: 'PhotoDey/image',
};

type UploadSourceFileInput = {
  filePath: string;
  type: 'image';
};
export const uploadSourceFile = async (data: UploadSourceFileInput) => {
  const folder = CLOUDINARY_FOLDERS[data.type];

  if (!folder) {
    throw new ApiError(400, `Unsupported source type: ${data.type}`);
  }

  const uploadResult = await cloudinary.uploader.upload(data.filePath, {
    folder,
    resource_type: 'image',
  });
  if (!uploadResult?.public_id || !uploadResult?.secure_url) {
    throw new ApiError(500, 'Cloudinary upload failed');
  }
  return {
    publicId: uploadResult.public_id,
    secureUrl: uploadResult.secure_url,
  };
};

// Delete asset from Cloudinary using publicId
type DeleteSourceFileInput = {
  publicId: string;
  type: 'image';
};
export const deleteSourceFile = async (data: DeleteSourceFileInput) => {
  const result = await cloudinary.uploader.destroy(data.publicId, {
    resource_type: 'image',
  });

  if (result.result !== 'ok') {
    throw new ApiError(
      400,
      `Failed to delete asset from Cloudinary: ${result.result}`,
    );
  }

  return {
    success: true,
    result: result.result,
  };
};
