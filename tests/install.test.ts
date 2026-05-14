import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  installApiFeedback,
  type ApiFeedbackController,
  type ApiFeedbackSubmitPayload
} from '../src/index';

let controller: ApiFeedbackController | undefined;

afterEach(() => {
  controller?.uninstall();
  controller = undefined;
  document.body.innerHTML = '';
});

describe('installApiFeedback', () => {
  it('requires appId', () => {
    expect(() =>
      installApiFeedback({
        appId: ''
      })
    ).toThrow('[api-feedback] appId is required.');
  });

  it('does not show feedback without shouldShowFeedback', async () => {
    window.fetch = vi.fn(async () => {
      return new Response(JSON.stringify({ code: 'SERVER_ERROR' }), {
        status: 500,
        headers: {
          'content-type': 'application/json'
        }
      });
    }) as unknown as typeof window.fetch;

    controller = installApiFeedback({
      appId: 'order-center',
      endpoint: '/api/feedback'
    });

    await fetch('/api/order/list');

    expect(getVisibleToasts()).toHaveLength(0);
  });

  it('shows feedback when shouldShowFeedback returns true', async () => {
    window.fetch = vi.fn(async () => {
      return new Response(JSON.stringify({ code: 'ORDER_QUERY_FAILED' }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      });
    }) as unknown as typeof window.fetch;

    controller = installApiFeedback({
      appId: 'order-center',
      endpoint: '/api/feedback',
      shouldShowFeedback: async ({ responseBody }) => {
        return (responseBody as { code?: string })?.code === 'ORDER_QUERY_FAILED';
      }
    });

    await fetch('/api/order/list');
    await nextTick();

    expect(getVisibleToasts()).toHaveLength(1);
  });

  it('shows one toast and submits separate failing APIs as an apiError array', async () => {
    const submit = vi.fn(async (_payload: ApiFeedbackSubmitPayload) => undefined);

    window.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      return new Response(
        JSON.stringify({
          code: url.includes('member') ? 'MEMBER_QUERY_FAILED' : 'ORDER_QUERY_FAILED'
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      );
    }) as unknown as typeof window.fetch;

    controller = installApiFeedback({
      appId: 'order-center',
      submit,
      shouldShowFeedback: async ({ responseBody }) => {
        const body = responseBody as { code?: string };

        return body?.code === 'ORDER_QUERY_FAILED' || body?.code === 'MEMBER_QUERY_FAILED';
      }
    });

    await fetch('/api/order/list');
    await fetch('/api/member/profile');
    await nextTick();

    expect(getVisibleToasts()).toHaveLength(1);

    const shadow = getShadowRoot();
    shadow.querySelector<HTMLButtonElement>('.af-toast__action')!.click();
    shadow.querySelector<HTMLTextAreaElement>('.af-textarea')!.value = '两个接口都失败了。';
    shadow.querySelector<HTMLButtonElement>('.af-submit')!.click();

    await nextTick();

    const apiErrors = submit.mock.calls[0][0].metadata.apiError;
    expect(apiErrors).toHaveLength(2);
    expect(apiErrors.map((item) => item.businessCode)).toEqual([
      'ORDER_QUERY_FAILED',
      'MEMBER_QUERY_FAILED'
    ]);
  });

  it('shows the same feedback again after the drawer is closed from the header button', async () => {
    window.fetch = vi.fn(async () => {
      return new Response(JSON.stringify({ code: 'ORDER_QUERY_FAILED' }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      });
    }) as unknown as typeof window.fetch;

    controller = installApiFeedback({
      appId: 'order-center',
      endpoint: '/api/feedback',
      shouldShowFeedback: async ({ responseBody }) => {
        return (responseBody as { code?: string })?.code === 'ORDER_QUERY_FAILED';
      }
    });

    await fetch('/api/order/list');
    await nextTick();

    const shadow = getShadowRoot();
    const drawer = shadow.querySelector<HTMLElement>('.af-drawer')!;
    const backdrop = shadow.querySelector<HTMLElement>('.af-backdrop')!;

    expect(getVisibleToasts()).toHaveLength(1);

    shadow.querySelector<HTMLButtonElement>('.af-toast__action')!.click();
    expect(shadow.querySelector('.af-cancel')).toBeNull();

    backdrop.click();
    expect(drawer.classList.contains('is-open')).toBe(true);

    shadow.querySelector<HTMLButtonElement>('.af-icon-button')!.click();

    expect(getVisibleToasts()).toHaveLength(0);

    await fetch('/api/order/list');
    await nextTick();

    expect(getVisibleToasts()).toHaveLength(1);
  });

  it('does not show feedback when shouldShowFeedback returns false for HTTP errors', async () => {
    window.fetch = vi.fn(async () => {
      return new Response(JSON.stringify({ code: 'SERVER_ERROR' }), {
        status: 500,
        headers: {
          'content-type': 'application/json'
        }
      });
    }) as unknown as typeof window.fetch;

    controller = installApiFeedback({
      appId: 'order-center',
      endpoint: '/api/feedback',
      shouldShowFeedback: () => false
    });

    await fetch('/api/order/list');
    await nextTick();

    expect(getVisibleToasts()).toHaveLength(0);
  });

  it('submits metadata with appId and the latest user info', async () => {
    const submit = vi.fn(async (_payload: ApiFeedbackSubmitPayload) => undefined);

    controller = installApiFeedback({
      appId: 'order-center',
      submit
    });

    controller.setUserInfo({
      userId: 'u_1',
      stale: true
    });
    controller.setUserInfo({
      userId: 'u_2',
      tenantId: 't_2'
    });
    controller.openFeedback();

    const shadow = getShadowRoot();
    const textarea = shadow.querySelector<HTMLTextAreaElement>('.af-textarea');
    const submitButton = shadow.querySelector<HTMLButtonElement>('.af-submit');

    expect(textarea).not.toBeNull();
    expect(submitButton).not.toBeNull();

    textarea!.value = '订单查询失败，请帮忙看一下。';
    submitButton!.click();

    await nextTick();

    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit.mock.calls[0][0].metadata.appId).toBe('order-center');
    expect(submit.mock.calls[0][0].metadata.userInfo).toEqual({
      userId: 'u_2',
      tenantId: 't_2'
    });
  });

  it('shows a success view and keeps the header close button as the only drawer close action', async () => {
    const submit = vi.fn(async (_payload: ApiFeedbackSubmitPayload) => undefined);

    controller = installApiFeedback({
      appId: 'order-center',
      submit
    });

    controller.openFeedback();

    const shadow = getShadowRoot();
    const drawer = shadow.querySelector<HTMLElement>('.af-drawer')!;
    const formView = shadow.querySelector<HTMLElement>('.af-form-view')!;
    const successView = shadow.querySelector<HTMLElement>('.af-success-view')!;
    const textarea = shadow.querySelector<HTMLTextAreaElement>('.af-textarea')!;
    const submitButton = shadow.querySelector<HTMLButtonElement>('.af-submit')!;
    const headerClose = shadow.querySelector<HTMLButtonElement>('.af-icon-button')!;

    textarea.value = '提交后留在成功界面。';
    submitButton.click();

    await nextTick();

    expect(submit).toHaveBeenCalledTimes(1);
    expect(drawer.classList.contains('is-open')).toBe(true);
    expect(drawer.classList.contains('is-success')).toBe(true);
    expect(formView.hidden).toBe(true);
    expect(successView.hidden).toBe(false);
    expect(shadow.querySelector('.af-success-close')).toBeNull();

    headerClose.click();

    expect(drawer.classList.contains('is-open')).toBe(false);
  });

  it('clears user info before submit', async () => {
    const submit = vi.fn(async (_payload: ApiFeedbackSubmitPayload) => undefined);

    controller = installApiFeedback({
      appId: 'member-center',
      submit
    });

    controller.setUserInfo({ userId: 'u_1' });
    controller.clearUserInfo();
    controller.openFeedback();

    const shadow = getShadowRoot();
    shadow.querySelector<HTMLTextAreaElement>('.af-textarea')!.value = '会员信息加载异常。';
    shadow.querySelector<HTMLButtonElement>('.af-submit')!.click();

    await nextTick();

    expect(submit.mock.calls[0][0].metadata.userInfo).toBeUndefined();
  });
});

function getShadowRoot(): ShadowRoot {
  const host = document.querySelector('api-feedback-root');
  expect(host).not.toBeNull();
  expect(host!.shadowRoot).not.toBeNull();
  return host!.shadowRoot!;
}

function getToast(): HTMLElement {
  const toast = getShadowRoot().querySelector<HTMLElement>('.af-toast');
  expect(toast).not.toBeNull();
  return toast!;
}

function getVisibleToasts(): HTMLElement[] {
  return Array.from(getShadowRoot().querySelectorAll<HTMLElement>('.af-toast.is-visible'));
}

function nextTick(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
