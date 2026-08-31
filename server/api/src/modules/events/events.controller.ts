import type { RequestHandler } from 'express';
import { eventServices } from './events.service.js';
import type {
  CreateEventBody,
  DeleteEventInput,
  GetEventInput,
  GetStatusInput,
  UpdatePublicAccessBody,
  UploadPhotoBatchBody,
} from './events.schema.js';
import { uploadPhotoBatchSchema } from './events.schema.js';
import { ApiError, ApiResponse } from '../../utils/api-output.util.js';
import {
  getPhotoBatchBytes,
  isPhotoBatchWithinLimit,
  MAX_PHOTO_BATCH_BYTES,
} from './event-upload.util.js';
import { deleteTempFile } from '../../utils/file.util.js';

export const createEvent: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as CreateEventBody;
    const userId = req.user.id;
    const event = await eventServices.createEvent({
      name: body.name,
      expectedTotalPhotos: body.expectedTotalPhotos,
      userId,
    });
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { eventId: event.id, event },
          'Event created successfully',
        ),
      );
  } catch (error) {
    next(error);
  }
};
export const uploadEventPhotoBatch: RequestHandler = async (req, res, next) => {
  const photos = req.files as Express.Multer.File[];

  const cleanupReceivedFiles = async () => {
    if (!Array.isArray(photos)) return;
    await Promise.allSettled(photos.map((photo) => deleteTempFile(photo.path)));
  };

  if (!Array.isArray(photos) || photos.length === 0) {
    await cleanupReceivedFiles();
    return next(new ApiError(400, 'At least one photo is required'));
  }

  const parsedBody = uploadPhotoBatchSchema.safeParse(req.body);
  if (!parsedBody.success) {
    await cleanupReceivedFiles();
    return next(
      new ApiError(
        400,
        'A valid clientBatchId is required',
        parsedBody.error.issues,
      ),
    );
  }

  if (!isPhotoBatchWithinLimit(photos)) {
    await cleanupReceivedFiles();
    return next(
      new ApiError(
        413,
        `Photo batch must not exceed ${MAX_PHOTO_BATCH_BYTES / 1024 / 1024} MiB`,
      ),
    );
  }

  try {
    const params = req.params as GetEventInput;
    const body = parsedBody.data as UploadPhotoBatchBody;
    const batch = await eventServices.uploadEventPhotoBatch({
      eventId: params.eventId,
      userId: req.user.id,
      clientBatchId: body.clientBatchId,
      photos,
      totalBytes: getPhotoBatchBytes(photos),
    });

    return res
      .status(batch.idempotent ? 200 : 202)
      .json(
        new ApiResponse(
          batch.idempotent ? 200 : 202,
          { batch },
          batch.idempotent
            ? 'Photo batch already accepted'
            : 'Photo batch accepted',
        ),
      );
  } catch (error) {
    next(error);
  }
};
export const getEvents: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const events = await eventServices.getEvents({ userId });
    return res
      .status(200)
      .json(new ApiResponse(200, { events }, 'Events fetched successfully !'));
  } catch (error) {
    next(error);
  }
};
export const getEvent: RequestHandler = async (req, res, next) => {
  try {
    const params = req.params as GetEventInput;
    const userId = req.user.id;
    const event = await eventServices.getEvent({
      eventId: params.eventId,
      userId: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { event }, 'Event fetched successfully '));
  } catch (error) {
    next(error);
  }
};
export const deleteEvent: RequestHandler = async (req, res, next) => {
  try {
    const params = req.params as DeleteEventInput;
    const userId = req.user.id;
    await eventServices.deleteEvent({
      eventId: params.eventId,
      userId: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Event deleted successfully'));
  } catch (error) {
    next(error);
  }
};
export const getStatus: RequestHandler = async (req, res, next) => {
  try {
    const params = req.params as GetStatusInput;
    const userId = req.user.id;
    const status = await eventServices.getStatus({
      eventId: params.eventId,
      userId: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { status }, 'Status fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const updatePublicAccess: RequestHandler = async (req, res, next) => {
  try {
    const params = req.params as GetEventInput;
    const body = req.body as UpdatePublicAccessBody;
    const publicAccess = await eventServices.updatePublicAccess({
      eventId: params.eventId,
      userId: req.user.id,
      publicEnabled: body.publicEnabled,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { publicAccess },
          'Event public access updated successfully',
        ),
      );
  } catch (error) {
    next(error);
  }
};
