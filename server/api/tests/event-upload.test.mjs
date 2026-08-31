import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getBatchAcceptancePlan,
  getEventStatusFromCounters,
  getPhotoBatchBytes,
  getPhotoDeletionCounterChanges,
  isPhotoBatchWithinLimit,
  MAX_PHOTO_BATCH_BYTES,
} from '../dist/modules/events/event-upload.util.js';
import {
  createEventSchema,
  uploadPhotoBatchSchema,
} from '../dist/modules/events/events.schema.js';

test('validates the metadata-only create-event contract', () => {
  assert.deepEqual(
    createEventSchema.parse({
      name: '  Maya & Aarav  ',
      expectedTotalPhotos: 500,
    }),
    { name: 'Maya & Aarav', expectedTotalPhotos: 500 },
  );
  assert.equal(
    createEventSchema.safeParse({ name: 'Empty', expectedTotalPhotos: 0 }).success,
    false,
  );
});

test('requires a UUID client batch id', () => {
  assert.equal(
    uploadPhotoBatchSchema.safeParse({
      clientBatchId: '189218d8-e8d9-4fba-9f2c-df36d2ace222',
    }).success,
    true,
  );
  assert.equal(
    uploadPhotoBatchSchema.safeParse({ clientBatchId: 'batch-one' }).success,
    false,
  );
});

test('enforces the aggregate 80 MiB photo batch limit', () => {
  assert.equal(
    getPhotoBatchBytes([{ size: 20 }, { size: 22 }]),
    42,
  );
  assert.equal(
    isPhotoBatchWithinLimit([{ size: MAX_PHOTO_BATCH_BYTES }]),
    true,
  );
  assert.equal(
    isPhotoBatchWithinLimit([{ size: MAX_PHOTO_BATCH_BYTES + 1 }]),
    false,
  );
});

test('initial batches fill the expectation without increasing totalPhotos', () => {
  assert.deepEqual(
    getBatchAcceptancePlan({
      totalPhotos: 500,
      receivedPhotos: 120,
      batchPhotoCount: 80,
    }),
    {
      isInitialUpload: true,
      totalPhotos: 500,
      receivedPhotos: 200,
    },
  );
  assert.throws(
    () =>
      getBatchAcceptancePlan({
        totalPhotos: 500,
        receivedPhotos: 490,
        batchPhotoCount: 11,
      }),
    /10 initial photo/,
  );
});

test('later batches increase both actual total and received counters', () => {
  assert.deepEqual(
    getBatchAcceptancePlan({
      totalPhotos: 500,
      receivedPhotos: 500,
      batchPhotoCount: 25,
    }),
    {
      isInitialUpload: false,
      totalPhotos: 525,
      receivedPhotos: 525,
    },
  );
});

test('photo deletion selects the correct counter decrements and event status', () => {
  assert.deepEqual(
    getPhotoDeletionCounterChanges({
      status: 'COMPLETED',
      secureUrl: 'https://images.test/photo.jpg',
    }),
    {
      totalPhotos: -1,
      receivedPhotos: -1,
      uploadedPhotos: -1,
      processingPhotos: 0,
      completedPhotos: -1,
      failedPhotos: 0,
    },
  );
  assert.equal(
    getEventStatusFromCounters({
      totalPhotos: 4,
      completedPhotos: 3,
      failedPhotos: 1,
    }),
    'PARTIAL_FAILURE',
  );
  assert.equal(
    getEventStatusFromCounters({
      totalPhotos: 0,
      completedPhotos: 0,
      failedPhotos: 0,
    }),
    'CREATED',
  );
});
