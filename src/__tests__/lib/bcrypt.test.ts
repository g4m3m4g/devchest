import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, getHashRounds, isValidBcryptHash } from '../../lib/bcrypt';

describe('hashPassword', () => {
  it('produces a valid bcrypt hash', () => {
    const hash = hashPassword('correct horse battery staple', 4);
    expect(isValidBcryptHash(hash)).toBe(true);
  });

  it('encodes the requested cost factor into the hash', () => {
    const hash = hashPassword('hunter2', 6);
    expect(getHashRounds(hash)).toBe(6);
  });

  it('produces a different hash each time (random salt)', () => {
    const a = hashPassword('hunter2', 4);
    const b = hashPassword('hunter2', 4);
    expect(a).not.toBe(b);
  });

  it('throws for an empty password', () => {
    expect(() => hashPassword('', 4)).toThrow();
  });
});

describe('verifyPassword', () => {
  it('returns true for the correct password', () => {
    const hash = hashPassword('hunter2', 4);
    expect(verifyPassword('hunter2', hash)).toBe(true);
  });

  it('returns false for an incorrect password', () => {
    const hash = hashPassword('hunter2', 4);
    expect(verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('returns false for an empty password or hash', () => {
    const hash = hashPassword('hunter2', 4);
    expect(verifyPassword('', hash)).toBe(false);
    expect(verifyPassword('hunter2', '')).toBe(false);
  });

  it('returns false rather than throwing for a malformed hash', () => {
    expect(verifyPassword('hunter2', 'not-a-real-hash')).toBe(false);
  });
});

describe('getHashRounds', () => {
  it('reads the cost factor from a known hash', () => {
    expect(getHashRounds('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')).toBe(10);
  });
});

describe('isValidBcryptHash', () => {
  it('accepts a well-formed bcrypt hash', () => {
    expect(isValidBcryptHash('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')).toBe(true);
    expect(isValidBcryptHash('$2b$12$CwTycUXWue0Thq9StjUM0uJ8w1RbDlHYSKQ8oR/9m6d5f7q6mHHnW')).toBe(true);
  });

  it('rejects malformed input', () => {
    expect(isValidBcryptHash('not-a-hash')).toBe(false);
    expect(isValidBcryptHash('')).toBe(false);
    expect(isValidBcryptHash('$2a$10$tooshort')).toBe(false);
  });
});
