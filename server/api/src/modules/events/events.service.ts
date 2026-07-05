import { ApiError } from '../../utils/api-output.util.js';
import { eventRepository } from './events.repository.js';

const getEvents = async (data: { userId: string }) => {
  //  Get all events  of the user
  const events = await eventRepository.getEvents(data.userId);
  if (!events) {
    return null;
  }
  return events;
};
// const createEvents = async (data) => {
//   // Create the event
//   //   await eventRepository.createEvent()
// };
const getEvent = async (data: { eventId: string }) => {
  //  Get all details for a single events
  const event = await eventRepository.findById(data.eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  return event;
};
const deleteEvent = async (data: { eventId: string }) => {
  const event = await eventRepository.findById(data.eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  await eventRepository.deleteById(data.eventId);
};
const getStatus = async (data: { eventId: string }) => {
  const event = await eventRepository.findById(data.eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  const status = await eventRepository.getStatus(data.eventId);
  return status;
};
export const eventServices = {
  getEvents,
  // createEvents,
  getEvent,
  deleteEvent,
  getStatus,
};
