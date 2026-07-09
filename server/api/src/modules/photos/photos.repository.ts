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

const getPhotos = async (eventId: string) => {
  return await prisma.photo.findMany({
    where: { eventId },
    select: {
      publicId: true,
      secureUrl: true,
      status: true,
      eventId: true,
    },
  });
};
const findById = async (id: string) => {
  return await prisma.photo.findUnique({
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
export const photoRepository = {
  createPhoto,
  getPhotos,
  findById,
  // deleteById,
  updatePhoto,
  // getStatus,
};
