import { userSessionRepository } from '../auth/user-session.repository.js';
import { userRepository } from '../auth/user.repository.js';

const getUsers = async () => {
  const users = await userRepository.getUsers();
  return users;
};
const getAdmins = async () => {
  const admins = await userRepository.getAdmins();
  return admins;
};
const getUserSessions = async (data: { userId: string }) => {
  const sessions = await userSessionRepository.getAllUserSessionInfo(
    data.userId,
  );
  return sessions;
};
export const adminServices = { getUsers, getAdmins, getUserSessions };
