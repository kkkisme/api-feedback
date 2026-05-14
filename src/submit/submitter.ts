import type { ApiFeedbackState } from '../core/state';
import { createFeedbackFormData } from './form-data';

export async function submitFeedback(
  state: ApiFeedbackState,
  feedbackText: string,
  screenshot?: Blob
): Promise<void> {
  const { formData, metadata } = createFeedbackFormData(state, feedbackText, screenshot);
  const payload = {
    formData,
    metadata,
    feedbackText,
    screenshot
  };

  if (state.options.submit) {
    await state.options.submit(payload);
    return;
  }

  if (!state.options.endpoint) {
    throw new Error('[api-feedback] endpoint or submit is required to submit feedback.');
  }

  const fetchImpl = state.originalFetch ?? state.window.fetch;
  const response = await fetchImpl.call(state.window, state.options.endpoint, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`[api-feedback] feedback submit failed with HTTP ${response.status}.`);
  }
}
