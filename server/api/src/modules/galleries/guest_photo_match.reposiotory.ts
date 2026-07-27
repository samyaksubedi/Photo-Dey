import { prisma } from '../../db/db.client.js';

const createMany = async (
  data: {
    searchRequestId: string;
    photoId: string;
    confidence: number;
  }[],
) => {
  return prisma.guestPhotoMatch.createMany({
    data,
  });
};

const findBySearchRequestId = async (searchRequestId: string) => {
  return prisma.guestPhotoMatch.findMany({
    where: {
      searchRequestId,
    },
    orderBy: {
      confidence: 'desc', // Largest to smallest (0.9,0.8,...0.1)
    },
    select: {
      confidence: true,
      photo: {
        select: {
          id: true,
          secureUrl: true,
        },
      },
    },
  });
};

export const guestPhotoMatchRepository = {
  createMany,
  findBySearchRequestId,
};
