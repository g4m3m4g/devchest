import { describe, it, expect } from 'vitest';
import {
  buildCharset,
  generatePassword,
  calculateEntropyBits,
  classifyStrength,
  CHARSETS,
} from '../../lib/password';
import type { PasswordOptions } from '../../lib/password';

const baseOptions: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

describe('buildCharset', () => {
  it('includes only the requested charsets', () => {
    expect(buildCharset({ ...baseOptions, uppercase: true, lowercase: false, digits: false, symbols: false }))
      .toBe(CHARSETS.uppercase);
  });

  it('combines multiple charsets', () => {
    const result = buildCharset({ ...baseOptions, uppercase: true, lowercase: true, digits: false, symbols: false });
    expect(result).toBe(CHARSETS.uppercase + CHARSETS.lowercase);
  });

  it('returns empty string when no charset flags are enabled', () => {
    expect(buildCharset({ ...baseOptions, uppercase: false, lowercase: false, digits: false, symbols: false })).toBe('');
  });

  it('strips ambiguous characters when excludeAmbiguous is true', () => {
    const result = buildCharset({ ...baseOptions, uppercase: true, lowercase: true, digits: true, symbols: false, excludeAmbiguous: true });
    expect(result).not.toMatch(/[il1Lo0O]/);
  });

  it('does not strip ambiguous characters when excludeAmbiguous is false', () => {
    const result = buildCharset({ ...baseOptions, uppercase: true, lowercase: true, digits: true, symbols: false, excludeAmbiguous: false });
    expect(result).toMatch(/[il1Lo0O]/);
  });
});

describe('generatePassword', () => {
  it('produces a password of the requested length', () => {
    expect(generatePassword(baseOptions)).toHaveLength(16);
  });

  it('only contains characters from the requested charset', () => {
    const options: PasswordOptions = { length: 64, uppercase: true, lowercase: false, digits: true, symbols: false, excludeAmbiguous: false };
    const charset = buildCharset(options);
    const password = generatePassword(options);
    for (const char of password) {
      expect(charset).toContain(char);
    }
  });

  it('throws when no charset flags are enabled', () => {
    expect(() => generatePassword({ ...baseOptions, uppercase: false, lowercase: false, digits: false, symbols: false }))
      .toThrow();
  });

  it('produces different output across calls', () => {
    const a = generatePassword(baseOptions);
    const b = generatePassword(baseOptions);
    expect(a).not.toBe(b);
  });

  it('respects excludeAmbiguous', () => {
    const options: PasswordOptions = { length: 128, uppercase: true, lowercase: true, digits: true, symbols: false, excludeAmbiguous: true };
    const password = generatePassword(options);
    expect(password).not.toMatch(/[il1Lo0O]/);
  });
});

describe('calculateEntropyBits', () => {
  it('computes length * log2(charsetSize)', () => {
    expect(calculateEntropyBits(8, 26)).toBeCloseTo(8 * Math.log2(26));
  });

  it('returns 0 for an empty charset', () => {
    expect(calculateEntropyBits(8, 0)).toBe(0);
  });

  it('returns 0 for zero length', () => {
    expect(calculateEntropyBits(0, 26)).toBe(0);
  });
});

describe('classifyStrength', () => {
  it('classifies low entropy as weak', () => {
    expect(classifyStrength(20)).toBe('weak');
  });

  it('classifies mid-low entropy as fair', () => {
    expect(classifyStrength(45)).toBe('fair');
  });

  it('classifies mid-high entropy as strong', () => {
    expect(classifyStrength(65)).toBe('strong');
  });

  it('classifies high entropy as very-strong', () => {
    expect(classifyStrength(90)).toBe('very-strong');
  });
});
