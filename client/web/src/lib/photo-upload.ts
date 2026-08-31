import {
  ApiClientError,
  uploadEventPhotoBatch,
} from './api';

export const MAX_PHOTO_BATCH_BYTES = 80 * 1024 * 1024;
export const MAX_CONCURRENT_PHOTO_BATCHES = 3;

export type PhotoBatch = {
  id: string;
  files: File[];
  totalBytes: number;
};

export type PhotoUploadProgress = {
  totalPhotos: number;
  sentPhotos: number;
  remainingPhotos: number;
  totalBytes: number;
  transferredBytes: number;
  percent: number;
  totalBatches: number;
  completedBatches: number;
  activeBatches: number;
  waitingBatches: number;
};

export const buildPhotoBatches = (files: File[]): PhotoBatch[] => {
  const sortedFiles = [...files].sort((left, right) => left.size - right.size);
  const batches: PhotoBatch[] = [];
  let currentFiles: File[] = [];
  let currentBytes = 0;

  for (const file of sortedFiles) {
    if (file.size > MAX_PHOTO_BATCH_BYTES) {
      throw new Error(`${file.name} is larger than the batch upload limit`);
    }

    if (currentFiles.length > 0 && currentBytes + file.size > MAX_PHOTO_BATCH_BYTES) {
      batches.push({
        id: crypto.randomUUID(),
        files: currentFiles,
        totalBytes: currentBytes,
      });
      currentFiles = [];
      currentBytes = 0;
    }

    currentFiles.push(file);
    currentBytes += file.size;
  }

  if (currentFiles.length > 0) {
    batches.push({
      id: crypto.randomUUID(),
      files: currentFiles,
      totalBytes: currentBytes,
    });
  }

  return batches;
};

type UploadPhotoBatchesInput = {
  eventId: string;
  batches: PhotoBatch[];
  completedBatchIds: Set<string>;
  onProgress: (progress: PhotoUploadProgress) => void;
};

const canRetry = (error: unknown) =>
  error instanceof ApiClientError && (error.status === 0 || error.status >= 500);

export const uploadPhotoBatches = async ({
  eventId,
  batches,
  completedBatchIds,
  onProgress,
}: UploadPhotoBatchesInput) => {
  const totalPhotos = batches.reduce((total, batch) => total + batch.files.length, 0);
  const totalBytes = batches.reduce((total, batch) => total + batch.totalBytes, 0);
  const activeBytes = new Map<string, number>();
  const pendingBatches = batches.filter((batch) => !completedBatchIds.has(batch.id));
  let nextBatchIndex = 0;
  let stopped = false;
  let firstError: unknown = null;

  const emitProgress = () => {
    const completed = batches.filter((batch) => completedBatchIds.has(batch.id));
    const sentPhotos = completed.reduce((total, batch) => total + batch.files.length, 0);
    const completedBytes = completed.reduce((total, batch) => total + batch.totalBytes, 0);
    const transferredBytes = Math.min(
      totalBytes,
      completedBytes + [...activeBytes.values()].reduce((total, bytes) => total + bytes, 0),
    );

    onProgress({
      totalPhotos,
      sentPhotos,
      remainingPhotos: totalPhotos - sentPhotos,
      totalBytes,
      transferredBytes,
      percent: totalBytes ? Math.round((transferredBytes / totalBytes) * 100) : 100,
      totalBatches: batches.length,
      completedBatches: completed.length,
      activeBatches: activeBytes.size,
      waitingBatches: Math.max(
        0,
        batches.length - completed.length - activeBytes.size,
      ),
    });
  };

  const uploadBatch = async (batch: PhotoBatch) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await uploadEventPhotoBatch(
          eventId,
          batch.id,
          batch.files,
          (loaded) => {
            activeBytes.set(batch.id, Math.min(loaded, batch.totalBytes));
            emitProgress();
          },
        );
        return;
      } catch (error) {
        activeBytes.set(batch.id, 0);
        emitProgress();
        if (attempt === 2 || !canRetry(error)) throw error;
      }
    }
  };

  const worker = async () => {
    while (!stopped) {
      const batch = pendingBatches[nextBatchIndex];
      nextBatchIndex += 1;
      if (!batch) return;

      activeBytes.set(batch.id, 0);
      emitProgress();
      try {
        await uploadBatch(batch);
        activeBytes.delete(batch.id);
        completedBatchIds.add(batch.id);
        emitProgress();
      } catch (error) {
        activeBytes.delete(batch.id);
        stopped = true;
        firstError ??= error;
        emitProgress();
      }
    }
  };

  emitProgress();
  await Promise.all(
    Array.from(
      { length: Math.min(MAX_CONCURRENT_PHOTO_BATCHES, pendingBatches.length) },
      worker,
    ),
  );

  if (firstError) throw firstError;
  emitProgress();
};
