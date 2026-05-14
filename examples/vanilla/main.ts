import { installApiFeedback, type ApiFeedbackSubmitPayload } from '../../src/index';

interface DemoBusinessError {
  url: string;
  method: string;
  status: number | string;
  code: string;
  message: string;
  requestId: string;
  timestamp: string;
}

const businessErrors: DemoBusinessError[] = [];

const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = String(input);

  if (url.includes('/api/order/list')) {
    return new Response(
      JSON.stringify({
        code: 'ORDER_QUERY_FAILED',
        message: '订单查询失败'
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-request-id': 'demo-request-id'
        }
      }
    );
  }

  if (url.includes('/api/member/profile')) {
    return new Response(
      JSON.stringify({
        code: 'MEMBER_QUERY_FAILED',
        message: '会员信息查询失败'
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-request-id': 'demo-member-request-id'
        }
      }
    );
  }

  return originalFetch(input, init);
};

const feedback = installApiFeedback({
  appId: 'order-center',
  submit: async (payload) => {
    renderSubmittedPayload(payload);
  },
  shouldShowFeedback: async ({ responseBody }) => {
    const body = responseBody as { code?: string; message?: string } | undefined;

    if (body?.code === 'ORDER_QUERY_FAILED' || body?.code === 'MEMBER_QUERY_FAILED') {
      return {
        code: body.code,
        message: body.message,
        reason: '业务接口定义为需要反馈'
      };
    }

    return false;
  }
});

feedback.setUserInfo({
  userId: 'u_123',
  username: '张三',
  tenantId: 't_456'
});

document.querySelector('#trigger-1')?.addEventListener('click', async () => {
  await simulateBusinessFailure('/api/order/list');
});

document.querySelector('#trigger-2')?.addEventListener('click', async () => {
  await simulateBusinessFailure('/api/member/profile');
});

async function simulateBusinessFailure(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    const responseBody = (await response.json().catch(() => undefined)) as
      | {
          code?: string;
          message?: string;
        }
      | undefined;

    renderBusinessError({
      url,
      method: 'GET',
      status: response.status,
      code: responseBody?.code ?? 'UNKNOWN_BUSINESS_ERROR',
      message: responseBody?.message ?? '接口返回了业务失败，但没有错误描述。',
      requestId: response.headers.get('x-request-id') ?? '-',
      timestamp: formatTime(new Date())
    });
  } catch (error) {
    renderBusinessError({
      url,
      method: 'GET',
      status: 'NETWORK_ERROR',
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : '接口请求失败。',
      requestId: '-',
      timestamp: formatTime(new Date())
    });
  }
}

function renderBusinessError(error: DemoBusinessError): void {
  const output = document.querySelector<HTMLElement>('#business-error-output');
  const count = document.querySelector<HTMLElement>('#business-error-count');

  if (!output || !count) {
    return;
  }

  businessErrors.push(error);
  count.textContent = `${businessErrors.length} 条`;
  output.innerHTML = businessErrors
    .map(
      (item) => `
        <article class="business-error">
          <div class="business-error__main">
            <span class="business-error__code">${escapeHtml(item.code)}</span>
            <span class="business-error__message">${escapeHtml(item.message)}</span>
          </div>
          <div class="business-error__meta">
            <span class="business-error__meta-item"><strong>接口</strong> ${escapeHtml(item.method)} ${escapeHtml(item.url)}</span>
            <span class="business-error__meta-item"><strong>状态</strong> ${escapeHtml(String(item.status))}</span>
            <span class="business-error__meta-item"><strong>请求 ID</strong> ${escapeHtml(item.requestId)}</span>
            <span class="business-error__meta-item"><strong>时间</strong> ${escapeHtml(item.timestamp)}</span>
          </div>
        </article>
      `
    )
    .join('');
}

function renderSubmittedPayload(payload: ApiFeedbackSubmitPayload): void {
  const output = document.querySelector<HTMLElement>('#payload-output');

  if (!output) {
    return;
  }

  const metadata = payload.metadata;
  const screenshot = payload.screenshot;
  const summary = [
    {
      label: 'appId',
      value: metadata.appId
    },
    {
      label: '反馈文字',
      value: payload.feedbackText
    },
    {
      label: '截图',
      value: screenshot ? `${screenshot.type || 'image/png'} / ${formatBytes(screenshot.size)}` : '未附加'
    }
  ];

  output.innerHTML = `
    <div class="payload__grid">
      ${summary
        .map(
          (item) => `
            <div class="payload__item">
              <span class="payload__label">${escapeHtml(item.label)}</span>
              <div class="payload__value" title="${escapeHtml(item.value)}">${escapeHtml(item.value)}</div>
            </div>
          `
        )
        .join('')}
    </div>
    <pre class="payload__pre">${escapeHtml(
      JSON.stringify(
        {
          feedbackText: payload.feedbackText,
          metadata,
          screenshot: screenshot
            ? {
                type: screenshot.type,
                size: screenshot.size
              }
            : null
        },
        null,
        2
      )
    )}</pre>
  `;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return entities[char];
  });
}
