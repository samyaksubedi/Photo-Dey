import { prisma } from '../../db/db.client.js';
import type { Prisma } from '../../generated/prisma/client.js';

const createSearchRequest = async (
  data: Prisma.SearchRequestUncheckedCreateInput,
) => {
  return await prisma.searchRequest.create({
    data: {
      ...data,
    },
  });
};

export const searchRequestRepository = { createSearchRequest };
