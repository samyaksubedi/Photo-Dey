import { prisma } from '../../db/db.client.js';
import { Prisma } from '../../generated/prisma/client.js';

const createUserSession = async (
  data: Prisma.UserSessionUncheckedCreateInput,
) => {
  return await prisma.userSession.create({
    data: {
      ...data,
    },
  });
};
const deleteUserSession = async (id: string) => {
  await prisma.userSession.delete({
    where: {
      id,
    },
  });
};
export const userSessionRepository = {
  createUserSession,
  deleteUserSession,
};
