export const MAX_PHOTO_BATCH_BYTES = 80 * 1024 * 1024;
export const MAX_EVENT_PHOTOS = 5000;

export const getPhotoBatchBytes = (files: Array<{ size: number }>) =>
  files.reduce((total, file) => total + file.size, 0);

export const isPhotoBatchWithinLimit = (files: Array<{ size: number }>) =>
  getPhotoBatchBytes(files) <= MAX_PHOTO_BATCH_BYTES;

export const getBatchAcceptancePlan = (data: {
  totalPhotos: number;
  receivedPhotos: number;
  batchPhotoCount: number;
}) => {
  const remainingInitialPhotos = data.totalPhotos - data.receivedPhotos;
  const isInitialUpload = remainingInitialPhotos > 0;

  if (isInitialUpload && data.batchPhotoCount > remainingInitialPhotos) {
    throw new RangeError(
      `Batch exceeds the ${remainingInitialPhotos} initial photo(s) still expected`,
    );
  }

  const totalPhotos = data.totalPhotos + (isInitialUpload ? 0 : data.batchPhotoCount);
  if (totalPhotos > MAX_EVENT_PHOTOS) {
    throw new RangeError(`An event cannot contain more than ${MAX_EVENT_PHOTOS} photos`);
  }

  return {
    isInitialUpload,
    totalPhotos,
    receivedPhotos: data.receivedPhotos + data.batchPhotoCount,
  };
};

type PhotoCounterState = {
  status: 'PENDING_UPLOAD' | 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  secureUrl: string | null;
};

export const getPhotoDeletionCounterChanges = (photo: PhotoCounterState) => ({
  totalPhotos: -1,
  receivedPhotos: -1,
  uploadedPhotos: photo.secureUrl ? -1 : 0,
  processingPhotos: photo.status === 'PROCESSING' ? -1 : 0,
  completedPhotos: photo.status === 'COMPLETED' ? -1 : 0,
  failedPhotos: photo.status === 'FAILED' ? -1 : 0,
});

type EventCounters = {
  totalPhotos: number;
  completedPhotos: number;
  failedPhotos: number;
};

export const getEventStatusFromCounters = (event: EventCounters) => {
  if (event.totalPhotos <= 0) return 'CREATED' as const;

  const terminalPhotos = event.completedPhotos + event.failedPhotos;
  if (terminalPhotos < event.totalPhotos) return 'PROCESSING' as const;
  if (event.completedPhotos === 0) return 'FAILED' as const;
  if (event.failedPhotos > 0) return 'PARTIAL_FAILURE' as const;
  return 'COMPLETED' as const;
};
