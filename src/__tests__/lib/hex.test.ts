import { describe, it, expect } from 'vitest';
import { encodeHex, decodeHex } from '../../lib/hex';

describe('encodeHex', () => {
  it('handles empty string', () => {
    expect(encodeHex('')).toBe('');
  });

  it('encodes ASCII text to lowercase hex with no delimiter by default', () => {
    expect(encodeHex('Hi')).toBe('4869');
  });

  it('encodes with a space delimiter', () => {
    expect(encodeHex('Hi', { delimiter: 'space' })).toBe('48 69');
  });

  it('encodes with a colon delimiter', () => {
    expect(encodeHex('Hi', { delimiter: 'colon' })).toBe('48:69');
  });

  it('encodes uppercase when requested', () => {
    expect(encodeHex('Hi', { uppercase: true })).toBe('4869'.toUpperCase());
  });

  it('encodes uppercase with a delimiter', () => {
    expect(encodeHex('Hi', { delimiter: 'space', uppercase: true })).toBe('48 69'.toUpperCase());
  });

  it('encodes multi-byte UTF-8 characters', () => {
    expect(encodeHex('café')).toBe('636166c3a9');
  });

  it('encodes emoji as their UTF-8 byte sequence', () => {
    expect(encodeHex('😀')).toBe('f09f9880');
  });
});

describe('decodeHex', () => {
  it('handles empty string', () => {
    expect(decodeHex('')).toBe('');
  });

  it('decodes a plain hex string', () => {
    expect(decodeHex('4869')).toBe('Hi');
  });

  it('decodes a space-delimited hex string', () => {
    expect(decodeHex('48 69')).toBe('Hi');
  });

  it('decodes a colon-delimited hex string', () => {
    expect(decodeHex('48:69')).toBe('Hi');
  });

  it('decodes uppercase hex', () => {
    expect(decodeHex('4869'.toUpperCase())).toBe('Hi');
  });

  it('decodes multi-byte UTF-8 sequences', () => {
    expect(decodeHex('636166c3a9')).toBe('café');
  });

  it('decodes emoji byte sequences', () => {
    expect(decodeHex('f09f9880')).toBe('😀');
  });

  it('ignores newlines and extra whitespace between bytes', () => {
    expect(decodeHex('48\n69  ')).toBe('Hi');
  });

  it('throws for an odd number of hex digits', () => {
    expect(() => decodeHex('486')).toThrow();
  });

  it('throws for non-hex characters', () => {
    expect(() => decodeHex('zz')).toThrow();
  });

  it('round-trips through all delimiter and case options', () => {
    const original = 'Hello, 世界 😀!';
    expect(decodeHex(encodeHex(original, { delimiter: 'none' }))).toBe(original);
    expect(decodeHex(encodeHex(original, { delimiter: 'space' }))).toBe(original);
    expect(decodeHex(encodeHex(original, { delimiter: 'colon' }))).toBe(original);
    expect(decodeHex(encodeHex(original, { uppercase: true }))).toBe(original);
  });
});
