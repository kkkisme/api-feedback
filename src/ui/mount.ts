import type { ApiFeedbackState, FeedbackUiHandle } from '../core/state';
import { submitFeedback } from '../submit/submitter';
import { feedbackStyles } from './styles';
import { captureScreen } from './screenshot';

const closeIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x" aria-hidden="true" focusable="false"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
`;

const minimizeIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus-icon lucide-minus" aria-hidden="true" focusable="false"><path d="M5 12h14"/></svg>
`;

const trashIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2" aria-hidden="true" focusable="false"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
`;

export function mountFeedbackUi(state: ApiFeedbackState): FeedbackUiHandle {
  const { document } = state.window;
  const host = document.createElement('api-feedback-root');
  const shadow = host.attachShadow({ mode: 'open' });
  let screenshot: Blob | undefined;
  let screenshotUrl: string | undefined;

  shadow.innerHTML = `
    <style>${feedbackStyles}</style>
    <div class="af-toast" role="status" aria-live="polite">
      <span class="af-toast__text"></span>
      <button class="af-toast__action" type="button"></button>
      <button class="af-toast__close" type="button" aria-label="关闭提示">${closeIconSvg}</button>
    </div>
    <div class="af-backdrop"></div>
    <aside class="af-drawer" role="dialog" aria-modal="false" aria-hidden="true" aria-labelledby="af-drawer-title">
      <header class="af-drawer__header">
        <h2 class="af-drawer__title" id="af-drawer-title"></h2>
        <div class="af-drawer__actions">
          <button class="af-icon-button af-minimize" type="button" aria-label="最小化">${minimizeIconSvg}</button>
          <button class="af-icon-button af-close" type="button" aria-label="关闭">${closeIconSvg}</button>
        </div>
      </header>
      <div class="af-drawer__body">
        <div class="af-form-view">
          <label class="af-field">
            <span class="af-label"></span>
            <textarea class="af-textarea"></textarea>
          </label>
          <p class="af-help af-privacy"></p>

          <section class="af-section">
            <p class="af-help af-screenshot-help"></p>
            <div class="af-screenshot-row">
              <button class="af-button af-capture" type="button"></button>
              <div class="af-preview">
                <button class="af-preview__button" type="button" aria-label="查看截图大图">
                  <img class="af-preview__image" alt="屏幕截图预览" />
                </button>
                <button class="af-preview__remove" type="button" aria-label="删除截图">${trashIconSvg}</button>
              </div>
            </div>
            <div class="af-status" role="status" aria-live="polite"></div>
          </section>
        </div>
        <div class="af-success-view" hidden>
          <div class="af-success-mark" aria-hidden="true"></div>
          <h3 class="af-success-title"></h3>
          <p class="af-success-description"></p>
        </div>
      </div>
      <footer class="af-drawer__footer">
        <button class="af-button af-button--primary af-submit" type="button"></button>
      </footer>
    </aside>
    <button class="af-minimized" type="button" hidden>
      <span class="af-minimized__title"></span>
      <span class="af-minimized__action">继续填写</span>
    </button>
    <div class="af-image-viewer" role="dialog" aria-modal="true" aria-label="查看截图" aria-hidden="true">
      <button class="af-image-viewer__close" type="button" aria-label="关闭截图预览">${closeIconSvg}</button>
      <img class="af-image-viewer__image" alt="屏幕截图大图" />
    </div>
  `;

  document.body.appendChild(host);

  const labels = state.options.labels;
  const toast = getElement<HTMLElement>(shadow, '.af-toast');
  const toastText = getElement<HTMLElement>(shadow, '.af-toast__text');
  const toastAction = getElement<HTMLButtonElement>(shadow, '.af-toast__action');
  const toastClose = getElement<HTMLButtonElement>(shadow, '.af-toast__close');
  const backdrop = getElement<HTMLElement>(shadow, '.af-backdrop');
  const drawer = getElement<HTMLElement>(shadow, '.af-drawer');
  const minimizedButton = getElement<HTMLButtonElement>(shadow, '.af-minimized');
  const minimizedTitle = getElement<HTMLElement>(shadow, '.af-minimized__title');
  const drawerTitle = getElement<HTMLElement>(shadow, '.af-drawer__title');
  const formView = getElement<HTMLElement>(shadow, '.af-form-view');
  const successView = getElement<HTMLElement>(shadow, '.af-success-view');
  const successTitle = getElement<HTMLElement>(shadow, '.af-success-title');
  const successDescription = getElement<HTMLElement>(shadow, '.af-success-description');
  const minimizeButton = getElement<HTMLButtonElement>(shadow, '.af-minimize');
  const closeButton = getElement<HTMLButtonElement>(shadow, '.af-close');
  const textarea = getElement<HTMLTextAreaElement>(shadow, '.af-textarea');
  const label = getElement<HTMLElement>(shadow, '.af-label');
  const privacy = getElement<HTMLElement>(shadow, '.af-privacy');
  const screenshotHelp = getElement<HTMLElement>(shadow, '.af-screenshot-help');
  const captureButton = getElement<HTMLButtonElement>(shadow, '.af-capture');
  const preview = getElement<HTMLElement>(shadow, '.af-preview');
  const previewButton = getElement<HTMLButtonElement>(shadow, '.af-preview__button');
  const previewImage = getElement<HTMLImageElement>(shadow, '.af-preview__image');
  const removeButton = getElement<HTMLButtonElement>(shadow, '.af-preview__remove');
  const status = getElement<HTMLElement>(shadow, '.af-status');
  const submitButton = getElement<HTMLButtonElement>(shadow, '.af-submit');
  const imageViewer = getElement<HTMLElement>(shadow, '.af-image-viewer');
  const imageViewerClose = getElement<HTMLButtonElement>(shadow, '.af-image-viewer__close');
  const imageViewerImage = getElement<HTMLImageElement>(shadow, '.af-image-viewer__image');

  const handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && imageViewer.classList.contains('is-open')) {
      closeImageViewer();
    }
  };

  drawerTitle.textContent = labels.drawerTitle;
  minimizedTitle.textContent = labels.drawerTitle;
  toastText.textContent = labels.toastText;
  toastAction.textContent = labels.toastAction;
  label.textContent = labels.feedbackLabel;
  textarea.placeholder = labels.feedbackPlaceholder;
  privacy.textContent = labels.privacyHint;
  screenshotHelp.textContent = labels.screenshotHelp;
  captureButton.textContent = labels.captureScreenshot;
  submitButton.textContent = labels.submit;
  successTitle.textContent = labels.submitSuccess;
  successDescription.textContent = labels.submitSuccessDescription;

  toastAction.addEventListener('click', () => {
    const shouldPreserveForm = !minimizedButton.hidden;
    closeToast(false);
    openDrawer(shouldPreserveForm);
  });
  toastClose.addEventListener('click', () => closeToast(true));
  minimizedButton.addEventListener('click', () => openDrawer(true));
  minimizeButton.addEventListener('click', () => minimizeDrawer());
  closeButton.addEventListener('click', () => closeDrawer());
  captureButton.addEventListener('click', () => void handleCapture());
  previewButton.addEventListener('click', () => openImageViewer());
  removeButton.addEventListener('click', () => clearScreenshot());
  submitButton.addEventListener('click', () => void handleSubmit());
  imageViewerClose.addEventListener('click', () => closeImageViewer());
  imageViewer.addEventListener('click', (event) => {
    if (event.target === imageViewer) {
      closeImageViewer();
    }
  });
  state.window.document.addEventListener('keydown', handleDocumentKeydown);

  function showToast(toastOverride?: string): void {
    if (toastOverride) {
      toastText.textContent = toastOverride;
    } else {
      toastText.textContent = labels.toastText;
    }

    if (drawer.classList.contains('is-open')) {
      return;
    }

    syncToastOffset();
    toast.classList.add('is-visible');
  }

  function closeToast(discardPendingErrors: boolean): void {
    toast.classList.remove('is-visible');

    if (discardPendingErrors) {
      clearPendingErrors();
    }
  }

  function openDrawer(preserveView = false): void {
    if (!preserveView) {
      showFormView();
      status.textContent = '';
      status.className = 'af-status';
    }

    hideMinimizedButton();
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    textarea.focus();
  }

  function minimizeDrawer(): void {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    minimizedButton.hidden = false;
    syncToastOffset();
    minimizedButton.focus();
  }

  function closeDrawer(): void {
    backdrop.classList.remove('is-open');
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    hideMinimizedButton();
    clearPendingErrors();
  }

  function hideMinimizedButton(): void {
    minimizedButton.hidden = true;
    syncToastOffset();
  }

  function syncToastOffset(): void {
    toast.classList.toggle('is-offset', !minimizedButton.hidden);
  }

  async function handleCapture(): Promise<void> {
    setStatus('', undefined);
    setBusy(captureButton, true);
    hideForCapture();

    try {
      const blob = await captureScreen(state.window);
      setScreenshot(blob);
    } catch (error) {
      const message = getScreenshotErrorMessage(error);
      setStatus(message, 'error');
    } finally {
      showAfterCapture();
      setBusy(captureButton, false);
    }
  }

  async function handleSubmit(): Promise<void> {
    const feedbackText = textarea.value.trim();

    if (!feedbackText) {
      setStatus(labels.feedbackRequired, 'error');
      textarea.focus();
      return;
    }

    setStatus('', undefined);
    setBusy(submitButton, true, labels.submitting);

    try {
      await submitFeedback(state, feedbackText, screenshot);
      textarea.value = '';
      clearScreenshot();
      clearPendingErrors();
      showSuccessView();
    } catch {
      setStatus(labels.submitError, 'error');
    } finally {
      setBusy(submitButton, false, labels.submit);
    }
  }

  function setScreenshot(blob: Blob): void {
    clearScreenshot();
    const objectUrl = state.window.URL.createObjectURL(blob);
    screenshot = blob;
    screenshotUrl = objectUrl;
    previewImage.src = objectUrl;
    imageViewerImage.src = objectUrl;
    preview.classList.add('is-visible');
    captureButton.style.display = 'none';
  }

  function clearScreenshot(): void {
    screenshot = undefined;

    if (screenshotUrl) {
      state.window.URL.revokeObjectURL(screenshotUrl);
      screenshotUrl = undefined;
    }

    previewImage.removeAttribute('src');
    imageViewerImage.removeAttribute('src');
    preview.classList.remove('is-visible');
    captureButton.style.display = '';
    closeImageViewer();
  }

  function setStatus(message: string, tone?: 'error' | 'success'): void {
    status.textContent = message;
    status.className = `af-status${tone ? ` is-${tone}` : ''}`;
  }

  function setBusy(button: HTMLButtonElement, busy: boolean, text?: string): void {
    button.disabled = busy;

    if (text) {
      button.textContent = text;
    }
  }

  function hideForCapture(): void {
    host.classList.add('is-capturing');
  }

  function showAfterCapture(): void {
    host.classList.remove('is-capturing');
  }

  function openImageViewer(): void {
    if (!screenshotUrl) {
      return;
    }

    imageViewer.classList.add('is-open');
    imageViewer.setAttribute('aria-hidden', 'false');
    imageViewerClose.focus();
  }

  function closeImageViewer(): void {
    imageViewer.classList.remove('is-open');
    imageViewer.setAttribute('aria-hidden', 'true');
  }

  function showFormView(): void {
    drawer.classList.remove('is-success');
    minimizeButton.hidden = false;
    formView.hidden = false;
    successView.hidden = true;
  }

  function showSuccessView(): void {
    drawer.classList.add('is-success');
    minimizeButton.hidden = true;
    formView.hidden = true;
    successView.hidden = false;
    hideMinimizedButton();
    closeButton.focus();
  }

  function resetToastCooldown(): void {
    state.toastCooldowns.clear();
  }

  function clearPendingErrors(): void {
    state.pendingErrors = [];
    state.pendingContext = undefined;
    state.pendingReason = undefined;
    resetToastCooldown();
  }

  return {
    showToast,
    openDrawer,
    unmount() {
      clearScreenshot();
      clearPendingErrors();
      state.window.document.removeEventListener('keydown', handleDocumentKeydown);
      host.remove();
    }
  };

  function getScreenshotErrorMessage(error: unknown): string {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      return labels.screenshotCanceled;
    }

    if (error instanceof Error && error.message === 'SCREEN_CAPTURE_CURRENT_TAB_REQUIRED') {
      return labels.screenshotCurrentTabOnly;
    }

    return labels.screenshotUnavailable;
  }
}

function getElement<T extends Element>(root: DocumentFragment | Element, selector: string): T {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error(`[api-feedback] Missing UI element: ${selector}`);
  }

  return element;
}
