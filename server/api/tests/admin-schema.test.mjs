import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import {
  adminEventsQuerySchema,
  adminUsersQuerySchema,
} from '../dist/modules/admin/admin.schema.js';
import { validate } from '../dist/middlewares/validate.middleware.js';

test('admin user queries use a safe default page size', () => {
  assert.deepEqual(adminUsersQuerySchema.parse({}), { limit: 50 });
});

test('admin event queries reject unsupported status values', () => {
  assert.equal(
    adminEventsQuerySchema.safeParse({ status: 'UNKNOWN' }).success,
    false,
  );
});

test('query validation works with Express 5 getter-only req.query', async (t) => {
  const app = express();
  app.get(
    '/',
    validate({ schema: adminUsersQuerySchema, source: 'query' }),
    (_req, res) => res.status(200).json(res.locals.validatedQuery),
  );

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());

  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const response = await fetch(`http://127.0.0.1:${address.port}/?limit=25`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { limit: 25 });
});
