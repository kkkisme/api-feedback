# API Feedback SDK

一个框架无关的 API 报错反馈 SDK。它会自动观察页面里的 `fetch` 和 `XMLHttpRequest` 请求，但**默认不会因为 HTTP 500、网络异常或 JSON 解析失败弹出反馈入口**。是否展示「出现错误？立即反馈！」完全由业务侧通过 `shouldShowFeedback` 定义。

SDK 适合放进多个业务线项目里统一收集用户反馈、页面信息、用户信息、接口上下文和当前标签页截图。所有反馈都会携带必填的 `appId`，用于区分数据来自哪条业务线。

## 特性

- 框架无关：React、Vue、原生页面都可以接入。
- 自动观察 `fetch` 和 `XMLHttpRequest`。
- 默认不判断业务失败，只有 `shouldShowFeedback` 返回 `true` 或原因对象时才展示 toast。
- 支持一个反馈里收集多个业务接口错误，提交时放入 `metadata.apiError` 数组。
- 支持 `setUserInfo()` / `clearUserInfo()`，提交时读取最新用户信息。
- 支持通过 `navigator.mediaDevices.getDisplayMedia` 截取当前标签页截图。
- 自动忽略反馈提交接口，避免反馈提交失败后再次触发反馈。
- 支持自定义提交逻辑、忽略 URL、脱敏字段、文案和 body 最大采集长度。

## 安装

```bash
npm install @linsy-utils/api-feedback
```

本仓库开发调试：

```bash
npm install
npm run dev
```

打开 `http://localhost:5173/` 查看 vanilla demo。

## 快速接入

```ts
import { installApiFeedback } from '@linsy-utils/api-feedback';

const feedback = installApiFeedback({
  appId: 'order-center',
  endpoint: '/api/feedback',

  shouldShowFeedback: async ({ responseBody }) => {
    const body = responseBody as { code?: string; message?: string } | undefined;

    if (body?.code === 'ORDER_QUERY_FAILED') {
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
```

接入后，当业务接口返回 `ORDER_QUERY_FAILED` 时，页面右下角会出现 toast：

```text
出现错误？ 立即反馈！
```

用户点击「立即反馈！」后会打开页面右下角的悬浮反馈窗，可以输入问题、截取当前标签页截图并提交。

## 重要原则

SDK 不内置任何失败判断规则。

也就是说，下面这些情况都**不会默认弹出反馈**：

- HTTP 状态码是 `400`、`500`。
- `fetch` 网络异常。
- XHR `error`。
- 响应体 JSON 解析失败。
- 接口返回任意业务错误码。

只有业务配置的 `shouldShowFeedback` 返回 `true` 或原因对象时，SDK 才会展示反馈入口。

## API

### `installApiFeedback(options)`

初始化 SDK，并返回控制器。

```ts
const feedback = installApiFeedback({
  appId: 'order-center',
  endpoint: '/api/feedback',
  shouldShowFeedback: async (context) => false
});
```

`appId` 是必填字段。缺失或为空字符串时，初始化会抛出：

```text
[api-feedback] appId is required.
```

### `feedback.setUserInfo(userInfo)`

设置用户信息。多次调用时，后一次会完整覆盖前一次。

```ts
feedback.setUserInfo({
  userId: 'u_123',
  username: '张三',
  tenantId: 't_456'
});
```

用户信息通常不会在 SDK 初始化时同步拿到，可以在登录完成、用户信息接口返回后再调用。

### `feedback.clearUserInfo()`

清空用户信息。建议在退出登录、切换账号或租户切换时调用。

```ts
feedback.clearUserInfo();
```

### `feedback.openFeedback(context?)`

手动打开右下角悬浮反馈窗。可选传入一段接口上下文，适合非自动拦截场景。

```ts
feedback.openFeedback({
  request: {
    url: '/api/order/list',
    method: 'GET'
  },
  response: {
    status: 200,
    statusText: 'OK'
  },
  responseBody: {
    code: 'ORDER_QUERY_FAILED',
    message: '订单查询失败'
  }
});
```

### `feedback.uninstall()`

卸载 SDK，恢复原始 `fetch` / `XMLHttpRequest`，并移除 UI。

```ts
feedback.uninstall();
```

## 配置项

```ts
interface ApiFeedbackOptions {
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
```

### `appId`

