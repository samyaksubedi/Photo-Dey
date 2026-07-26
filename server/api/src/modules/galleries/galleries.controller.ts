import type { RequestHandler } from 'express';
import { galleryServices } from './galleries.service.js';
import type { GetGalleryInput } from './galleries.schema.js';
import { ApiResponse } from '../../utils/api-output.util.js';

export const getGallery: RequestHandler = async (req, res, next) => {
  try {
    const params = req.params as GetGalleryInput;
    const photos = await galleryServices.getGallery({
      searchRequestId: params.searchRequestId,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { photos },
          'Matched photos fetched successfully !',
        ),
      );
  } catch (error) {
    next(error);
  }
};
