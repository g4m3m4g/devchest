export interface HttpHeadersFormatOptions {
  sortHeaders: boolean;
  canonicalCase: boolean;
}

export interface ParsedHeader {
  name: string;
  value: string;
}

export interface HttpHeadersFormatResult {
  statusLine: string | null;
  headers: ParsedHeader[];
  output: string;
  error: string | null;
}

const HTTP_METHODS = new Set([
  'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT',
]);

function detectStatusLine(line: string): string | null {
  const method = line.split(' ')[0];
  if (HTTP_METHODS.has(method)) return line;
  if (/^HTTP\/\d+(\.\d+)?\s+\d{3}/.test(line)) return line;
  return null;
}

function toCanonicalCase(name: string): string {
  return name
    .split('-')
    .map(seg => seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase())
    .join('-');
}

export function formatHttpHeaders(
  input: string,
  options: HttpHeadersFormatOptions,
): HttpHeadersFormatResult {
  const trimmed = input.trim();
  if (!trimmed) return { statusLine: null, headers: [], output: '', error: null };

  const lines = trimmed.split(/\r?\n/);
  let statusLine: string | null = null;
  let startIdx = 0;

  const firstLine = lines[0].trim();
  const detected = detectStatusLine(firstLine);
  if (detected) {
    statusLine = detected;
    startIdx = 1;
  }

  const headers: ParsedHeader[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (!line.trim()) continue;

    // Folded header continuation (leading whitespace)
    if ((line.startsWith(' ') || line.startsWith('\t')) && headers.length > 0) {
      headers[headers.length - 1].value += ' ' + line.trim();
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx <= 0) {
      return {
        statusLine,
        headers: [],
        output: '',
        error: `Invalid header on line ${i + 1}: "${line.trim()}"`,
      };
    }

    headers.push({
      name: line.slice(0, colonIdx).trim(),
      value: line.slice(colonIdx + 1).trim(),
    });
  }

  let processed = headers.map(h => ({
    name: options.canonicalCase ? toCanonicalCase(h.name) : h.name,
    value: h.value,
  }));

  if (options.sortHeaders) {
    processed = [...processed].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );
  }

  const outputLines: string[] = [];
  if (statusLine) {
    outputLines.push(statusLine);
    outputLines.push('');
  }
  for (const h of processed) {
    outputLines.push(`${h.name}: ${h.value}`);
  }

  return {
    statusLine,
    headers: processed,
    output: outputLines.join('\n'),
    error: null,
  };
}
