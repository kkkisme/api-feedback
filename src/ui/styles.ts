export const feedbackStyles = `
:host {
  all: initial;
  color-scheme: light;
  --af-ink: #18202c;
  --af-muted: #667085;
  --af-line: #d8dde6;
  --af-panel: #ffffff;
  --af-bg: #f6f8fb;
  --af-accent: #2680eb;
  --af-accent-strong: #1769d1;
  --af-accent-soft: #eaf4ff;
  --af-accent-ink: #ffffff;
  --af-danger: #ba1a1a;
  --af-success: #137333;
  --af-shadow: 0 26px 72px rgba(24, 32, 44, 0.2), 0 8px 24px rgba(24, 32, 44, 0.14);
  --af-soft-shadow: 0 14px 34px rgba(24, 32, 44, 0.15), 0 2px 10px rgba(24, 32, 44, 0.1);
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

button,
textarea {
  font: inherit;
}

svg {
  display: block;
}

:host(.is-capturing) .af-toast,
:host(.is-capturing) .af-backdrop,
:host(.is-capturing) .af-drawer,
:host(.is-capturing) .af-minimized {
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transition: none !important;
}

.af-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  z-index: 2147483646;
  display: none;
  align-items: center;
  gap: 8px;
  max-width: min(400px, calc(100vw - 48px));
  min-height: 42px;
  padding: 9px 12px;
  color: var(--af-ink);
  background: var(--af-panel);
  border: 1px solid var(--af-line);
  border-radius: 12px;
  box-shadow: var(--af-soft-shadow);
  transform: translate(-50%, -12px) scale(0.98);
  transform-origin: top center;
  opacity: 0;
  transition: opacity 160ms ease, transform 160ms ease;
}

.af-toast::before {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--af-danger);
  content: "";
}

.af-toast.is-visible {
  display: flex;
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

.af-toast__text {
  min-width: 0;
  color: var(--af-ink);
  font-size: 13px;
  line-height: 18px;
  white-space: normal;
}

.af-toast__action,
.af-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--af-line);
  border-radius: 8px;
  color: var(--af-ink);
  background: #fff;
  cursor: pointer;
  white-space: nowrap;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease, box-shadow 120ms ease;
}

.af-toast__action {
  min-height: auto;
  padding: 0;
  border: 0;
  border-radius: 0;
  color: var(--af-accent-strong);
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  background: transparent;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.af-toast__action:hover {
  color: #1459b8;
  background: transparent;
}

.af-toast__action:focus-visible {
  outline: 2px solid rgba(38, 128, 235, 0.3);
  outline-offset: 3px;
}

.af-toast__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-left: 2px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  color: var(--af-muted);
  background: transparent;
  cursor: pointer;
}

.af-toast__close svg {
  width: 14px;
  height: 14px;
}

.af-toast__close:hover {
  color: var(--af-ink);
  background: #eef1f6;
}

.af-toast__close:focus-visible,
.af-icon-button:focus-visible {
  outline: 3px solid rgba(38, 128, 235, 0.26);
  outline-offset: 3px;
}

.af-button:hover {
  border-color: #aeb7c6;
  background: #f2f7f4;
}

.af-button--primary {
  min-height: 42px;
  border-color: var(--af-accent);
  border-radius: 999px;
  color: var(--af-accent-ink);
  background: var(--af-accent);
  font-weight: 700;
  box-shadow: 0 10px 20px rgba(38, 128, 235, 0.2);
}

.af-button--primary:hover {
  border-color: var(--af-accent-strong);
  background: var(--af-accent-strong);
}

.af-button--ghost {
  border-color: transparent;
  background: transparent;
}

.af-button[disabled] {
  opacity: 0.56;
  cursor: not-allowed;
}

.af-backdrop {
  display: none !important;
  pointer-events: none;
}

.af-drawer {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  width: min(400px, calc(100vw - 48px));
  height: min(620px, calc(100vh - 128px));
  max-height: calc(100dvh - 128px);
  overflow: hidden;
  color: var(--af-ink);
  background: var(--af-panel);
  border: 1px solid rgba(216, 221, 230, 0.9);
  border-radius: 16px;
  box-shadow: var(--af-shadow);
  transform: translateY(18px) scale(0.96);
  transform-origin: bottom right;
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease, transform 180ms ease;
}

.af-drawer.is-open {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}

.af-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 60px;
  padding: 0 12px 0 18px;
  color: #fff;
  border-bottom: 0;
  background: linear-gradient(135deg, var(--af-accent) 0%, var(--af-accent-strong) 100%);
}

.af-drawer__actions {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
}

.af-drawer__title {
  min-width: 0;
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
}

.af-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
}

.af-icon-button[hidden] {
  display: none;
}

.af-icon-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.af-drawer__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px;
  background: linear-gradient(180deg, #ffffff 0%, var(--af-bg) 100%);
}

.af-form-view[hidden],
.af-success-view[hidden] {
  display: none;
}

.af-form-view {
  display: grid;
}

.af-field {
  display: grid;
  gap: 8px;
}

.af-label {
  color: var(--af-ink);
  font-size: 14px;
  font-weight: 650;
  line-height: 20px;
}

.af-textarea {
  display: block;
  width: 100%;
  min-height: 120px;
  resize: vertical;
  padding: 12px;
  color: var(--af-ink);
  background: #fff;
  border: 1px solid #9aa4b2;
  border-radius: 10px;
  outline: none;
  line-height: 20px;
}

.af-textarea:focus {
  border-color: var(--af-accent);
  box-shadow: 0 0 0 3px rgba(38, 128, 235, 0.14);
}

.af-help {
  margin: 8px 0 0;
  color: var(--af-muted);
  font-size: 12px;
  line-height: 18px;
}

.af-section {
  margin-top: 22px;
}

.af-screenshot-row {
  display: grid;
  gap: 10px;
}

.af-capture {
  width: 100%;
  min-height: 40px;
  border-style: dashed;
  color: var(--af-accent-strong);
  background: var(--af-accent-soft);
}

.af-capture:hover {
  border-color: var(--af-accent);
  color: var(--af-accent-strong);
  background: #dcebff;
}

.af-preview {
  position: relative;
  display: none;
  padding-top: 14px;
}

.af-preview.is-visible {
  display: grid;
}

.af-preview__button {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  cursor: zoom-in;
}

.af-preview__button:focus-visible {
  outline: 3px solid rgba(38, 128, 235, 0.28);
  outline-offset: 2px;
}

.af-preview__image {
  display: block;
  width: 100%;
  max-height: 180px;
  background: #eef1f6;
  border: 1px solid var(--af-line);
  border-radius: 10px;
}

.af-preview__button:hover .af-preview__image {
  border-color: var(--af-accent);
}

.af-preview__remove {
  position: absolute;
  top: 0;
  right: -10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid rgba(186, 26, 26, 0.14);
  border-radius: 999px;
  color: var(--af-danger);
  background: #fff;
  box-shadow: 0 10px 26px rgba(24, 32, 44, 0.22), 0 2px 8px rgba(24, 32, 44, 0.14);
  cursor: pointer;
}

.af-preview__remove svg {
  width: 18px;
  height: 18px;
}

.af-preview__remove:hover {
  border-color: rgba(186, 26, 26, 0.28);
  background: #fff4f4;
}

.af-preview__remove:focus-visible {
  outline: 3px solid rgba(38, 128, 235, 0.28);
  outline-offset: 2px;
}

.af-status {
  min-height: 20px;
  margin-top: 12px;
  color: var(--af-muted);
  font-size: 13px;
  line-height: 20px;
}

.af-status.is-error {
  color: var(--af-danger);
}

.af-status.is-success {
  color: var(--af-success);
}

.af-drawer__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 70px;
  padding: 12px 20px 16px;
  border-top: 1px solid var(--af-line);
  background: #fff;
}

.af-submit {
  width: 100%;
}

.af-drawer.is-success .af-drawer__footer {
  display: none;
}

.af-drawer.is-success .af-minimize {
  display: none;
}

.af-drawer.is-success .af-drawer__body {
  display: flex;
  overflow: hidden;
  padding: 0 20px;
  background: #fff;
}

.af-success-view {
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 18px;
  text-align: center;
}

.af-success-mark {
  position: relative;
  width: 52px;
  height: 52px;
  margin-bottom: 18px;
  border-radius: 999px;
  background: var(--af-accent-soft);
  border: 1px solid rgba(19, 115, 51, 0.18);
}

.af-success-mark::after {
  position: absolute;
  left: 20px;
  top: 13px;
  width: 10px;
  height: 19px;
  border: solid var(--af-success);
  border-width: 0 3px 3px 0;
  content: "";
  transform: rotate(45deg);
}

.af-success-title {
  margin: 0;
  color: var(--af-ink);
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
}

.af-success-description {
  max-width: 280px;
  margin: 8px 0 0;
  color: var(--af-muted);
  font-size: 13px;
  line-height: 20px;
}

.af-minimized {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2147483646;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: min(320px, calc(100vw - 48px));
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid rgba(38, 128, 235, 0.26);
  border-radius: 999px;
  color: var(--af-ink);
  background: #fff;
  box-shadow: var(--af-soft-shadow);
  cursor: pointer;
}

.af-minimized[hidden] {
  display: none;
}

.af-minimized::before {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--af-accent);
  content: "";
  box-shadow: 0 0 0 4px var(--af-accent-soft);
}

.af-minimized:hover {
  border-color: rgba(38, 128, 235, 0.42);
  background: #f8fbff;
}

.af-minimized:focus-visible {
  outline: 3px solid rgba(38, 128, 235, 0.26);
  outline-offset: 3px;
}

.af-minimized__title {
  min-width: 0;
  overflow: hidden;
  color: var(--af-ink);
  font-size: 13px;
  font-weight: 700;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.af-minimized__action {
  flex: 0 0 auto;
  color: var(--af-accent-strong);
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
}

.af-image-viewer {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: rgba(17, 24, 39, 0.72);
}

.af-image-viewer.is-open {
  display: flex;
}

.af-image-viewer__image {
  display: block;
  max-width: min(1120px, calc(100vw - 64px));
  max-height: calc(100vh - 64px);
  object-fit: contain;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
}

.af-image-viewer__close {
  position: fixed;
  top: 18px;
  right: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 999px;
  color: #fff;
  background: rgba(17, 24, 39, 0.72);
  cursor: pointer;
}

.af-image-viewer__close:hover {
  background: rgba(17, 24, 39, 0.92);
}

.af-icon-button svg,
.af-image-viewer__close svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 520px) {
  .af-toast {
    top: 12px;
    left: 50%;
    max-width: calc(100vw - 24px);
  }

  .af-drawer {
    right: 12px;
    bottom: 12px;
    width: calc(100vw - 24px);
    height: min(620px, calc(100vh - 24px));
    max-height: calc(100dvh - 24px);
    border-radius: 14px;
  }

  .af-drawer__body {
    padding: 16px;
  }

  .af-drawer__footer {
    padding: 12px 16px 16px;
  }

  .af-minimized {
    right: 12px;
    bottom: 12px;
    max-width: calc(100vw - 24px);
  }

  .af-image-viewer {
    padding: 16px;
  }

  .af-image-viewer__image {
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 32px);
  }
}
`;
