import { prisma } from '../../db/db.client.js';
import type { Prisma } from '../../generated/prisma/client.js';

const createEvent = async (data: Prisma.EventUncheckedCreateInput) => {
  return await prisma.event.create({
    data: {
      ...data,
    },
    select: {
      id: true,
      name: true,
      totalPhotos: true,
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
      name: true,
      totalPhotos: true,
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
      userId: true,
      name: true,
      totalPhotos: true,
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
const getStatus = async (id: string) => {
  return await prisma.event.findFirst({
    where: {
      id,
    },
    select: {
      status: true,
      totalPhotos: true,
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
  findByIdAndUserId,
  deleteById,
  updateEvent,
  updateEventInternal,
  getStatus,
};
