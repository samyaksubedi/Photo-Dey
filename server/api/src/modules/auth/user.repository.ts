// Handles communication with database using ORM
import type { CreateUserInput, UserExistsInput } from './auth.types.js';
import { prisma } from '../../db/db.client.js';
const userExists = async (data: UserExistsInput): Promise<boolean> => {
  const result = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });
  return result ? true : false;
};
const createUser = async (data: CreateUserInput) => {
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

export const userRepository = { userExists, createUser };
