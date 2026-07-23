import { prisma } from '../../db/db.client.js';
import type { Prisma } from '../../generated/prisma/client.js';

const createTelegramSession = async (
  data: Prisma.TelegramSessionUncheckedCreateInput,
) => {
  return await prisma.telegramSession.create({ data: { ...data } });
};
const findByChatId = async (chatId: string) => {
  return await prisma.telegramSession.findFirst({
    where: {
      chatId,
    },
  });
};

const updateTelegramSession = async (
  chatId: string,
  data: Prisma.TelegramSessionUncheckedUpdateInput,
) => {
  return await prisma.telegramSession.update({
    where: { chatId },
    data: { ...data },
  });
};
export const telegramSessionRepository = {
  createTelegramSession,
  findByChatId,
  updateTelegramSession,
};
