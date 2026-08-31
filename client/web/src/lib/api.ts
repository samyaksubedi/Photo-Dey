import type { ApiEnvelope } from '../types';

const configuredApiRoot = import.meta.env.VITE_API_BASE_URL?.trim();
const API_ROOT = (configuredApiRoot || '/api/v1').replace(/\/$/, '');
let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let refreshTimer: number | null = null;
let authenticationLostHandler: (() => void) | null = null;

export class ApiClientError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (refreshTimer !== null) {
    window.clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  if (!token) return;

  try {
    const encodedPayload = token.split('.')[1] ?? '';
    const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const base64Payload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
    const payload = JSON.parse(atob(base64Payload)) as { exp?: number };
    if (!payload.exp) return;
    const refreshIn = Math.max(1_000, payload.exp * 1_000 - Date.now() - 60_000);
    refreshTimer = window.setTimeout(() => {
      void refreshAccessToken();
    }, refreshIn);
  } catch {
    // A malformed token will be rejected by the API and handled by the 401 flow.
  }
};

export const getAccessToken = () => accessToken;

export const setAuthenticationLostHandler = (handler: (() => void) | null) => {
  authenticationLostHandler = handler;
};

const notifyAuthenticationLost = () => {
  setAccessToken(null);
  authenticationLostHandler?.();
};

export const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_ROOT}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      const payload = (await response.json()) as ApiEnvelope<{
        accessToken: string;
      }>;
      if (!response.ok || !payload.success) return null;
      setAccessToken(payload.data.accessToken);
      return payload.data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

type RequestOptions = RequestInit & {
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> => {
  const {
    authenticated = false,
    retryOnUnauthorized = true,
    headers,
    ...requestOptions
  } = options;
  const requestHeaders = new Headers(headers);
  const isFormData = requestOptions.body instanceof FormData;

  if (!isFormData && requestOptions.body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (authenticated && accessToken) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_ROOT}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    credentials: 'include',
  });

  if (response.status === 401 && authenticated && retryOnUnauthorized) {
    const token = await refreshAccessToken();
    if (token) {
      return apiRequest<T>(path, {
        ...options,
        retryOnUnauthorized: false,
      });
    }
    notifyAuthenticationLost();
  }

  let payload: ApiEnvelope<T>;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiClientError(response.status, 'The server returned an invalid response');
  }

  if (!response.ok || !payload.success) {
    throw new ApiClientError(response.status, payload.message || 'Request failed');
  }
  return payload;
};

export const createEvent = (data: {
  name: string;
  expectedTotalPhotos: number;
}) =>
  apiRequest<{ eventId: string }>('/events', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(data),
  });

export type PhotoBatchResponse = {
  batch: {
    clientBatchId: string;
    acceptedPhotos: number;
    totalBytes: number;
    receivedPhotos: number;
    totalPhotos: number;
    idempotent: boolean;
  };
};

export const uploadEventPhotoBatch = (
  eventId: string,
  clientBatchId: string,
  files: File[],
  onProgress: (loaded: number, total: number) => void,
) =>
  new Promise<ApiEnvelope<PhotoBatchResponse>>((resolve, reject) => {
    const executeUpload = (retryOnUnauthorized: boolean) => {
      const formData = new FormData();
      formData.append('clientBatchId', clientBatchId);
      files.forEach((file) => formData.append('photos', file));

      const request = new XMLHttpRequest();
      request.open('POST', `${API_ROOT}/events/${eventId}/photos/batches`);
      request.withCredentials = true;
      if (accessToken) request.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      request.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded, event.total);
        }
      });
      request.addEventListener('load', async () => {
        if (request.status === 401 && retryOnUnauthorized) {
          const token = await refreshAccessToken();
          if (token) {
            onProgress(0, files.reduce((total, file) => total + file.size, 0));
            executeUpload(false);
            return;
          }
          notifyAuthenticationLost();
        }

        try {
          const payload = JSON.parse(request.responseText) as ApiEnvelope<PhotoBatchResponse>;
          if (request.status >= 200 && request.status < 300 && payload.success) {
            resolve(payload);
          } else {
            reject(new ApiClientError(request.status, payload.message || 'Upload failed'));
          }
        } catch {
          reject(new ApiClientError(request.status, 'The server returned an invalid response'));
        }
      });
      request.addEventListener('error', () => {
        reject(new ApiClientError(0, 'Could not reach the server'));
      });
      request.send(formData);
    };

    executeUpload(true);
  });
