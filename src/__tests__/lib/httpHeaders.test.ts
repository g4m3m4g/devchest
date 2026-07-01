import { describe, it, expect } from 'vitest';
import { formatHttpHeaders } from '../../lib/httpHeaders';

const DEFAULT = { sortHeaders: false, canonicalCase: false };

describe('formatHttpHeaders', () => {
  // ── empty / whitespace ────────────────────────────────────────────────────
  it('returns empty result for empty input', () => {
    const r = formatHttpHeaders('', DEFAULT);
    expect(r.output).toBe('');
    expect(r.error).toBeNull();
    expect(r.headers).toHaveLength(0);
    expect(r.statusLine).toBeNull();
  });

  it('returns empty result for whitespace-only input', () => {
    const r = formatHttpHeaders('   \n  ', DEFAULT);
    expect(r.output).toBe('');
    expect(r.error).toBeNull();
  });

  // ── plain headers (no status line) ──────────────────────────────────────
  it('parses a single header', () => {
    const r = formatHttpHeaders('Content-Type: application/json', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.headers).toHaveLength(1);
    expect(r.headers[0]).toEqual({ name: 'Content-Type', value: 'application/json' });
    expect(r.statusLine).toBeNull();
  });

  it('parses multiple headers', () => {
    const input = 'Host: example.com\nAccept: text/html\nAccept-Language: en';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.headers).toHaveLength(3);
    expect(r.headers[0].name).toBe('Host');
    expect(r.headers[1].name).toBe('Accept');
    expect(r.headers[2].name).toBe('Accept-Language');
  });

  it('trims extra whitespace around header values', () => {
    const r = formatHttpHeaders('Content-Type:   text/html   ', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.headers[0].value).toBe('text/html');
  });

  it('handles header values that contain colons', () => {
    const r = formatHttpHeaders('Authorization: Bearer token:extra:parts', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.headers[0].value).toBe('Bearer token:extra:parts');
  });

  it('handles header values that are URLs', () => {
    const r = formatHttpHeaders('Location: https://example.com/path?q=1', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.headers[0].value).toBe('https://example.com/path?q=1');
  });

  // ── request line detection ────────────────────────────────────────────────
  it('detects a GET request line', () => {
    const input = 'GET / HTTP/1.1\nHost: example.com';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.statusLine).toBe('GET / HTTP/1.1');
    expect(r.headers).toHaveLength(1);
    expect(r.headers[0].name).toBe('Host');
  });

  it('detects a POST request line', () => {
    const input = 'POST /api/users HTTP/1.1\nContent-Type: application/json';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.statusLine).toBe('POST /api/users HTTP/1.1');
    expect(r.headers).toHaveLength(1);
  });

  it('detects all common HTTP methods', () => {
    for (const method of ['GET','POST','PUT','DELETE','PATCH','HEAD','OPTIONS']) {
      const r = formatHttpHeaders(`${method} / HTTP/1.1\nHost: x.com`, DEFAULT);
      expect(r.statusLine).toBe(`${method} / HTTP/1.1`);
    }
  });

  // ── response line detection ───────────────────────────────────────────────
  it('detects an HTTP/1.1 response line', () => {
    const input = 'HTTP/1.1 200 OK\nContent-Type: text/html';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.statusLine).toBe('HTTP/1.1 200 OK');
    expect(r.headers).toHaveLength(1);
  });

  it('detects a 404 response line', () => {
    const input = 'HTTP/1.1 404 Not Found\nContent-Length: 0';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.statusLine).toBe('HTTP/1.1 404 Not Found');
  });

  it('detects an HTTP/2 response line', () => {
    const input = 'HTTP/2 200\ncontent-type: text/html';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.statusLine).toBe('HTTP/2 200');
  });

  // ── CRLF line endings ─────────────────────────────────────────────────────
  it('handles CRLF line endings', () => {
    const input = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: 42';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.statusLine).toBe('HTTP/1.1 200 OK');
    expect(r.headers).toHaveLength(2);
  });

  // ── duplicate headers ─────────────────────────────────────────────────────
  it('preserves duplicate header names (e.g. Set-Cookie)', () => {
    const input = 'Set-Cookie: a=1; Path=/\nSet-Cookie: b=2; Path=/';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.headers).toHaveLength(2);
    expect(r.headers[0].name).toBe('Set-Cookie');
    expect(r.headers[1].name).toBe('Set-Cookie');
  });

  // ── blank lines between headers ────────────────────────────────────────────
  it('skips blank lines between headers', () => {
    const input = 'Content-Type: text/html\n\nContent-Length: 42';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.headers).toHaveLength(2);
  });

  // ── sortHeaders option ────────────────────────────────────────────────────
  it('sorts headers alphabetically when sortHeaders is true', () => {
    const input = 'X-Custom: a\nAccept: b\nContent-Type: c';
    const r = formatHttpHeaders(input, { ...DEFAULT, sortHeaders: true });
    expect(r.error).toBeNull();
    const names = r.headers.map(h => h.name);
    expect(names).toEqual(['Accept', 'Content-Type', 'X-Custom']);
  });

  it('does not sort when sortHeaders is false', () => {
    const input = 'Z-Header: z\nA-Header: a';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.headers[0].name).toBe('Z-Header');
    expect(r.headers[1].name).toBe('A-Header');
  });

  // ── canonicalCase option ──────────────────────────────────────────────────
  it('normalizes header names to title-case when canonicalCase is true', () => {
    const input = 'content-type: text/html\naccept-encoding: gzip';
    const r = formatHttpHeaders(input, { ...DEFAULT, canonicalCase: true });
    expect(r.error).toBeNull();
    expect(r.headers[0].name).toBe('Content-Type');
    expect(r.headers[1].name).toBe('Accept-Encoding');
  });

  it('leaves header names unchanged when canonicalCase is false', () => {
    const input = 'content-type: text/html';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.headers[0].name).toBe('content-type');
  });

  it('handles single-word header names in canonical case', () => {
    const r = formatHttpHeaders('host: example.com', { ...DEFAULT, canonicalCase: true });
    expect(r.error).toBeNull();
    expect(r.headers[0].name).toBe('Host');
  });

  it('handles multi-segment header names in canonical case', () => {
    const r = formatHttpHeaders('x-request-id: abc', { ...DEFAULT, canonicalCase: true });
    expect(r.error).toBeNull();
    expect(r.headers[0].name).toBe('X-Request-Id');
  });

  // ── output text format ────────────────────────────────────────────────────
  it('outputs headers as Name: Value lines', () => {
    const r = formatHttpHeaders('Host: example.com\nAccept: */*', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('Host: example.com');
    expect(r.output).toContain('Accept: */*');
  });

  it('includes status line in output followed by blank line', () => {
    const input = 'HTTP/1.1 200 OK\nContent-Type: text/html';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toMatch(/^HTTP\/1\.1 200 OK\n\nContent-Type:/);
  });

  // ── error cases ───────────────────────────────────────────────────────────
  it('returns error for a non-header line (no colon) after the first line', () => {
    const r = formatHttpHeaders('HTTP/1.1 200 OK\nthisisnot a header', DEFAULT);
    expect(r.error).not.toBeNull();
    expect(r.output).toBe('');
  });

  it('returns error for a plain line with no colon and no status line', () => {
    const r = formatHttpHeaders('Content-Type: text/html\nmalformedline', DEFAULT);
    expect(r.error).not.toBeNull();
    expect(r.output).toBe('');
  });

  // ── folded headers (continuation lines) ───────────────────────────────────
  it('folds continuation lines into the previous header value', () => {
    const input = 'X-Long-Header: first part\n  continuation';
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.headers).toHaveLength(1);
    expect(r.headers[0].value).toContain('first part');
    expect(r.headers[0].value).toContain('continuation');
  });

  // ── realistic examples ────────────────────────────────────────────────────
  it('formats a realistic HTTP request', () => {
    const input = [
      'GET /api/v1/users HTTP/1.1',
      'Host: api.example.com',
      'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9',
      'Accept: application/json',
      'Accept-Encoding: gzip, deflate, br',
      'User-Agent: Mozilla/5.0',
    ].join('\n');
    const r = formatHttpHeaders(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.statusLine).toBe('GET /api/v1/users HTTP/1.1');
    expect(r.headers).toHaveLength(5);
    expect(r.output).toContain('Host: api.example.com');
    expect(r.output).toContain('Authorization: Bearer');
  });

  it('formats a realistic HTTP response', () => {
    const input = [
      'HTTP/1.1 201 Created',
      'content-type: application/json; charset=utf-8',
      'location: /api/v1/users/42',
      'cache-control: no-cache',
      'x-request-id: req_abc123',
    ].join('\n');
    const r = formatHttpHeaders(input, { ...DEFAULT, canonicalCase: true });
    expect(r.error).toBeNull();
    expect(r.statusLine).toBe('HTTP/1.1 201 Created');
    expect(r.headers[0].name).toBe('Content-Type');
    expect(r.headers[1].name).toBe('Location');
  });
});
