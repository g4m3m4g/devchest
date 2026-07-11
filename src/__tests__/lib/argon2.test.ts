import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, isValidArgon2Hash, parseArgon2Hash } from '../../lib/argon2';

const FAST_OPTS = { timeCost: 1, memoryCost: 8, parallelism: 1, hashLength: 16 };

describe('hashPassword', () => {
  it('produces a well-formed argon2id PHC string by default', () => {
    const hash = hashPassword('hunter2', FAST_OPTS);
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=8,t=1,p=1\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/);
    expect(isValidArgon2Hash(hash)).toBe(true);
  });

  it('encodes the requested variant', () => {
    const hash = hashPassword('hunter2', { ...FAST_OPTS, variant: 'argon2i' });
    expect(hash.startsWith('$argon2i$')).toBe(true);
  });

  it('produces a different hash each time (random salt)', () => {
    const a = hashPassword('hunter2', FAST_OPTS);
    const b = hashPassword('hunter2', FAST_OPTS);
    expect(a).not.toBe(b);
  });

  it('throws for an empty password', () => {
    expect(() => hashPassword('', FAST_OPTS)).toThrow();
  });
});

describe('verifyPassword', () => {
  it('returns true for the correct password', () => {
    const hash = hashPassword('hunter2', FAST_OPTS);
    expect(verifyPassword('hunter2', hash)).toBe(true);
  });

  it('returns false for an incorrect password', () => {
    const hash = hashPassword('hunter2', FAST_OPTS);
    expect(verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('returns false for a malformed hash rather than throwing', () => {
    expect(verifyPassword('hunter2', 'not-a-real-hash')).toBe(false);
  });

  it('verifies correctly across all three variants', () => {
    for (const variant of ['argon2id', 'argon2i', 'argon2d'] as const) {
      const hash = hashPassword('hunter2', { ...FAST_OPTS, variant });
      expect(verifyPassword('hunter2', hash)).toBe(true);
      expect(verifyPassword('wrong', hash)).toBe(false);
    }
  });
});

describe('parseArgon2Hash', () => {
  it('extracts variant and cost parameters from an encoded hash', () => {
    const hash = hashPassword('hunter2', { ...FAST_OPTS, timeCost: 3, memoryCost: 64, parallelism: 2 });
    const parsed = parseArgon2Hash(hash);
    expect(parsed).not.toBeNull();
    expect(parsed?.variant).toBe('argon2id');
    expect(parsed?.timeCost).toBe(3);
    expect(parsed?.memoryCost).toBe(64);
    expect(parsed?.parallelism).toBe(2);
  });

  it('returns null for malformed input', () => {
    expect(parseArgon2Hash('not-a-hash')).toBeNull();
    expect(parseArgon2Hash('')).toBeNull();
  });
});

describe('isValidArgon2Hash', () => {
  it('rejects malformed input', () => {
    expect(isValidArgon2Hash('not-a-hash')).toBe(false);
    expect(isValidArgon2Hash('')).toBe(false);
    expect(isValidArgon2Hash('$argon2id$v=19$m=8,t=1,p=1$onlysalt')).toBe(false);
  });
});
