import { describe, it, expect } from 'vitest';
import { encodeUrl, decodeUrl } from '../../lib/url';

describe('encodeUrl', () => {
  it('encodes spaces as %20', () => {
    expect(encodeUrl('hello world')).toBe('hello%20world');
  });

  it('encodes special characters', () => {
    expect(encodeUrl('hello&world=1')).toBe('hello%26world%3D1');
  });

  it('encodes slashes', () => {
    expect(encodeUrl('a/b/c')).toBe('a%2Fb%2Fc');
  });

  it('encodes question marks', () => {
    expect(encodeUrl('search?q=test')).toBe('search%3Fq%3Dtest');
  });

  it('handles empty string', () => {
    expect(encodeUrl('')).toBe('');
  });

  it('leaves alphanumerics unchanged', () => {
    expect(encodeUrl('abc123')).toBe('abc123');
  });

  it('leaves safe chars unchanged', () => {
    const safe = 'hello-world_test.path~example';
    expect(encodeUrl(safe)).toBe(safe);
  });

  it('encodes unicode characters', () => {
    const result = encodeUrl('café');
    expect(result).toContain('%');
  });
});

describe('decodeUrl', () => {
  it('decodes %20 as space', () => {
    expect(decodeUrl('hello%20world')).toBe('hello world');
  });

  it('decodes encoded special chars', () => {
    expect(decodeUrl('hello%26world%3D1')).toBe('hello&world=1');
  });

  it('handles empty string', () => {
    expect(decodeUrl('')).toBe('');
  });

  it('returns error for invalid encoding', () => {
    const result = decodeUrl('hello%ZZworld');
    expect(result).toContain('[Error');
  });

  it('round-trips correctly', () => {
    const original = 'https://example.com/path?q=hello world&lang=en';
    expect(decodeUrl(encodeUrl(original))).toBe(original);
  });

  it('decodes plus signs correctly', () => {
    expect(decodeUrl('hello%2Bworld')).toBe('hello+world');
  });
});
