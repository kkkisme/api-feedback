import type {
  ApiFeedbackMetadata,
  ApiFeedbackReason,
  ApiFeedbackUserInfo,
  CapturedApiContext
} from '../types';
import type { ApiFeedbackState } from '../core/state';
import { redactRecord, sanitizeValue } from '../utils/redact';

export function createFeedbackFormData(
  state: ApiFeedbackState,
  feedbackText: string,
  screenshot?: Blob
): {
  formData: FormData;
  metadata: ApiFeedbackMetadata;
} {
  const metadata = createFeedbackMetadata(state);
  const formData = new state.window.FormData();

  formData.append('feedbackText', feedbackText);
  formData.append('metadata', JSON.stringify(metadata));

  if (screenshot) {
    const file = createScreenshotFile(state, screenshot);
    formData.append('screenshot', file);
  }

  return {
    formData,
    metadata
  };
}

export function createFeedbackMetadata(state: ApiFeedbackState): ApiFeedbackMetadata {
  const { window: windowRef, options } = state;

  return {
    appId: options.appId,
    pageUrl: windowRef.location.href,
    pageTitle: windowRef.document.title,
    timestamp: new Date().toISOString(),
    userAgent: windowRef.navigator.userAgent,
    viewport: {
      width: windowRef.innerWidth,
      height: windowRef.innerHeight,
      devicePixelRatio: windowRef.devicePixelRatio
    },
    userInfo: state.userInfo ? cloneUserInfo(state.userInfo, state) : undefined,
    apiError: createApiErrorMetadata(state)
  };
}

function createApiErrorMetadata(state: ApiFeedbackState): Array<Record<string, unknown>> {
  const pendingErrors = state.pendingErrors.length
    ? state.pendingErrors
    : state.pendingContext
      ? [
          {
            context: state.pendingContext,
            reason: state.pendingReason,
            fingerprint: 'legacy'
          }
        ]
      : [];

  return pendingErrors.map((item) => createSingleApiErrorMetadata(state, item.context, item.reason));
}

function createSingleApiErrorMetadata(
  state: ApiFeedbackState,
  context: CapturedApiContext,
  reason: ApiFeedbackReason | undefined
): Record<string, unknown> {
  const redactOptions = state.options;

  return {
    transport: context.transport,
    url: context.request.url,
    method: context.request.method,
    status: context.response?.status,
    statusText: context.response?.statusText,
    duration: context.duration,
    startedAt: context.startedAt,
    endedAt: context.endedAt,
    requestId: extractRequestId(context),
    businessCode: reason?.businessCode ?? reason?.code ?? extractBodyField(context.responseBody, 'code'),
    message:
      reason?.message ??
      extractBodyField(context.responseBody, 'message') ??
      context.error?.message ??
      context.response?.statusText,
    reason: reason?.reason,
    businessReason: sanitizeReason(reason, state),
    requestHeaders: redactRecord(context.request.headers, redactOptions),
    requestBody: sanitizeValue(context.request.body, redactOptions),
    responseHeaders: redactRecord(context.response?.headers, redactOptions),
    responseBody: sanitizeValue(context.responseBody, redactOptions),
    responseText: sanitizeValue(context.responseText, redactOptions),
    error: sanitizeValue(context.error, redactOptions)
  };
}

function extractBodyField(body: unknown, field: string): string | number | undefined {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return undefined;
  }

  const value = (body as Record<string, unknown>)[field];

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return undefined;
}

function extractRequestId(context: CapturedApiContext): string | undefined {
  const headers = {
    ...context.request.headers,
    ...context.response?.headers
  };

  for (const [key, value] of Object.entries(headers)) {
    const normalized = key.toLowerCase();
    if (
      normalized === 'x-request-id' ||
      normalized === 'request-id' ||
      normalized === 'trace-id' ||
      normalized === 'x-trace-id'
    ) {
      return value;
    }
  }

  return undefined;
}

function sanitizeReason(
  reason: ApiFeedbackReason | undefined,
  state: ApiFeedbackState
): ApiFeedbackReason | undefined {
  if (!reason) {
    return undefined;
  }

  return sanitizeValue(reason, state.options) as ApiFeedbackReason;
}

function cloneUserInfo(
  userInfo: ApiFeedbackUserInfo,
  state: ApiFeedbackState
): ApiFeedbackUserInfo {
  return sanitizeValue(userInfo, state.options) as ApiFeedbackUserInfo;
}

function createScreenshotFile(state: ApiFeedbackState, screenshot: Blob): Blob {
  if (typeof state.window.File === 'function') {
    return new state.window.File([screenshot], 'api-feedback-screenshot.png', {
      type: screenshot.type || 'image/png'
    });
  }

  return screenshot;
}
