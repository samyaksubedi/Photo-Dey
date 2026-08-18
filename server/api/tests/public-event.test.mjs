import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildTelegramDeepLink,
  generatePublicCode,
  getPublicEventAvailability,
  isEventPubliclySearchable,
} from '../dist/modules/events/event-public.util.js';

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
