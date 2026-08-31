import { prisma } from '../../db/db.client.js';
import type { Prisma } from '../../generated/prisma/client.js';
import type { AdminEventsQuery, AdminUsersQuery } from './admin.schema.js';

const eventStatuses = [
  'CREATED',
  'PROCESSING',
  'COMPLETED',
  'PARTIAL_FAILURE',
  'FAILED',
] as const;

const photoStatuses = [
  'PENDING_UPLOAD',
  'UPLOADED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
] as const;

const getOverview = async () => {
  const [
    totalUsers,
    verifiedUsers,
    adminUsers,
    totalEvents,
    totalPhotos,
    eventStatusCounts,
    photoStatusCounts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isVerified: true } }),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.event.count(),
    prisma.photo.count(),
    prisma.event.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.photo.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  const eventsByStatus = Object.fromEntries(
    eventStatuses.map((status) => [status, 0]),
  ) as Record<(typeof eventStatuses)[number], number>;
  for (const item of eventStatusCounts) eventsByStatus[item.status] = item._count._all;

  const photosByStatus = Object.fromEntries(
    photoStatuses.map((status) => [status, 0]),
  ) as Record<(typeof photoStatuses)[number], number>;
  for (const item of photoStatusCounts) photosByStatus[item.status] = item._count._all;

  return {
    totals: {
      totalUsers,
      verifiedUsers,
      adminUsers,
      totalEvents,
      totalPhotos,
    },
    eventsByStatus,
    photosByStatus,
  };
};

const getUsers = async (data: AdminUsersQuery) => {
  const where: Prisma.UserWhereInput = data.search
    ? {
        OR: [
          { name: { contains: data.search, mode: 'insensitive' } },
          { email: { contains: data.search, mode: 'insensitive' } },
        ],
      }
    : {};

  const orderBy = [
    { createdAt: 'desc' },
    { id: 'desc' },
  ] satisfies Prisma.UserOrderByWithRelationInput[];
  const select = {
    id: true,
    name: true,
    email: true,
    role: true,
    isVerified: true,
    createdAt: true,
    _count: { select: { events: true } },
  } satisfies Prisma.UserSelect;
  const query = {
    where,
    take: data.limit + 1,
    orderBy,
    select,
  };
  const rows = data.cursor
    ? await prisma.user.findMany({
        ...query,
        cursor: { id: data.cursor },
        skip: 1,
      })
    : await prisma.user.findMany(query);
  const hasMore = rows.length > data.limit;
  const items = hasMore ? rows.slice(0, data.limit) : rows;

  return {
    items: items.map(({ _count, ...user }) => ({
      ...user,
      eventCount: _count.events,
    })),
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
  };
};

const getEvents = async (data: AdminEventsQuery) => {
  const where: Prisma.EventWhereInput = {
    ...(data.status ? { status: data.status } : {}),
    ...(data.search
      ? {
          OR: [
            { name: { contains: data.search, mode: 'insensitive' } },
            {
              user: {
                is: { name: { contains: data.search, mode: 'insensitive' } },
              },
            },
            {
              user: {
                is: { email: { contains: data.search, mode: 'insensitive' } },
              },
            },
          ],
        }
      : {}),
  };

  const orderBy = [
    { createdAt: 'desc' },
    { id: 'desc' },
  ] satisfies Prisma.EventOrderByWithRelationInput[];
  const select = {
    id: true,
    name: true,
    status: true,
    publicEnabled: true,
    totalPhotos: true,
    receivedPhotos: true,
    uploadedPhotos: true,
    processingPhotos: true,
    completedPhotos: true,
    failedPhotos: true,
    createdAt: true,
    user: { select: { id: true, name: true, email: true } },
  } satisfies Prisma.EventSelect;
  const query = {
    where,
    take: data.limit + 1,
    orderBy,
    select,
  };
  const rows = data.cursor
    ? await prisma.event.findMany({
        ...query,
        cursor: { id: data.cursor },
        skip: 1,
      })
    : await prisma.event.findMany(query);
  const hasMore = rows.length > data.limit;
  const items = hasMore ? rows.slice(0, data.limit) : rows;

  return {
    items,
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
  };
};

export const adminRepository = { getOverview, getUsers, getEvents };
