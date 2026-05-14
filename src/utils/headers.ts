export function headersToRecord(headers?: HeadersInit | Headers | null): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers.map(([key, value]) => [key, value]));
  }

  return Object.fromEntries(
    Object.entries(headers as Record<string, string>).map(([key, value]) => [key, String(value)])
  );
}

export function parseRawHeaders(rawHeaders: string): Record<string, string> {
  const headers: Record<string, string> = {};

  for (const line of rawHeaders.trim().split(/[\r\n]+/)) {
    if (!line) {
      continue;
    }

    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    headers[key] = value;
  }

  return headers;
}