必填。标识反馈数据来源于哪条业务线，例如：

```ts
appId: 'order-center'
appId: 'member-center'
appId: 'mall-admin'
```

所有提交都会写入 `metadata.appId`。

### `endpoint`

反馈提交接口。SDK 默认会用原始 `fetch` 以 `POST multipart/form-data` 提交到该地址。

```ts
installApiFeedback({
  appId: 'order-center',
  endpoint: '/api/feedback'
});
```

如果同时配置了 `submit`，会优先使用 `submit`，不再自动请求 `endpoint`。

### `submit`

自定义提交逻辑。适合接入已有请求库、统一鉴权、网关签名或前端埋点通道。

```ts
installApiFeedback({
  appId: 'order-center',
  submit: async ({ formData }) => {
    await fetch('/api/feedback', {
      method: 'POST',
      body: formData
    });
  }
});
```

这里的 `formData` 是浏览器原生的 `FormData` 实例，SDK 已经按 `multipart/form-data` 格式组装好，可以直接作为请求 body 提交。

### `shouldShowFeedback`

业务失败判断函数。返回值含义：

- `false`：不展示反馈入口。
- `true`：展示反馈入口，并使用默认错误信息。
- `ApiFeedbackReason` 对象：展示反馈入口，并把原因写入 `metadata.apiError[].businessReason`。

```ts
shouldShowFeedback: async ({ request, response, responseBody, error }) => {
  const body = responseBody as { code?: string; message?: string } | undefined;

  if (body?.code === 'ORDER_QUERY_FAILED') {
    return {
      code: body.code,
      message: body.message,
      reason: '订单业务失败，需要用户反馈',
      toastText: '订单查询失败？'
    };
  }

  return false;
}
```

`toastText` 可以覆盖本次 toast 左侧文案，右侧仍然是可点击的「立即反馈！」。

### `ignoreUrls`

忽略指定接口，不参与采集和反馈判断。

```ts
ignoreUrls: [
  '/api/health',
  /\/api\/log\//,
  (url, context) => context.request.method === 'OPTIONS'
]
```

SDK 会自动忽略 `endpoint` 对应的反馈提交接口。

### `maxBodyLength`

请求体、响应体、文本字段的最大采集长度，默认 `8000`。

```ts
maxBodyLength: 12000
```

### `toastCooldownMs`

相同接口错误的 toast 冷却时间，默认 `30000`。用于避免同一个接口在短时间内频繁弹出。

不同接口错误会收集到同一个待反馈队列中。用户提交前，当前队列里的错误会一起进入 `metadata.apiError` 数组。

### `redactKeys`

额外脱敏字段。SDK 默认会脱敏 `authorization`、`cookie`、`token`、`password`、`mobile`、`phone`、`idcard` 等常见敏感字段。

```ts
redactKeys: ['email', 'bankCardNo']
```

### `labels`

覆盖 UI 文案。

```ts
labels: {
  toastText: '出现错误？',
  toastAction: '立即反馈！',
  feedbackLabel: '请描述你的问题（必填）',
  feedbackPlaceholder: '你的问题'
}
```

## 提交参数

SDK 默认提交 `multipart/form-data`：

- `feedbackText`：用户输入的问题描述。
- `metadata`：JSON 字符串。
- `screenshot`：可选 PNG 文件。

`submit` 回调中会拿到结构化参数：

```ts
interface ApiFeedbackSubmitPayload {
  formData: FormData;
  metadata: ApiFeedbackMetadata;
  feedbackText: string;
  screenshot?: Blob;
}
```

字段说明：

- `formData`：浏览器原生 `FormData` 实例，里面已经包含 `feedbackText`、`metadata` 和可选的 `screenshot`，适合直接上传到后端。
- `metadata`：结构化对象，内容和 `formData` 里的 `metadata` JSON 字符串一致，方便自定义提交前读取、调试或上报到非表单通道。
- `feedbackText`：用户在反馈浮窗输入的问题描述。
- `screenshot`：用户截取的 PNG 图片 Blob；未截图时为空。

如果使用 `fetch` 直接提交 `formData`，不要手动设置 `Content-Type`，浏览器会自动补齐 `multipart/form-data` 的 boundary。

`metadata` 示例：

