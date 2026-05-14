export const feedbackStyles = `
:host {
  all: initial;
  color-scheme: light;
  --af-ink: #18202c;
  --af-muted: #667085;
  --af-line: #d8dde6;
  --af-panel: #ffffff;
  --af-bg: #f7f8fb;
  --af-accent: #0b57d0;
  --af-accent-ink: #ffffff;
  --af-danger: #ba1a1a;
  --af-success: #137333;
  --af-shadow: 0 18px 48px rgba(24, 32, 44, 0.18), 0 2px 12px rgba(24, 32, 44, 0.12);
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
:host(.is-capturing) .af-drawer {
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transition: none !important;
}

.af-toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2147483646;
  display: none;
  align-items: center;
  gap: 8px;
  max-width: min(420px, calc(100vw - 32px));
  min-height: 40px;
  padding: 8px 12px;
  color: var(--af-ink);
  background: var(--af-panel);
  border: 1px solid var(--af-line);
  border-left: 4px solid var(--af-danger);
  border-radius: 8px;
  box-shadow: var(--af-shadow);
  transform: translateY(12px);
  opacity: 0;
  transition: opacity 160ms ease, transform 160ms ease;
}

.af-toast.is-visible {
  display: flex;
  opacity: 1;
  transform: translateY(0);
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
  border-radius: 6px;
  color: var(--af-ink);
  background: #fff;
  cursor: pointer;
  white-space: nowrap;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
}

.af-toast__action {
  min-height: auto;
  padding: 0;
  border: 0;
  border-radius: 0;
  color: var(--af-accent);
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  background: transparent;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.af-toast__action:hover {
  color: #0842a0;
  background: transparent;
}

.af-toast__action:focus-visible {
  outline: 2px solid rgba(11, 87, 208, 0.3);
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
  border-radius: 11px;
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

.af-toast__close:focus-visible {
  outline: 2px solid rgba(11, 87, 208, 0.3);
  outline-offset: 2px;
}

.af-button:hover {
  border-color: #aeb7c6;
  background: #eef3fb;
}

.af-button--primary {
  border-color: var(--af-accent);
  color: var(--af-accent-ink);
  background: var(--af-accent);
}

.af-button--primary:hover {
  border-color: #0842a0;
  background: #0842a0;
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
  position: fixed;
  inset: 0;
  z-index: 2147483645;
  display: none;
  background: rgba(31, 36, 45, 0.38);
}

.af-backdrop.is-open {
  display: block;
}

.af-drawer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  width: min(430px, 100vw);
  height: 100vh;
  color: var(--af-ink);
  background: var(--af-panel);
  box-shadow: var(--af-shadow);
  transform: translateX(100%);
  transition: transform 180ms ease;
}

.af-drawer.is-open {
  transform: translateX(0);
}

.af-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 60px;
  padding: 0 16px;
  border-bottom: 1px solid var(--af-line);
}

.af-drawer__title {
  min-width: 0;
  margin: 0;
  color: var(--af-ink);
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
}

.af-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 18px;
  color: var(--af-ink);
  background: transparent;
  cursor: pointer;
}

.af-icon-button:hover {
  background: #eef1f6;
}

.af-drawer__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 24px 16px;
  background: linear-gradient(180deg, #fff 0%, var(--af-bg) 100%);
}

.af-form-view[hidden],
.af-success-view[hidden] {
  display: none;
}

.af-field {
  display: grid;
  gap: 8px;
}

.af-label {
  color: var(--af-ink);
  font-size: 14px;
  line-height: 20px;
}

.af-textarea {
  display: block;
  width: 100%;
  min-height: 132px;
  resize: vertical;
  padding: 12px;
  color: var(--af-ink);
  background: #fff;
  border: 1px solid #9aa4b2;
  border-radius: 6px;
  outline: none;
  line-height: 20px;
}

.af-textarea:focus {
  border-color: var(--af-accent);
  box-shadow: 0 0 0 3px rgba(11, 87, 208, 0.14);
}

.af-help {
  margin: 8px 0 0;
  color: var(--af-muted);
  font-size: 12px;
  line-height: 18px;
}

.af-section {
  margin-top: 24px;
}

.af-screenshot-row {
  display: grid;
  gap: 10px;
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
  border-radius: 6px;
  background: transparent;
  cursor: zoom-in;
}

.af-preview__button:focus-visible {
  outline: 3px solid rgba(11, 87, 208, 0.28);
  outline-offset: 2px;
}

.af-preview__image {
  display: block;
  width: 100%;
  max-height: 180px;
  background: #eef1f6;
  border: 1px solid var(--af-line);
  border-radius: 6px;
}

.af-preview__button:hover .af-preview__image {
  border-color: var(--af-accent);
}

.af-preview__remove {
  position: absolute;
  top: 0;
  right: -14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid rgba(186, 26, 26, 0.14);
  border-radius: 24px;
  color: var(--af-danger);
  background: #fff;
  box-shadow: 0 10px 26px rgba(24, 32, 44, 0.22), 0 2px 8px rgba(24, 32, 44, 0.14);
  cursor: pointer;
}

.af-preview__remove svg {
  width: 20px;
  height: 20px;
}

.af-preview__remove:hover {
  border-color: rgba(186, 26, 26, 0.28);
  background: #fff4f4;
}

.af-preview__remove:focus-visible {
  outline: 3px solid rgba(11, 87, 208, 0.28);
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
  min-height: 64px;
  padding: 12px 16px;
  border-top: 1px solid var(--af-line);
  background: #fff;
}

.af-drawer.is-success .af-drawer__footer {
  display: none;
}

.af-drawer.is-success .af-drawer__body {
  display: flex;
  overflow: hidden;
  padding: 0 16px;
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
  width: 48px;
  height: 48px;
  margin-bottom: 18px;
  border-radius: 24px;
  background: rgba(19, 115, 51, 0.1);
  border: 1px solid rgba(19, 115, 51, 0.18);
}

.af-success-mark::after {
  position: absolute;
  left: 18px;
  top: 12px;
  width: 10px;
  height: 18px;
  border: solid var(--af-success);
  border-width: 0 3px 3px 0;
  content: "";
  transform: rotate(45deg);
}

.af-success-title {
  margin: 0;
  color: var(--af-ink);
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.af-success-description {
  max-width: 280px;
  margin: 8px 0 0;
  color: var(--af-muted);
  font-size: 13px;
  line-height: 20px;
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
  border-radius: 6px;
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
  border-radius: 20px;
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
    right: 16px;
    bottom: 16px;
  }

  .af-drawer {
    width: 100vw;
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
