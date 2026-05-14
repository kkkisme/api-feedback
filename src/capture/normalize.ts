import type { CapturedApiError, CapturedApiRequest, CapturedApiResponse } from '../types';
import type { ApiFeedbackState } from '../core/state';
import { headersToRecord } from '../utils/headers';
import { toAbsoluteUrl } from '../utils/ignore-url';
import { readRequestBody, mergeFetchHeaders } from './body-reader';

export function normalizeFetchRequest(
  state: ApiFeedbackState,
  input: RequestInfo | URL,
  init?: RequestInit
): CapturedApiRequest {
  const request = getRequest(input);
  const rawUrl = getFetchInputUrl(input);
  const body = init?.body ?? undefined;

  return {
    url: toAbsoluteUrl(rawUrl, state.window),
    method: (init?.method ?? request?.method ?? 'GET').toUpperCase(),
    headers: mergeFetchHeaders(input, init),
    body: readRequestBody(body, state.options)
  };
}

export function normalizeFetchResponse(response: Response): CapturedApiResponse {
  return {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    headers: headersToRecord(response.headers)
  };
}

export function normalizeError(error: unknown): CapturedApiError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return {
    message: String(error)
  };
}

function getFetchInputUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }

  if (typeof URL !== 'undefined' && input instanceof URL) {
    return input.href;
  }

  const request = getRequest(input);
  if (request) {
    return request.url;
  }

  return String(input);
}

function getRequest(input?: RequestInfo | URL): Request | undefined {
  if (typeof Request === 'undefined') {
    return undefined;
  }

  return input instanceof Request ? input : undefined;
}
