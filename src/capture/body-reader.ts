import { headersToRecord } from '../utils/headers';
import { limitText, parseJsonLike, sanitizeValue, type RedactOptions } from '../utils/redact';

export interface ResponseBodyResult {
  responseBody?: unknown;
  responseText?: string;
}

export async function readResponseBody(
  response: Response,
  options: RedactOptions
): Promise<ResponseBodyResult> {
  const contentType = response.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const json = await response.json();
      return {
        responseBody: sanitizeValue(json, options),
        responseText: limitText(JSON.stringify(sanitizeValue(json, options)), options.maxBodyLength)
      };
    }

    const text = await response.text();
    const limitedText = limitText(text, options.maxBodyLength);

    return {
      responseBody: sanitizeValue(parseJsonLike(limitedText), options),
      responseText: limitedText
    };
  } catch (error) {
    return {
      responseBody: {
        readError: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

export function readXhrResponseBody(
  xhr: XMLHttpRequest,
  options: RedactOptions
): ResponseBodyResult {
  const responseText = getXhrResponseText(xhr);

  if (responseText === undefined) {
    return {};
  }

  const limitedText = limitText(responseText, options.maxBodyLength);

  return {
    responseBody: sanitizeValue(parseJsonLike(limitedText), options),
    responseText: limitedText
  };
}

export function readRequestBody(body: unknown, options: RedactOptions): unknown {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === 'string') {
    return sanitizeValue(parseJsonLike(limitText(body, options.maxBodyLength)), options);
  }

  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    return sanitizeValue(Object.fromEntries(body.entries()), options);
  }

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return sanitizeValue(Object.fromEntries(body.entries()), options);
  }

  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return sanitizeValue(body, options);
  }

  if (body instanceof ArrayBuffer) {
    return {
      type: 'ArrayBuffer',
      byteLength: body.byteLength
    };
  }

  if (ArrayBuffer.isView(body)) {
    return {
      type: body.constructor.name,
      byteLength: body.byteLength
    };
  }

  return sanitizeValue(String(body), options);
}

export function mergeFetchHeaders(input?: RequestInfo | URL, init?: RequestInit): Record<string, string> {
  const request = getRequest(input);

  return {
    ...headersToRecord(request?.headers),
    ...headersToRecord(init?.headers)
  };
}

function getRequest(input?: RequestInfo | URL): Request | undefined {
  if (typeof Request === 'undefined') {
    return undefined;
  }

  return input instanceof Request ? input : undefined;
}

function getXhrResponseText(xhr: XMLHttpRequest): string | undefined {
  try {
    if (xhr.responseType && xhr.responseType !== 'text') {
      return undefined;
    }

    return xhr.responseText;
  } catch {
    return undefined;
  }
}
