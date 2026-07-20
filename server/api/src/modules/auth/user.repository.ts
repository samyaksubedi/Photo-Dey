// Handles communication with database using ORM
import type { UpdateEmailVerificationTokenAndExpiryInput } from './auth.types.js';
import type { Prisma } from '../../generated/prisma/client.js';

import { prisma } from '../../db/db.client.js';

const createUser = async (data: Prisma.UserCreateInput) => {
  return await prisma.user.create({
    data: {
      ...data,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
    },
  });
};
const updateEmailVerificationTokenAndExpiry = async (
  data: UpdateEmailVerificationTokenAndExpiryInput,
): Promise<void> => {
  await prisma.user.update({
    where: { email: data.email },
    data: {
      emailVerificationToken: data.emailVerificationToken,
      emailVerificationTokenExpires: data.emailVerificationTokenExpires,
    },
  });
};
const findByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      passwordHash: true,
      role: true,
    },
  });
};

const findById = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      isVerified: true,
      name: true,
      role: true,
    },
  });
};

const findByEmailVerificationToken = async (token: string) => {
  return await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
    },
    select: {
      id: true,
      emailVerificationTokenExpires: true,
    },
  });
};
const findByPasswordResetToken = async (token: string) => {
  return await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
    },
    select: {
      id: true,
      passwordResetTokenExpires: true,
    },
  });
};

const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  await prisma.user.update({
    where: {
      id,
    },
    data: { ...data },
  });
};

// No pagination for now : )
const getUsers = async () => {
  return await prisma.user.findMany({
    where: {
      role: 'user',
    },

    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      role: true,
      createdAt: true,
    },
  });
};
const getAdmins = async () => {
  return await prisma.user.findMany({
    where: {
      role: 'admin',
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      role: true,
      createdAt: true,
    },
  });
};
export const userRepository = {
  createUser,
  findByEmail,
  updateEmailVerificationTokenAndExpiry,
  findByEmailVerificationToken,
  findByPasswordResetToken,
  updateUser,
  findById,
  getUsers,
  getAdmins,
};

// userRepository.findByEmail(email)

// userRepository.findByEmailVerificationToken(token)
// userRepository.findByPasswordResetToken(token)

// userRepository.createUser(data)
// userRepository.updateUser(id, data)
