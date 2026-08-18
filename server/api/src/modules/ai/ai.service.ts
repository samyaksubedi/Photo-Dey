import { envVariables } from '../../configs/env.config.js';
import { ApiError } from '../../utils/api-output.util.js';
import { eventRepository } from '../events/events.repository.js';
import { guestPhotoMatchRepository } from '../galleries/guest_photo_match.reposiotory.js';
import { photoRepository } from '../photos/photos.repository.js';
import { searchRequestRepository } from '../search-request/search_req.repository.js';
import { sendMessage } from '../telegram/telegram.api.js';
import type {
  HandlePhotoStatusChangedInput,
  HandleSearchStatusChangedInput,
} from './ai.schema.js';
import {
  buildSearchCompletionMessage,
  hasSearchMatches,
} from './search-result.util.js';

const handlePhotoStatusChanged = async (
  data: HandlePhotoStatusChangedInput,
) => {
  // Status sent by ai service (python ) will be PROCESSING , COMPLETED, FAILED

  const photo = await photoRepository.findById(data.photoId);

  if (!photo) {
    throw new ApiError(404, 'Photo not found');
  }

  const event = await eventRepository.findById(photo.eventId);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // update the status for the photo
  await photoRepository.updatePhoto(data.photoId, {
    status: data.status,
  });

  switch (data.status) {
    case 'PROCESSING': {
      await eventRepository.updateEventInternal(event.id, {
        processingPhotos: {
          increment: 1,
        },
      });

      break;
    }

    case 'COMPLETED': {
      await eventRepository.updateEventInternal(event.id, {
        processingPhotos: {
          decrement: 1,
        },
        completedPhotos: {
          increment: 1,
        },
      });

      break;
    }

    case 'FAILED': {
      await eventRepository.updateEventInternal(event.id, {
        processingPhotos: {
          decrement: 1,
        },
        failedPhotos: {
          increment: 1,
        },
      });

      break;
    }

    default:
      break;
  }

  // Fetch latest counters after atomic update
  const updatedEvent = await eventRepository.findById(event.id);

  if (!updatedEvent) {
    return;
  }

  let newStatus = updatedEvent.status;

  if (updatedEvent.completedPhotos === updatedEvent.totalPhotos) {
    newStatus = 'COMPLETED';
  } else if (
    updatedEvent.completedPhotos + updatedEvent.failedPhotos ===
    updatedEvent.totalPhotos
  ) {
    newStatus =
      updatedEvent.completedPhotos === 0 ? 'FAILED' : 'PARTIAL_FAILURE';
  } else {
    newStatus = 'PROCESSING';
  }

  if (newStatus !== updatedEvent.status) {
    await eventRepository.updateEventInternal(updatedEvent.id, {
      status: newStatus,
    });
  }
};
const handleSearchStatusChanged = async (
  data: HandleSearchStatusChangedInput,
) => {
  // Status sent by ai service (python) will be PROCESSING, COMPLETED, FAILED
  // Update searchStatus and if COMPLETED : construct gallery link and send message via telegram : ) else just update status

  const searchRequest = await searchRequestRepository.findById(
    data.searchRequestId,
  );

  if (!searchRequest) {
    throw new ApiError(404, 'Search request not found');
  }

  if (data.status === 'PROCESSING') {
    await searchRequestRepository.updateSearchRequest(data.searchRequestId, {
      status: 'PROCESSING',
    });

    await sendMessage({
      chatId: searchRequest.chatId,
      text: `📸 Selfie received!

We're searching through the event photos.

This usually takes less than a minute.`,
    });

    return;
  }

  if (data.status === 'FAILED') {
    await searchRequestRepository.updateSearchRequest(data.searchRequestId, {
      status: 'FAILED',
    });

    await sendMessage({
      chatId: searchRequest.chatId,
      text: `❌ We couldn't process your selfie.

This seems to be a temporary issue.

Please upload your selfie again in a few minutes.

If the problem continues, contact the event organizer.

We apologize for the inconvenience.`,
    });

    return;
  }

  // ===========================
  // COMPLETED
  // ===========================

  const matchCount = data.matchedPhotosMetadata.length;

  if (hasSearchMatches(matchCount)) {
    await guestPhotoMatchRepository.createMany(
      data.matchedPhotosMetadata.map((photo) => ({
        searchRequestId: data.searchRequestId,
        photoId: photo.photoId,
        confidence: photo.confidence,
      })),
    );
  }

  await searchRequestRepository.updateSearchRequest(data.searchRequestId, {
    status: 'COMPLETED',
    matchedPhotosCount: matchCount,
  });

  if (!hasSearchMatches(matchCount)) {
    await sendMessage({
      chatId: searchRequest.chatId,
      text: buildSearchCompletionMessage({ matchCount }),
    });

    return;
  }

  const GALLERY_LINK = `${envVariables.CLIENT_URL}/gallery/${data.searchRequestId}`;

  await sendMessage({
    chatId: searchRequest.chatId,
    text: buildSearchCompletionMessage({
      matchCount,
      galleryLink: GALLERY_LINK,
    }),
  });
};
export const aiServices = {
  handlePhotoStatusChanged,
  handleSearchStatusChanged,
};
