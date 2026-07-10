import { describe, it, expect } from 'vitest';
import { generateUlid, decodeUlidTimestamp, isValidUlid } from '../../lib/ulid';

describe('generateUlid', () => {
  it('produces a 26-character string', () => {
    expect(generateUlid()).toHaveLength(26);
  });

  it('only uses Crockford base32 characters', () => {
    const ulid = generateUlid();
    expect(ulid).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  it('produces distinct ULIDs on successive calls', () => {
    const a = generateUlid();
    const b = generateUlid();
    expect(a).not.toBe(b);
  });

  it('encodes a specific timestamp deterministically in the time component', () => {
    const ulid = generateUlid(1_469_918_176_385);
    expect(ulid.slice(0, 10)).toBe('01ARYZ6S41');
  });

  it('sorts lexicographically in chronological order', () => {
    const earlier = generateUlid(1000);
    const later = generateUlid(2000);
    expect(earlier < later).toBe(true);
  });
});

describe('decodeUlidTimestamp', () => {
  it('round-trips a timestamp through encode and decode', () => {
    const ts = 1_700_000_000_000;
    const ulid = generateUlid(ts);
    expect(decodeUlidTimestamp(ulid)).toBe(ts);
  });

  it('decodes the known ULID spec example', () => {
    expect(decodeUlidTimestamp('01ARYZ6S41TSV4RRFFQ69G5FAV')).toBe(1_469_918_176_385);
  });

  it('throws on an invalid ULID', () => {
    expect(() => decodeUlidTimestamp('not-a-ulid')).toThrow();
  });
});

describe('isValidUlid', () => {
  it('accepts a well-formed ULID', () => {
    expect(isValidUlid('01ARYZ6S41TSV4RRFFQ69G5FAV')).toBe(true);
  });

  it('rejects the wrong length', () => {
    expect(isValidUlid('01ARYZ6S41TSV4RRFFQ69G5FA')).toBe(false);
  });

  it('rejects characters outside the Crockford alphabet', () => {
    expect(isValidUlid('01ARYZ6S41TSV4RRFFQ69G5FAI')).toBe(false);
    expect(isValidUlid('01ARYZ6S41TSV4RRFFQ69G5FAL')).toBe(false);
    expect(isValidUlid('01ARYZ6S41TSV4RRFFQ69G5FAO')).toBe(false);
    expect(isValidUlid('01ARYZ6S41TSV4RRFFQ69G5FAU')).toBe(false);
  });
});
