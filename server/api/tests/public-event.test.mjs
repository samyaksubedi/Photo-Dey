import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildTelegramDeepLink,
  generatePublicCode,
  getPublicEventAvailability,
  isEventPubliclySearchable,
} from '../dist/modules/events/event-public.util.js';
import {
  buildSearchCompletionMessage,
  hasSearchMatches,
} from '../dist/modules/ai/search-result.util.js';

test('generates unique Telegram-safe public codes', () => {
  const codes = new Set(Array.from({ length: 100 }, generatePublicCode));

  assert.equal(codes.size, 100);
  for (const code of codes) {
    assert.match(code, /^[A-Za-z0-9_-]{12}$/);
  }
});

test('only completed and partially completed events are searchable', () => {
  assert.equal(
    getPublicEventAvailability({
      status: 'PROCESSING',
      completedPhotos: 0,
      publicEnabled: true,
    }),
    'PROCESSING',
  );
  assert.equal(
    isEventPubliclySearchable({
      status: 'COMPLETED',
      completedPhotos: 2,
      publicEnabled: true,
    }),
    true,
  );
  assert.equal(
    isEventPubliclySearchable({
      status: 'PARTIAL_FAILURE',
      completedPhotos: 1,
      publicEnabled: true,
    }),
    true,
  );
});

test('disabled, failed, and empty events are unavailable', () => {
  assert.equal(
    getPublicEventAvailability({
      status: 'COMPLETED',
      completedPhotos: 2,
      publicEnabled: false,
    }),
    'UNAVAILABLE',
  );
  assert.equal(
    getPublicEventAvailability({
      status: 'FAILED',
      completedPhotos: 0,
      publicEnabled: true,
    }),
    'UNAVAILABLE',
  );
  assert.equal(
    isEventPubliclySearchable({
      status: 'COMPLETED',
      completedPhotos: 0,
      publicEnabled: true,
    }),
    false,
  );
});

test('builds the Telegram start link from the public code', () => {
  assert.equal(
    buildTelegramDeepLink('@PhotoDeyBot', 'A7kP9xQ2'),
    'https://t.me/PhotoDeyBot?start=A7kP9xQ2',
  );
});

test('zero-result searches send guidance without a gallery link', () => {
  const message = buildSearchCompletionMessage({ matchCount: 0 });

  assert.equal(hasSearchMatches(0), false);
  assert.match(message, /couldn't find any matching photos/);
  assert.doesNotMatch(message, /https?:\/\//);
  assert.doesNotMatch(message, /gallery is ready/i);
});

test('positive search results include the gallery link', () => {
  const galleryLink = 'https://photodey.test/gallery/search-id';
  const message = buildSearchCompletionMessage({
    matchCount: 2,
    galleryLink,
  });

  assert.equal(hasSearchMatches(2), true);
  assert.match(message, /We found 2 matching photos/);
  assert.match(message, new RegExp(galleryLink));
});
