import type { AdminEventsQuery, AdminUsersQuery } from './admin.schema.js';
import { adminRepository } from './admin.repository.js';

const getOverview = () => adminRepository.getOverview();
const getUsers = (data: AdminUsersQuery) => adminRepository.getUsers(data);
const getEvents = (data: AdminEventsQuery) => adminRepository.getEvents(data);

export const adminServices = { getOverview, getUsers, getEvents };
