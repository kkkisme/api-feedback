import type { ApiFeedbackController, ApiFeedbackUserInfo, CapturedApiContext } from '../types';
import type { ApiFeedbackState } from './state';

export function createController(state: ApiFeedbackState): ApiFeedbackController {
  return {
    setUserInfo(userInfo: ApiFeedbackUserInfo) {
      state.userInfo = { ...userInfo };
    },

    clearUserInfo() {
      state.userInfo = undefined;
    },

    openFeedback(context?: Partial<CapturedApiContext>) {
      if (context) {
        const normalizedContext = normalizeManualContext(context);
        state.pendingContext = normalizedContext;
        state.pendingReason = undefined;
        state.pendingErrors = [
          {
            context: normalizedContext,
            fingerprint: `manual|${Date.now()}`
          }
        ];
      }

      state.ui?.openDrawer();
    },

    uninstall() {
      if (state.destroyed) {
        return;
      }

      state.destroyed = true;

      for (const teardown of state.teardowns.splice(0)) {
        teardown();
      }

      state.ui?.unmount();
      state.ui = undefined;
      state.pendingContext = undefined;
      state.pendingReason = undefined;
    }
  };
}

function normalizeManualContext(context: Partial<CapturedApiContext>): CapturedApiContext {
  const now = new Date().toISOString();

  return {
    transport: 'manual',
    request: {
      url: context.request?.url ?? '',
      method: context.request?.method ?? 'MANUAL',
      headers: context.request?.headers,
      body: context.request?.body
    },
    response: context.response,
    responseBody: context.responseBody,
    responseText: context.responseText,
    error: context.error,
    duration: context.duration ?? 0,
    startedAt: context.startedAt ?? now,
    endedAt: context.endedAt ?? now
  };
}
