import { prisma } from '../../db/db.client.js';
import { Prisma } from '../../generated/prisma/client.js';
import {
  getEventStatusFromCounters,
  getPhotoDeletionCounterChanges,
} from '../events/event-upload.util.js';

const createPhoto = async (data: Prisma.PhotoUncheckedCreateInput) => {
  return await prisma.photo.create({
    data: {
      ...data,
    },
    select: {
      id: true,
      eventId: true,
      status: true,
    },
  });
};

const getPhotosByEventIdAndUserId = async (eventId: string, userId: string) => {
  return await prisma.photo.findMany({
    where: {
      eventId,
      event: {
        userId,
      },
    },
    select: {
      id: true,
      publicId: true,
      secureUrl: true,
      status: true,
      eventId: true,
    },
  });
};
const findByIdAndUserId = async (id: string, userId: string) => {
  return await prisma.photo.findFirst({
    where: {
      id,
      event: {
        userId,
      },
    },
    select: {
      id: true,
      eventId: true,
      localPath: true,
      secureUrl: true,
      publicId: true,
      status: true,
    },
  });
};
const findById = async (id: string) => {
  return await prisma.photo.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      eventId: true,
      secureUrl: true,
      publicId: true,
      status: true,
    },
  });
};

const updatePhoto = async (id: string, data: Prisma.PhotoUpdateInput) => {
  await prisma.photo.update({
    where: { id },
    data: {
      ...data,
    },
  });
};

const deleteById = async (id: string) => {
  await prisma.photo.delete({
    where: {
      id,
    },
  });
};

const deleteByIdAndUpdateEvent = async (id: string, userId: string) => {
  return prisma.$transaction(
    async (tx) => {
      const photo = await tx.photo.findFirst({
        where: {
          id,
          event: { userId },
        },
        select: {
          id: true,
          eventId: true,
          secureUrl: true,
          status: true,
          event: {
            select: {
              totalPhotos: true,
              receivedPhotos: true,
              uploadedPhotos: true,
              processingPhotos: true,
              completedPhotos: true,
              failedPhotos: true,
            },
          },
        },
      });

      if (!photo) return null;

      const changes = getPhotoDeletionCounterChanges(photo);
      const counters = {
        totalPhotos: Math.max(0, photo.event.totalPhotos + changes.totalPhotos),
        receivedPhotos: Math.max(
          0,
          photo.event.receivedPhotos + changes.receivedPhotos,
        ),
        uploadedPhotos: Math.max(
          0,
          photo.event.uploadedPhotos + changes.uploadedPhotos,
        ),
        processingPhotos: Math.max(
          0,
          photo.event.processingPhotos + changes.processingPhotos,
        ),
        completedPhotos: Math.max(
          0,
          photo.event.completedPhotos + changes.completedPhotos,
        ),
        failedPhotos: Math.max(
          0,
          photo.event.failedPhotos + changes.failedPhotos,
        ),
      };

      await tx.photo.delete({ where: { id } });
      const event = await tx.event.update({
        where: { id: photo.eventId, userId },
        data: {
          ...counters,
          status: getEventStatusFromCounters(counters),
        },
      });

      return { photo, event };
    },
    { isolationLevel: 'Serializable' },
  );
};
const getStatus = async (id: string) => {};

export const photoRepository = {
  createPhoto,
  getPhotosByEventIdAndUserId,
  findById,
  findByIdAndUserId,
  deleteById,
  deleteByIdAndUpdateEvent,
  updatePhoto,
  getStatus,
};
