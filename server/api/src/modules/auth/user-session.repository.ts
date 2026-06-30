import { toUSVString } from 'node:util';
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
const deleteUserSessions = async (userId: string) => {
  return await prisma.userSession.deleteMany({
    where: {
      userId,
    },
  });
};
const getAllUserSessionInfo = async (userId: string) => {
  return await prisma.userSession.findMany({
    where: {
      userId,
    },
    select: {
      deviceInfo: true,
      ipAddress: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });
};
const findByRefreshToken = async (refreshToken: string) => {
  return await prisma.userSession.findFirst({
    where: {
      refreshToken,
    },
    select: {
      refreshTokenExpires: true,
      userId: true,
      id: true,
    },
  });
};
const updateUserSession = async (
  id: string,
  data: Prisma.UserSessionUpdateInput,
) => {
  await prisma.userSession.update({
    where: {
      id,
    },
    data: { ...data },
  });
};

export const userSessionRepository = {
  createUserSession,
  deleteUserSession,
  deleteUserSessions,
  getAllUserSessionInfo,
  findByRefreshToken,
  updateUserSession,
};
