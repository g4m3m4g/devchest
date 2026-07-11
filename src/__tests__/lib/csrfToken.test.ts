import { describe, it, expect } from 'vitest';
import {
  generateCsrfToken,
  calculateEntropyBits,
  buildHiddenInputSnippet,
  buildHeaderSnippet,
} from '../../lib/csrfToken';

describe('generateCsrfToken', () => {
  it('produces a hex token of the expected length', () => {
    const token = generateCsrfToken({ byteLength: 16, encoding: 'hex' });
    expect(token).toMatch(/^[0-9a-f]{32}$/);
  });

  it('produces a base64 token', () => {
    const token = generateCsrfToken({ byteLength: 16, encoding: 'base64' });
    expect(token).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it('produces a base64url token with no padding or unsafe characters', () => {
    const token = generateCsrfToken({ byteLength: 32, encoding: 'base64url' });
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token).not.toContain('=');
  });

  it('produces an alphanumeric token of the requested byte length', () => {
    const token = generateCsrfToken({ byteLength: 24, encoding: 'alphanumeric' });
    expect(token).toMatch(/^[A-Za-z0-9]{24}$/);
  });

  it('defaults to a 32-byte base64url token', () => {
    const token = generateCsrfToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('produces different tokens across calls', () => {
    const a = generateCsrfToken();
    const b = generateCsrfToken();
    expect(a).not.toBe(b);
  });

  it('throws when byteLength is below the minimum secure size', () => {
    expect(() => generateCsrfToken({ byteLength: 8 })).toThrow();
  });
});

describe('calculateEntropyBits', () => {
  it('computes byteLength * 8, independent of encoding', () => {
    expect(calculateEntropyBits(32)).toBe(256);
    expect(calculateEntropyBits(16)).toBe(128);
  });
});

describe('buildHiddenInputSnippet', () => {
  it('embeds the token in a hidden input', () => {
    expect(buildHiddenInputSnippet('abc123')).toBe('<input type="hidden" name="csrf_token" value="abc123">');
  });

  it('respects a custom field name', () => {
    expect(buildHiddenInputSnippet('abc123', '_token')).toBe('<input type="hidden" name="_token" value="abc123">');
  });
});

describe('buildHeaderSnippet', () => {
  it('formats the token as an HTTP header', () => {
    expect(buildHeaderSnippet('abc123')).toBe('X-CSRF-Token: abc123');
  });

  it('respects a custom header name', () => {
    expect(buildHeaderSnippet('abc123', 'X-XSRF-TOKEN')).toBe('X-XSRF-TOKEN: abc123');
  });
});
