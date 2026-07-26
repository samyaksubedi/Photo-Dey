import { ApiError } from '../../utils/api-output.util.js';
import { searchRequestRepository } from '../search-request/search_req.repository.js';
import type { GetGalleryInput } from './galleries.schema.js';
import { guestPhotoMatchRepository } from './guest_photo_match.reposiotory.js';

const getGallery = async (data: GetGalleryInput) => {
  const searchRequest = await searchRequestRepository.findById(
    data.searchRequestId,
  );
  if (!searchRequest) {
    throw new ApiError(404, 'Search request not found');
  }

  if (
    searchRequest.status === 'PENDING' ||
    searchRequest.status === 'PROCESSING'
  ) {
    throw new ApiError(202, 'Search is still processing');
  }

  if (searchRequest.status === 'FAILED') {
    throw new ApiError(500, 'Search failed');
  }
  const photos = await guestPhotoMatchRepository.findBySearchRequestId(
    data.searchRequestId,
  );
  return photos;
};
export const galleryServices = {
  getGallery,
};
