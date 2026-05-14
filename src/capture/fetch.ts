import type { CapturedApiContext } from '../types';
import type { ApiFeedbackState } from '../core/state';
import { evaluateCapturedApi, warn } from '../core/state';
import { shouldIgnoreUrl } from '../utils/ignore-url';
import { readResponseBody } from './body-reader';
import { normalizeError, normalizeFetchRequest, normalizeFetchResponse } from './normalize';

export function installFetchCapture(state: ApiFeedbackState): (() => void) | undefined {
  const originalFetch = state.window.fetch;

  if (typeof originalFetch !== 'function') {
    return undefined;
  }

  state.originalFetch = originalFetch;

  const patchedFetch = async function apiFeedbackFetch(
    this: Window,
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const startedAtDate = new Date();
    const startedAt = startedAtDate.toISOString();
    const request = normalizeFetchRequest(state, input, init);

    const baseContext: CapturedApiContext = {
      transport: 'fetch',
      request,
      duration: 0,
      startedAt,
      endedAt: startedAt
    };

    if (shouldIgnoreUrl(state, baseContext)) {
      return originalFetch.call(state.window, input, init);
    }

    try {
      const response = await originalFetch.call(state.window, input, init);
      const endedAt = new Date().toISOString();
      const context: CapturedApiContext = {
        ...baseContext,
        response: normalizeFetchResponse(response),
        duration: Date.now() - startedAtDate.getTime(),
        endedAt
      };

      if (state.options.shouldShowFeedback) {
        void readResponseBody(response.clone(), state.options)
          .then((body) => {
            Object.assign(context, body);
            return evaluateCapturedApi(state, context);
          })
          .catch((reason) => {
            warn(state, '[api-feedback] failed to evaluate fetch response.', reason);
          });
      }

      return response;
    } catch (error) {
      const endedAt = new Date().toISOString();
      const context: CapturedApiContext = {
        ...baseContext,
        error: normalizeError(error),
        duration: Date.now() - startedAtDate.getTime(),
        endedAt
      };

      void evaluateCapturedApi(state, context).catch((reason) => {
        warn(state, '[api-feedback] failed to evaluate fetch error.', reason);
      });

      throw error;
    }
  } as typeof window.fetch;

  state.window.fetch = patchedFetch;

  return () => {
    if (state.window.fetch === patchedFetch) {
      state.window.fetch = originalFetch;
    }
  };
}
