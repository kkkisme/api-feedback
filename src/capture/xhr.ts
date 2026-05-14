import type { CapturedApiContext, CapturedApiError } from '../types';
import type { ApiFeedbackState } from '../core/state';
import { evaluateCapturedApi, warn } from '../core/state';
import { readRequestBody, readXhrResponseBody } from './body-reader';
import { parseRawHeaders } from '../utils/headers';
import { shouldIgnoreUrl, toAbsoluteUrl } from '../utils/ignore-url';

export function installXhrCapture(state: ApiFeedbackState): (() => void) | undefined {
  const OriginalXMLHttpRequest = state.window.XMLHttpRequest;

  if (typeof OriginalXMLHttpRequest !== 'function') {
    return undefined;
  }

  state.originalXMLHttpRequest = OriginalXMLHttpRequest;

  function ApiFeedbackXMLHttpRequest(this: XMLHttpRequest): XMLHttpRequest {
    const xhr = new OriginalXMLHttpRequest();
    const xhrWithOverrides = xhr as XMLHttpRequest & {
      open: (...args: unknown[]) => void;
      send: (body?: Document | XMLHttpRequestBodyInit | null) => void;
      setRequestHeader: (name: string, value: string) => void;
    };
    const requestHeaders: Record<string, string> = {};
    let method = 'GET';
    let url = '';
    let requestBody: unknown;
    let startedAtDate = new Date();
    let startedAt = startedAtDate.toISOString();
    let transportError: CapturedApiError | undefined;

    const originalOpen = xhr.open.bind(xhr);
    xhrWithOverrides.open = function open(...args: unknown[]): void {
      const [xhrMethod, xhrUrl, async, username, password] = args;
      method = String(xhrMethod ?? 'GET').toUpperCase();
      url = toAbsoluteUrl(String(xhrUrl), state.window);
      originalOpen(
        method,
        String(xhrUrl),
        typeof async === 'boolean' ? async : true,
        typeof username === 'string' ? username : null,
        typeof password === 'string' ? password : null
      );
    };

    const originalSetRequestHeader = xhr.setRequestHeader.bind(xhr);
    xhrWithOverrides.setRequestHeader = function setRequestHeader(name: string, value: string): void {
      requestHeaders[name] = value;
      originalSetRequestHeader(name, value);
    };

    const originalSend = xhr.send.bind(xhr);
    xhrWithOverrides.send = function send(body?: Document | XMLHttpRequestBodyInit | null): void {
      startedAtDate = new Date();
      startedAt = startedAtDate.toISOString();
      requestBody = readRequestBody(body, state.options);
      originalSend(body);
    };

    xhr.addEventListener('error', () => {
      transportError = {
        name: 'XMLHttpRequestError',
        message: 'XMLHttpRequest network error'
      };
    });

    xhr.addEventListener('loadend', () => {
      const endedAt = new Date().toISOString();
      const context: CapturedApiContext = {
        transport: 'xhr',
        request: {
          url,
          method,
          headers: requestHeaders,
          body: requestBody
        },
        response: {
          url: xhr.responseURL || url,
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseRawHeaders(xhr.getAllResponseHeaders())
        },
        error: transportError,
        duration: Date.now() - startedAtDate.getTime(),
        startedAt,
        endedAt
      };

      if (shouldIgnoreUrl(state, context)) {
        return;
      }

      if (state.options.shouldShowFeedback) {
        Object.assign(context, readXhrResponseBody(xhr, state.options));
        void evaluateCapturedApi(state, context).catch((reason) => {
          warn(state, '[api-feedback] failed to evaluate XHR response.', reason);
        });
      }
    });

    return xhr;
  }

  ApiFeedbackXMLHttpRequest.prototype = OriginalXMLHttpRequest.prototype;
  Object.setPrototypeOf(ApiFeedbackXMLHttpRequest, OriginalXMLHttpRequest);

  state.window.XMLHttpRequest = ApiFeedbackXMLHttpRequest as unknown as typeof XMLHttpRequest;

  return () => {
    state.window.XMLHttpRequest = OriginalXMLHttpRequest;
  };
}
