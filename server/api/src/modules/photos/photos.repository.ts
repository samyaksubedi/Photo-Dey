import { prisma } from '../../db/db.client.js';
import { Prisma } from '../../generated/prisma/client.js';

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
const getStatus = async (id: string) => {};

export const photoRepository = {
  createPhoto,
  getPhotosByEventIdAndUserId,
  findByIdAndUserId,
  deleteById,
  updatePhoto,
  getStatus,
};
