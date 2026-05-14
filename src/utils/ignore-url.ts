import type { CapturedApiContext } from '../types';
import type { ApiFeedbackState } from '../core/state';

export function shouldIgnoreUrl(state: ApiFeedbackState, context: CapturedApiContext): boolean {
  const url = context.request.url;

  if (state.options.endpoint && matchesStringUrl(url, state.options.endpoint, state.window)) {
    return true;
  }

  return (state.options.ignoreUrls ?? []).some((matcher) => {
    if (typeof matcher === 'string') {
      return matchesStringUrl(url, matcher, state.window);
    }

    if (matcher instanceof RegExp) {
      return matcher.test(url);
    }

    return matcher(url, context);
  });
}

export function toAbsoluteUrl(url: string, windowRef: Window): string {
  try {
    return new URL(url, windowRef.location.href).href;
  } catch {
    return url;
  }
}

function matchesStringUrl(url: string, matcher: string, windowRef: Window): boolean {
  const absoluteMatcher = toAbsoluteUrl(matcher, windowRef);
  return url === absoluteMatcher || url === matcher || url.includes(matcher);
}
