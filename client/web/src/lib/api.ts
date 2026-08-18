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

export const uploadEvent = (
  formData: FormData,
  onProgress: (progress: number) => void,
) =>
  new Promise<ApiEnvelope<{ event: { id: string } }>>((resolve, reject) => {
    const executeUpload = (retryOnUnauthorized: boolean) => {
      const request = new XMLHttpRequest();
      request.open('POST', `${API_ROOT}/events`);
      request.withCredentials = true;
      if (accessToken) request.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      request.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });
      request.addEventListener('load', async () => {
        if (request.status === 401 && retryOnUnauthorized) {
          const token = await refreshAccessToken();
          if (token) {
            onProgress(0);
            executeUpload(false);
            return;
          }
          notifyAuthenticationLost();
        }

        try {
          const payload = JSON.parse(request.responseText) as ApiEnvelope<{ event: { id: string } }>;
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
