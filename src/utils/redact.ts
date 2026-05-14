const DEFAULT_REDACT_KEYS = [
  'authorization',
  'cookie',
  'set-cookie',
  'token',
  'access_token',
  'refresh_token',
  'password',
  'passwd',
  'secret',
  'mobile',
  'phone',
  'idcard',
  'id_card'
];

const REDACTED = '[redacted]';

export interface RedactOptions {
  maxBodyLength: number;
  redactKeys?: string[];
}

export function redactRecord(
  record: Record<string, string> | undefined,
  options: RedactOptions
): Record<string, string> | undefined {
  if (!record) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      shouldRedactKey(key, options.redactKeys) ? REDACTED : limitText(value, options.maxBodyLength)
    ])
  );
}

export function sanitizeValue(value: unknown, options: RedactOptions): unknown {
  return sanitize(value, options, new WeakSet<object>());
}

export function limitText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...[truncated ${value.length - maxLength} chars]`;
}

export function parseJsonLike(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function shouldRedactKey(key: string, customKeys: string[] = []): boolean {
  const normalized = key.toLowerCase().replace(/[-\s]/g, '_');
  const candidates = [...DEFAULT_REDACT_KEYS, ...customKeys.map((item) => item.toLowerCase())];

  return candidates.some((candidate) => {
    const normalizedCandidate = candidate.toLowerCase().replace(/[-\s]/g, '_');
    return normalized === normalizedCandidate || normalized.includes(normalizedCandidate);
  });
}

function sanitize(value: unknown, options: RedactOptions, seen: WeakSet<object>): unknown {
  if (typeof value === 'string') {
    return redactSensitiveText(limitText(value, options.maxBodyLength), options);
  }

  if (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'undefined'
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return {
      type: value.type || 'application/octet-stream',
      size: value.size
    };
  }

  if (typeof File !== 'undefined' && value instanceof File) {
    return {
      name: value.name,
      type: value.type || 'application/octet-stream',
      size: value.size
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, options, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[circular]';
    }

    seen.add(value);

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        shouldRedactKey(key, options.redactKeys) ? REDACTED : sanitize(item, options, seen)
      ])
    );
  }

  return String(value);
}

function redactSensitiveText(text: string, options: RedactOptions): string {
  let result = text;

  for (const key of [
    'authorization',
    'cookie',
    'token',
    'access_token',
    'refresh_token',
    'password',
    'secret',
    ...(options.redactKeys ?? [])
  ]) {
    const escaped = escapeRegExp(key);
    result = result.replace(
      new RegExp(`("${escaped}"\\s*:\\s*")([^"]+)(")`, 'gi'),
      `$1${REDACTED}$3`
    );
    result = result.replace(new RegExp(`(${escaped}=)([^&\\s]+)`, 'gi'), `$1${REDACTED}`);
  }

  return result;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
