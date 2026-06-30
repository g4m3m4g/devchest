import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64 } from '../../lib/base64';

describe('encodeBase64', () => {
  it('encodes plain ASCII text', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
  });

  it('encodes empty string', () => {
    expect(encodeBase64('')).toBe('');
  });

  it('encodes text with spaces', () => {
    expect(encodeBase64('hello world')).toBe('aGVsbG8gd29ybGQ=');
  });

  it('encodes a URL string', () => {
    const result = encodeBase64('https://example.com');
    expect(result).toBe('aHR0cHM6Ly9leGFtcGxlLmNvbQ==');
  });

  it('encodes JSON string', () => {
    const json = '{"key":"value"}';
    const encoded = encodeBase64(json);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);
    // round-trip verification
    expect(decodeBase64(encoded)).toBe(json);
  });

  it('encodes unicode text', () => {
    const result = encodeBase64('café');
    expect(typeof result).toBe('string');
    expect(decodeBase64(result)).toBe('café');
  });

  it('produces only base64 characters', () => {
    const result = encodeBase64('test string for encoding');
    expect(result).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

describe('decodeBase64', () => {
  it('decodes basic base64', () => {
    expect(decodeBase64('aGVsbG8=')).toBe('hello');
  });

  it('decodes empty string', () => {
    expect(decodeBase64('')).toBe('');
  });

  it('decodes with padding', () => {
    expect(decodeBase64('aGVsbG8gd29ybGQ=')).toBe('hello world');
  });

  it('handles whitespace around input', () => {
    expect(decodeBase64('  aGVsbG8=  ')).toBe('hello');
  });

  it('returns error message for invalid input', () => {
    const result = decodeBase64('!!!not-valid-base64!!!');
    expect(result).toContain('[Error');
  });

  it('round-trips correctly', () => {
    const original = 'The quick brown fox';
    expect(decodeBase64(encodeBase64(original))).toBe(original);
  });
});
