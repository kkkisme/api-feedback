export type MaybePromise<T> = T | Promise<T>;

export type ApiFeedbackUserInfo = Record<string, unknown>;

export type IgnoreUrlMatcher =
  | string
  | RegExp
  | ((url: string, context: CapturedApiContext) => boolean);

export interface ApiFeedbackOptions {
  appId: string;
  endpoint?: string;
  submit?: ApiFeedbackSubmitter;
  shouldShowFeedback?: ShouldShowFeedback;
  ignoreUrls?: IgnoreUrlMatcher[];
  maxBodyLength?: number;
  toastCooldownMs?: number;
  redactKeys?: string[];
  labels?: Partial<ApiFeedbackLabels>;
}

export interface ApiFeedbackLabels {
  toastText: string;
  toastAction: string;
  drawerTitle: string;
  feedbackLabel: string;
  feedbackPlaceholder: string;
  privacyHint: string;
  screenshotHelp: string;
  captureScreenshot: string;
  recaptureScreenshot: string;
  removeScreenshot: string;
  submit: string;
  submitting: string;
  submitSuccess: string;
  submitSuccessDescription: string;
  submitError: string;
  close: string;
  screenshotUnavailable: string;
  screenshotCanceled: string;
  screenshotCurrentTabOnly: string;
  feedbackRequired: string;
}

export interface CapturedApiRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface CapturedApiResponse {
  url?: string;
  status: number;
  statusText?: string;
  headers?: Record<string, string>;
}

export interface CapturedApiError {
  name?: string;
  message: string;
  stack?: string;
}

export interface CapturedApiContext {
  transport: 'fetch' | 'xhr' | 'manual';
  request: CapturedApiRequest;
  response?: CapturedApiResponse;
  responseBody?: unknown;
  responseText?: string;
  error?: CapturedApiError;
  duration: number;
  startedAt: string;
  endedAt: string;
}

export interface ApiFeedbackReason {
  code?: string | number;
  businessCode?: string | number;
  message?: string;
  reason?: string;
  toastText?: string;
  [key: string]: unknown;
}

export type ShouldShowFeedback = (
  context: CapturedApiContext
) => MaybePromise<boolean | ApiFeedbackReason>;

export interface ApiFeedbackController {
  setUserInfo(userInfo: ApiFeedbackUserInfo): void;
  clearUserInfo(): void;
  openFeedback(context?: Partial<CapturedApiContext>): void;
  uninstall(): void;
}

export interface ApiFeedbackMetadata {
  appId: string;
  pageUrl: string;
  pageTitle: string;
  timestamp: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
    devicePixelRatio: number;
  };
  userInfo?: ApiFeedbackUserInfo;
  apiError: Array<Record<string, unknown>>;
}

export interface ApiFeedbackSubmitPayload {
  formData: FormData;
  metadata: ApiFeedbackMetadata;
  feedbackText: string;
  screenshot?: Blob;
}

export type ApiFeedbackSubmitter = (
  payload: ApiFeedbackSubmitPayload
) => MaybePromise<void>;
