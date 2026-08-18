export type ApiEnvelope<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  role?: 'user' | 'admin';
};

export type UserSession = {
  id: string;
  isCurrent: boolean;
  ipAddress: string;
  createdAt: string;
  lastUsedAt: string;
  deviceInfo: {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    deviceType: string;
    userAgent: string;
  };
};

export type EventStatus =
  | 'CREATED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'PARTIAL_FAILURE'
  | 'FAILED';

export type EventSummary = {
  id: string;
  publicCode: string;
  publicEnabled: boolean;
  name: string;
  totalPhotos: number;
  uploadedPhotos: number;
  failedPhotos: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
};

export type EventDetail = EventSummary & {
  processingPhotos: number;
  completedPhotos: number;
};

export type EventProcessingStatus = {
  status: EventStatus;
  totalPhotos: number;
  uploadedPhotos: number;
  processingPhotos: number;
  completedPhotos: number;
  failedPhotos: number;
};

export type Photo = {
  id: string;
  eventId: string;
  secureUrl: string | null;
  publicId: string | null;
  status: 'PENDING_UPLOAD' | 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
};

export type PublicEvent = {
  name: string;
  availability: 'PROCESSING' | 'READY' | 'UNAVAILABLE';
  telegramDeepLink: string | null;
};

export type GalleryPhoto = {
  confidence: number | null;
  photo: {
    id: string;
    secureUrl: string | null;
  };
};
