import { prisma } from '../../db/db.client.js';

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
  findBySearchRequestId,
};
