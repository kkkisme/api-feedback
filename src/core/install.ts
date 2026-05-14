import { installFetchCapture } from '../capture/fetch';
import { installXhrCapture } from '../capture/xhr';
import type { ApiFeedbackController, ApiFeedbackOptions } from '../types';
import { mountFeedbackUi } from '../ui/mount';
import { createController } from './controller';
import { createState, normalizeOptions, type BrowserWindow } from './state';

let activeController: ApiFeedbackController | undefined;

export function installApiFeedback(options: ApiFeedbackOptions): ApiFeedbackController {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('[api-feedback] installApiFeedback must run in a browser.');
  }

  activeController?.uninstall();

  const normalizedOptions = normalizeOptions(options);
  const state = createState(window as BrowserWindow, normalizedOptions);
  const controller = createController(state);

  state.controller = controller;
  state.ui = mountFeedbackUi(state);

  const fetchTeardown = installFetchCapture(state);
  const xhrTeardown = installXhrCapture(state);

  if (fetchTeardown) {
    state.teardowns.push(fetchTeardown);
  }

  if (xhrTeardown) {
    state.teardowns.push(xhrTeardown);
  }

  activeController = controller;

  return controller;
}
