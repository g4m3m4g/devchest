import { describe, it, expect } from 'vitest';
import { generateNanoId, calculateNanoIdEntropyBits, DEFAULT_ALPHABET, DEFAULT_SIZE } from '../../lib/nanoid';

describe('generateNanoId', () => {
  it('produces an ID of the default size (21)', () => {
    expect(generateNanoId()).toHaveLength(DEFAULT_SIZE);
  });

  it('produces an ID of a custom size', () => {
    expect(generateNanoId(10)).toHaveLength(10);
  });

  it('only contains characters from the default alphabet', () => {
    const id = generateNanoId(200);
    for (const char of id) {
      expect(DEFAULT_ALPHABET).toContain(char);
    }
  });

  it('respects a custom alphabet', () => {
    const id = generateNanoId(50, '01');
    expect(id).toMatch(/^[01]{50}$/);
  });

  it('produces different IDs across calls', () => {
    const a = generateNanoId();
    const b = generateNanoId();
    expect(a).not.toBe(b);
  });

  it('throws for a size below 1', () => {
    expect(() => generateNanoId(0)).toThrow();
  });

  it('throws for an alphabet with fewer than 2 characters', () => {
    expect(() => generateNanoId(10, 'a')).toThrow();
  });
});

describe('calculateNanoIdEntropyBits', () => {
  it('computes size * log2(alphabetLength)', () => {
    expect(calculateNanoIdEntropyBits(21, 64)).toBeCloseTo(21 * Math.log2(64));
  });

  it('returns 0 for zero size', () => {
    expect(calculateNanoIdEntropyBits(0, 64)).toBe(0);
  });
});
