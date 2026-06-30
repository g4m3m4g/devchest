import { describe, it, expect } from 'vitest';
import { base64UrlDecode, decodeJwt, getExpStatus, jwtFormatRelative } from '../../lib/jwt';

// A valid JWT for testing: header={alg:HS256,typ:JWT} payload={sub:1234567890,name:John Doe,iat:1516239022}
const VALID_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('base64UrlDecode', () => {
  it('decodes standard base64url without padding', () => {
    const result = base64UrlDecode('aGVsbG8');
    expect(result).toBe('hello');
  });

  it('handles URL-safe chars: - and _', () => {
    // "hello+world" in base64 is "aGVsbG8rd29ybGQ=" but base64url uses "-" instead of "+"
    const result = base64UrlDecode('aGVsbG8=');
    expect(result).toBe('hello');
  });

  it('adds missing padding automatically', () => {
    const result = base64UrlDecode('aGVsbG8');
    expect(result).toBe('hello');
  });
});

describe('decodeJwt', () => {
  it('decodes a valid JWT into header, payload, signature', () => {
    const result = decodeJwt(VALID_JWT);
    expect(result.error).toBeNull();
    expect(result.header).toContain('HS256');
    expect(result.header).toContain('JWT');
  });

  it('extracts payload fields correctly', () => {
    const result = decodeJwt(VALID_JWT);
    expect(result.payloadObj?.sub).toBe('1234567890');
    expect(result.payloadObj?.name).toBe('John Doe');
    expect(result.payloadObj?.iat).toBe(1516239022);
  });

  it('preserves the signature', () => {
    const result = decodeJwt(VALID_JWT);
    expect(result.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  });

  it('returns formatted JSON strings', () => {
    const result = decodeJwt(VALID_JWT);
    expect(() => JSON.parse(result.header)).not.toThrow();
    expect(() => JSON.parse(result.payload)).not.toThrow();
  });

  it('returns error for token with wrong number of parts', () => {
    const result = decodeJwt('only.two');
    expect(result.error).toBeTruthy();
    expect(result.error).toContain('3 dot-separated parts');
  });

  it('returns error for empty string', () => {
    const result = decodeJwt('');
    expect(result.error).toBeTruthy();
  });

  it('returns error for completely invalid token', () => {
    const result = decodeJwt('not.a.jwt');
    expect(result.error).toBeTruthy();
  });

  it('handles whitespace-padded token', () => {
    const result = decodeJwt(`  ${VALID_JWT}  `);
    expect(result.error).toBeNull();
  });
});

describe('getExpStatus', () => {
  it('returns null when payload has no exp field', () => {
    const result = getExpStatus({ sub: '123' }, 1000);
    expect(result).toBeNull();
  });

  it('detects expired token', () => {
    const nowTs = 2000000000;
    const result = getExpStatus({ exp: 1000000000 }, nowTs);
    expect(result?.expired).toBe(true);
    expect(result?.label).toContain('ago');
  });

  it('detects valid (not expired) token', () => {
    const nowTs = 1000000000;
    const result = getExpStatus({ exp: 2000000000 }, nowTs);
    expect(result?.expired).toBe(false);
    expect(result?.label).toContain('Expires in');
  });

  it('includes the ISO expiry date', () => {
    const exp = 1700000000;
    const result = getExpStatus({ exp }, 0);
    expect(result?.isoExpiry).toContain('2023');
  });
});

describe('jwtFormatRelative', () => {
  it('formats seconds', () => {
    expect(jwtFormatRelative(45)).toBe('45s');
  });

  it('formats minutes', () => {
    expect(jwtFormatRelative(90)).toBe('1m');
  });

  it('formats hours', () => {
    expect(jwtFormatRelative(7200)).toBe('2h');
  });

  it('formats days', () => {
    expect(jwtFormatRelative(172800)).toBe('2d');
  });
});
