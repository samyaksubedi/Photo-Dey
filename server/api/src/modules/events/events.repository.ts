import { prisma } from '../../db/db.client.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { ApiError } from '../../utils/api-output.util.js';
import { getBatchAcceptancePlan } from './event-upload.util.js';

const createEvent = async (data: Prisma.EventUncheckedCreateInput) => {
  return await prisma.event.create({
    data: {
      ...data,
    },
    select: {
      id: true,
      publicCode: true,
      publicEnabled: true,
      name: true,
      totalPhotos: true,
      receivedPhotos: true,
      uploadedPhotos: true,
      failedPhotos: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const getEvents = async (userId: string) => {
  return await prisma.event.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      publicCode: true,
      publicEnabled: true,
      name: true,
      totalPhotos: true,
      receivedPhotos: true,
      uploadedPhotos: true,
      failedPhotos: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
const findById = async (id: string) => {
  return await prisma.event.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      publicCode: true,
      publicEnabled: true,
      userId: true,
      name: true,
      totalPhotos: true,
      receivedPhotos: true,
      uploadedPhotos: true,
      failedPhotos: true,
      status: true,
      completedPhotos: true,
      processingPhotos: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
const findByPublicCode = async (publicCode: string) => {
  return prisma.event.findUnique({
    where: {
      publicCode,
    },
    select: {
      id: true,
      publicCode: true,
      publicEnabled: true,
      name: true,
      status: true,
      completedPhotos: true,
    },
  });
};
const findByIdAndUserId = async (eventId: string, userId: string) => {
  return prisma.event.findFirst({
    where: {
      id: eventId,
      userId,
    },
  });
};
const deleteById = async (id: string) => {
  return await prisma.event.delete({
    where: {
      id,
    },
  });
};

const updateEvent = async (
  id: string,
  userId: string,
  data: Prisma.EventUpdateInput,
) => {
  await prisma.event.update({
    where: {
      id,
      userId,
    },
    data: {
      ...data,
    },
  });
};
const updateEventInternal = async (
  id: string,
  data: Prisma.EventUpdateInput,
) => {
  return prisma.event.update({
    where: {
      id,
    },
    data,
  });
};

type AcceptPhotoBatchInput = {
  eventId: string;
  userId: string;
  clientBatchId: string;
  totalBytes: number;
  photos: Array<{ path: string }>;
};

const isSerializableConflict = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 'P2034';

const acceptPhotoBatch = async (data: AcceptPhotoBatchInput) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const event = await tx.event.findFirst({
            where: { id: data.eventId, userId: data.userId },
            select: {
              id: true,
              totalPhotos: true,
              receivedPhotos: true,
            },
          });

          if (!event) throw new ApiError(404, 'Event not found');

          const existingBatch = await tx.eventUploadBatch.findUnique({
            where: {
              eventId_clientBatchId: {
                eventId: data.eventId,
                clientBatchId: data.clientBatchId,
              },
            },
            include: {
              photos: {
                select: {
                  id: true,
                  localPath: true,
                  status: true,
                },
              },
            },
          });

          if (existingBatch) {
            if (
              existingBatch.photoCount !== data.photos.length ||
              existingBatch.totalBytes !== data.totalBytes
            ) {
              throw new ApiError(
                409,
                'clientBatchId was already used for a different photo batch',
              );
            }

            return {
              idempotent: true,
              batch: existingBatch,
              event,
            };
          }

          let acceptancePlan;
          try {
            acceptancePlan = getBatchAcceptancePlan({
              totalPhotos: event.totalPhotos,
              receivedPhotos: event.receivedPhotos,
              batchPhotoCount: data.photos.length,
            });
          } catch (error) {
            throw new ApiError(
              409,
              error instanceof Error ? error.message : 'Photo batch cannot be accepted',
            );
          }

          const batch = await tx.eventUploadBatch.create({
            data: {
              clientBatchId: data.clientBatchId,
              eventId: data.eventId,
              photoCount: data.photos.length,
              totalBytes: data.totalBytes,
              photos: {
                create: data.photos.map((photo) => ({
                  eventId: data.eventId,
                  localPath: photo.path,
                })),
              },
            },
            include: {
              photos: {
                select: {
                  id: true,
                  localPath: true,
                  status: true,
                },
              },
            },
          });

          const updatedEvent = await tx.event.update({
            where: { id: data.eventId, userId: data.userId },
            data: {
              receivedPhotos: { increment: data.photos.length },
              ...(!acceptancePlan.isInitialUpload && {
                totalPhotos: { increment: data.photos.length },
              }),
              status: 'PROCESSING',
            },
            select: {
              id: true,
              totalPhotos: true,
              receivedPhotos: true,
            },
          });

          return {
            idempotent: false,
            batch,
            event: updatedEvent,
          };
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      if (isSerializableConflict(error) && attempt < 2) continue;
      throw error;
    }
  }

  throw new ApiError(409, 'Could not accept the concurrent photo batch');
};

const markUploadBatchQueued = async (batchId: string) => {
  return prisma.eventUploadBatch.update({
    where: { id: batchId },
    data: { status: 'QUEUED' },
  });
};
const getStatus = async (id: string) => {
  return await prisma.event.findFirst({
    where: {
      id,
    },
    select: {
      status: true,
      totalPhotos: true,
      receivedPhotos: true,
      uploadedPhotos: true,
      processingPhotos: true,
      completedPhotos: true,
      failedPhotos: true,
    },
  });
};

export const eventRepository = {
  createEvent,
  getEvents,
  findById,
  findByPublicCode,
  findByIdAndUserId,
  deleteById,
  updateEvent,
  updateEventInternal,
  acceptPhotoBatch,
  markUploadBatchQueued,
  getStatus,
};
