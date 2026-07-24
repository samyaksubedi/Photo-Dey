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

const updateSearchRequest = async (
  id: string,
  data: Prisma.SearchRequestUncheckedUpdateInput,
) => {
  return await prisma.searchRequest.update({
    where: { id },
    data: {
      ...data,
    },
  });
};

const findById = async (id: string) => {
  return await prisma.searchRequest.findFirst({ where: { id } });
};

export const searchRequestRepository = {
  createSearchRequest,
  updateSearchRequest,
  findById,
};
