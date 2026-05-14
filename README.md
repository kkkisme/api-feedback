# API Feedback SDK

Framework-agnostic API feedback SDK. It observes `fetch` and `XMLHttpRequest`, but it never decides failures by itself. The business line defines whether a response should show feedback through `shouldShowFeedback`.

## Install

```ts
import { installApiFeedback } from '@api-feedback/sdk';

const feedback = installApiFeedback({
  appId: 'order-center',
  endpoint: '/api/feedback',
  shouldShowFeedback: async ({ responseBody }) => {
    if (responseBody?.code === 'ORDER_QUERY_FAILED') {
      return {
        code: responseBody.code,
        message: responseBody.message,
        reason: 'Business API marked this response as feedback-worthy'
      };
    }

    return false;
  }
});

feedback.setUserInfo({
  userId: 'u_123',
  username: 'Zhang San',
  tenantId: 't_456'
});
```

## Behavior

- `appId` is required and is included in every feedback payload.
- HTTP status codes, network errors, and JSON parse errors do not trigger feedback by default.
- Feedback is shown only when `shouldShowFeedback` returns `true` or a reason object.
- `setUserInfo()` replaces the full user info object. Use `clearUserInfo()` on logout or account switches.
- Screenshot capture uses `navigator.mediaDevices.getDisplayMedia`, so browsers always require a user gesture and permission prompt.

## Payload

The SDK submits `multipart/form-data`:

- `feedbackText`: user input
- `metadata`: JSON string with `appId`, page info, latest `userInfo`, API context, and business reason
- `screenshot`: optional PNG file

