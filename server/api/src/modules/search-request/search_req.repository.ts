import { prisma } from '../../db/db.client.js';
import type {
  Prisma,
  SearchRequestStatus,
} from '../../generated/prisma/client.js';

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

const findByChatId = async (chatId: string) => {
  return await prisma.searchRequest.findMany({ where: { chatId } });
};
const findByChatIdAndStatus = async (
  chatId: string,
  status: SearchRequestStatus,
) => {
  return await prisma.searchRequest.findMany({ where: { chatId, status } });
};
const findCompletedGalleriesByChatId = async (chatId: string) => {
  return prisma.searchRequest.findMany({
    where: {
      chatId,
      status: 'COMPLETED',
      matchedPhotosCount: {
        gt: 0,
      },
    },
  });
};

export const searchRequestRepository = {
  createSearchRequest,
  updateSearchRequest,
  findById,
  findByChatId,
  findByChatIdAndStatus,
  findCompletedGalleriesByChatId,
};
