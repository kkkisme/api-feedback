import type {
  ApiFeedbackController,
  ApiFeedbackLabels,
  ApiFeedbackOptions,
  ApiFeedbackReason,
  ApiFeedbackUserInfo,
  CapturedApiContext
} from '../types';

export type BrowserWindow = Window & typeof globalThis;

export interface NormalizedApiFeedbackOptions
  extends Omit<ApiFeedbackOptions, 'appId' | 'maxBodyLength' | 'toastCooldownMs'> {
  appId: string;
  maxBodyLength: number;
  toastCooldownMs: number;
  labels: ApiFeedbackLabels;
}

export interface FeedbackUiHandle {
  showToast(toastText?: string): void;
  openDrawer(): void;
  unmount(): void;
}

export interface PendingApiError {
  context: CapturedApiContext;
  reason?: ApiFeedbackReason;
  fingerprint: string;
}

export interface ApiFeedbackState {
  window: BrowserWindow;
  options: NormalizedApiFeedbackOptions;
  userInfo?: ApiFeedbackUserInfo;
  pendingErrors: PendingApiError[];
  pendingContext?: CapturedApiContext;
  pendingReason?: ApiFeedbackReason;
  ui?: FeedbackUiHandle;
  controller?: ApiFeedbackController;
  originalFetch?: typeof window.fetch;
  originalXMLHttpRequest?: typeof window.XMLHttpRequest;
  teardowns: Array<() => void>;
  destroyed: boolean;
  toastCooldowns: Map<string, number>;
}

export const defaultLabels: ApiFeedbackLabels = {
  toastText: '出现错误？',
  toastAction: '立即反馈！',
  drawerTitle: '发送反馈',
  feedbackLabel: '请描述你的问题（必填）',
  feedbackPlaceholder: '你的问题',
  privacyHint: '请勿包含任何敏感信息。',
  screenshotHelp: '屏幕截图可以帮助我们更好地了解你的反馈。',
  captureScreenshot: '截取屏幕截图',
  recaptureScreenshot: '重新截图',
  removeScreenshot: '删除截图',
  submit: '发送',
  submitting: '发送中...',
  submitSuccess: '反馈已发送',
  submitSuccessDescription: '感谢你的反馈，我们会尽快查看并处理。',
  submitError: '发送失败，请稍后重试',
  close: '关闭',
  screenshotUnavailable: '当前浏览器不支持屏幕截图。',
  screenshotCanceled: '已取消屏幕截图。',
  screenshotCurrentTabOnly: '请允许分享当前标签页后再截图。',
  feedbackRequired: '请先填写反馈内容。'
};

export function normalizeOptions(options: ApiFeedbackOptions): NormalizedApiFeedbackOptions {
  const appId = typeof options.appId === 'string' ? options.appId.trim() : '';

  if (!appId) {
    throw new Error('[api-feedback] appId is required.');
  }

  return {
    ...options,
    appId,
    maxBodyLength: options.maxBodyLength ?? 8000,
    toastCooldownMs: options.toastCooldownMs ?? 30000,
    labels: {
      ...defaultLabels,
      ...options.labels
    }
  };
}

export function createState(
  windowRef: BrowserWindow,
  options: NormalizedApiFeedbackOptions
): ApiFeedbackState {
  return {
    window: windowRef,
    options,
    pendingErrors: [],
    teardowns: [],
    destroyed: false,
    toastCooldowns: new Map()
  };
}

export async function evaluateCapturedApi(
  state: ApiFeedbackState,
  context: CapturedApiContext
): Promise<void> {
  if (state.destroyed || !state.options.shouldShowFeedback) {
    return;
  }

  try {
    const decision = await state.options.shouldShowFeedback(context);

    if (!decision) {
      return;
    }

    const reason = decision === true ? undefined : decision;
    const fingerprint = createFeedbackFingerprint(context, reason);
    const now = Date.now();
    const lastToastAt = state.toastCooldowns.get(fingerprint) ?? 0;
    const isCoolingDown = now - lastToastAt < state.options.toastCooldownMs;

    if (!isCoolingDown) {
      state.toastCooldowns.set(fingerprint, now);
      state.pendingErrors.push({
        context,
        reason,
        fingerprint
      });
      state.ui?.showToast(reason?.toastText);
    }
  } catch (error) {
    warn(state, '[api-feedback] shouldShowFeedback failed.', error);
  }
}

export function warn(state: ApiFeedbackState, message: string, error?: unknown): void {
  state.window.console?.warn?.(message, error);
}

function createFeedbackFingerprint(
  context: CapturedApiContext,
  reason?: ApiFeedbackReason
): string {
  return [
    context.transport,
    context.request.method,
    context.request.url,
    context.response?.status ?? 'no-status',
    reason?.code ?? reason?.businessCode ?? reason?.message ?? 'no-reason'
  ].join('|');
}