```json
{
  "appId": "order-center",
  "pageUrl": "https://example.com/orders",
  "pageTitle": "订单中心",
  "timestamp": "2026-05-14T03:20:00.000Z",
  "userAgent": "Mozilla/5.0 ...",
  "viewport": {
    "width": 1440,
    "height": 900,
    "devicePixelRatio": 2
  },
  "userInfo": {
    "userId": "u_123",
    "tenantId": "t_456"
  },
  "apiError": [
    {
      "transport": "fetch",
      "url": "https://example.com/api/order/list",
      "method": "GET",
      "status": 200,
      "duration": 128,
      "requestId": "demo-request-id",
      "businessCode": "ORDER_QUERY_FAILED",
      "message": "订单查询失败",
      "reason": "业务接口定义为需要反馈",
      "responseBody": {
        "code": "ORDER_QUERY_FAILED",
        "message": "订单查询失败"
      }
    }
  ]
}
```

当多个接口在用户提交前都触发了反馈条件时，`apiError` 会包含多条记录。

## 截图说明

截图使用浏览器标准能力：

```ts
navigator.mediaDevices.getDisplayMedia(...)
```

当前实现会尽量引导用户选择当前标签页，并在截图时临时隐藏 SDK 的 toast 和反馈浮窗，避免把反馈面板截进去。

注意：

- 浏览器必须由用户点击触发截图，不能静默截图。
- 浏览器会弹出权限确认框。
- 如果用户取消授权，仍然可以只提交文字反馈。
- 如果浏览器不支持 `getDisplayMedia`，仍然可以只提交文字反馈。
- 如果用户选择了窗口或整个屏幕，而不是当前标签页，SDK 会提示重新选择当前标签页。

## UI 行为

- 业务错误触发的 toast 会显示在页面右下角，文案为「出现错误？」。
- 「立即反馈！」是蓝色下划线文字，可点击打开右下角悬浮反馈窗。
- toast 可通过右侧关闭按钮关闭；关闭后会丢弃当前待反馈错误队列。
- 反馈浮窗右上角提供最小化和关闭按钮；最小化会保留已填写内容和截图，并在右下角显示「继续填写」恢复入口。
- 关闭按钮会收起浮窗并丢弃当前待反馈错误队列。
- 提交成功后，反馈浮窗展示成功信息，此时只保留右上角关闭按钮。
- 截图预览可以点击查看大图。
- 截图右上角有红色删除按钮，可以移除截图。

## Demo

启动 demo：

```bash
npm run dev
```

访问：

```text
http://localhost:5173/
```

demo 包含：

- `模拟失败1`：返回 `ORDER_QUERY_FAILED`。
- `模拟失败2`：返回 `MEMBER_QUERY_FAILED`。
- 页面内展示业务接口返回的错误。
- 页面内展示提交反馈时 SDK 准备发送给后端的参数。

可以连续点击两个模拟按钮，再提交一次反馈，观察 `metadata.apiError` 数组里会包含两条业务错误。

### 部署到 Vercel

先构建 example：

```bash
npm run build:example
```

部署预览环境：

```bash
npm run deploy:example
```

部署生产环境：

```bash
npm run deploy:example:prod
```

部署命令会先把 `examples/vanilla` 构建到 `dist-example/`，再通过 Vercel CLI 上传该目录。第一次执行时，Vercel CLI 会要求登录并选择或创建项目。

## 开发命令

```bash
npm run dev
npm run build:example
npm run deploy:example
npm run deploy:example:prod
npm run typecheck
npm run test
npm run build
```

## 推荐接入方式

建议在业务应用启动时安装 SDK，在用户信息异步加载完成后再调用 `setUserInfo()`。

```ts
const feedback = installApiFeedback({
  appId: 'member-center',
  endpoint: '/api/feedback',
  shouldShowFeedback: async ({ responseBody }) => {
    const body = responseBody as { success?: boolean; code?: string; message?: string };

    if (body.success === false && body.code?.startsWith('MEMBER_')) {
      return {
        code: body.code,
        message: body.message,
        reason: '会员业务接口失败'
      };
    }

    return false;
  }
});

loadCurrentUser().then((user) => {
  feedback.setUserInfo({
    userId: user.id,
    username: user.name,
    tenantId: user.tenantId
  });
});
```

退出登录时：

```ts
feedback.clearUserInfo();
```

应用卸载或微前端子应用卸载时：

```ts
feedback.uninstall();
```
