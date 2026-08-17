// Handles medias to be uploaded to Cloudinary for frontend preview :)

import { cloudinary } from '../../configs/cloudinary.config.js';
import { logger } from '../../configs/logger.config.js';
import { ApiError } from '../../utils/api-output.util.js';

const CLOUDINARY_FOLDERS = {
  'event-photo': 'PhotoDey/image',
  'telegram-selfie': 'PhotoDey/image',
};

type UploadSourceFileInput = {
  filePath: string;
  jobType: 'event-photo' | 'telegram-selfie';
};
export const uploadSourceFile = async (data: UploadSourceFileInput) => {
  const folder = CLOUDINARY_FOLDERS[data.jobType];

  if (!folder) {
    throw new ApiError(400, `Unsupported source type: ${data.jobType}`);
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

type DeleteSourceFilesInput = {
  publicIds: string[];
  type: 'image';
};

const CLOUDINARY_DELETE_BATCH_SIZE = 100;

export const deleteSourceFiles = async (data: DeleteSourceFilesInput) => {
  const publicIds = [...new Set(data.publicIds)];

  for (
    let index = 0;
    index < publicIds.length;
    index += CLOUDINARY_DELETE_BATCH_SIZE
  ) {
    const batch = publicIds.slice(index, index + CLOUDINARY_DELETE_BATCH_SIZE);
    const result = await cloudinary.api.delete_resources(batch, {
      resource_type: data.type,
      type: 'upload',
    });

    const failedPublicIds = batch.filter((publicId) => {
      const deletionStatus = result.deleted?.[publicId];
      return deletionStatus !== 'deleted' && deletionStatus !== 'not_found';
    });

    if (failedPublicIds.length > 0) {
      throw new ApiError(
        500,
        `Failed to delete ${failedPublicIds.length} Cloudinary asset(s)`,
      );
    }
  }

  return {
    success: true,
    deletedCount: publicIds.length,
  };
};
