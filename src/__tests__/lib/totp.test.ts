import { describe, it, expect } from 'vitest';
import { base32Decode, base32Encode, generateTotp, getRemainingSeconds, generateSecret } from '../../lib/totp';

describe('base32Decode / base32Encode', () => {
  it('round-trips arbitrary bytes', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5, 250, 251, 252]);
    expect(base32Decode(base32Encode(bytes))).toEqual(bytes);
  });

  it('decodes the RFC 6238 SHA1 test secret correctly', () => {
    const decoded = base32Decode('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
    expect(new TextDecoder().decode(decoded)).toBe('12345678901234567890');
  });

  it('ignores whitespace, hyphens, and lowercase', () => {
    const a = base32Decode('GEZD GNBV-GY3T QOJQ');
    const b = base32Decode('gezdgnbvgy3tqojq');
    expect(a).toEqual(b);
  });

  it('strips padding characters', () => {
    expect(base32Decode('MFRGG===')).toEqual(base32Decode('MFRGG'));
  });

  it('throws on characters outside the Base32 alphabet', () => {
    expect(() => base32Decode('@@@invalid')).toThrow();
  });

  it('throws on an empty string', () => {
    expect(() => base32Decode('')).toThrow();
  });
});

describe('generateTotp (RFC 6238 Appendix B test vectors, SHA1, 8 digits)', () => {
  const secret = base32Encode(new TextEncoder().encode('12345678901234567890'));

  it.each([
    [59, '94287082'],
    [1111111109, '07081804'],
    [1111111111, '14050471'],
    [1234567890, '89005924'],
    [2000000000, '69279037'],
  ])('T=%i -> %s', (unixSeconds, expected) => {
    expect(generateTotp(secret, { digits: 8, period: 30, algorithm: 'SHA1', timestamp: unixSeconds * 1000 })).toBe(expected);
  });
});

describe('generateTotp defaults', () => {
  it('produces a 6-digit code by default', () => {
    const secret = base32Encode(new TextEncoder().encode('12345678901234567890'));
    expect(generateTotp(secret)).toHaveLength(6);
  });

  it('is deterministic for the same secret and timestamp', () => {
    const secret = base32Encode(new TextEncoder().encode('12345678901234567890'));
    const a = generateTotp(secret, { timestamp: 1700000000000 });
    const b = generateTotp(secret, { timestamp: 1700000000000 });
    expect(a).toBe(b);
  });

  it('throws for an empty secret', () => {
    expect(() => generateTotp('')).toThrow();
  });
});

describe('getRemainingSeconds', () => {
  it('computes seconds until the next period boundary', () => {
    expect(getRemainingSeconds(30, 59000)).toBe(1);
    expect(getRemainingSeconds(30, 60000)).toBe(30);
    expect(getRemainingSeconds(30, 89000)).toBe(1);
  });
});

describe('generateSecret', () => {
  it('produces a valid base32 string of the requested byte length', () => {
    const secret = generateSecret(20);
    expect(() => base32Decode(secret)).not.toThrow();
    expect(base32Decode(secret)).toHaveLength(20);
  });

  it('produces different secrets across calls', () => {
    expect(generateSecret()).not.toBe(generateSecret());
  });
});
