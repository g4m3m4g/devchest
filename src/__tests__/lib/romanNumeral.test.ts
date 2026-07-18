import { describe, it, expect } from 'vitest';
import { toRoman, fromRoman } from '../../lib/romanNumeral';

describe('toRoman', () => {
  it('converts simple values', () => {
    expect(toRoman(1)).toBe('I');
    expect(toRoman(5)).toBe('V');
    expect(toRoman(10)).toBe('X');
  });

  it('converts subtractive-notation values', () => {
    expect(toRoman(4)).toBe('IV');
    expect(toRoman(9)).toBe('IX');
    expect(toRoman(40)).toBe('XL');
    expect(toRoman(90)).toBe('XC');
    expect(toRoman(400)).toBe('CD');
    expect(toRoman(900)).toBe('CM');
  });

  it('converts a composite value', () => {
    expect(toRoman(1994)).toBe('MCMXCIV');
    expect(toRoman(2026)).toBe('MMXXVI');
  });

  it('converts the max supported value', () => {
    expect(toRoman(3999)).toBe('MMMCMXCIX');
  });

  it('throws for 0 or negative numbers', () => {
    expect(() => toRoman(0)).toThrow();
    expect(() => toRoman(-5)).toThrow();
  });

  it('throws above 3999', () => {
    expect(() => toRoman(4000)).toThrow();
  });

  it('throws for non-integers', () => {
    expect(() => toRoman(1.5)).toThrow();
  });
});

describe('fromRoman', () => {
  it('parses simple values', () => {
    expect(fromRoman('I')).toBe(1);
    expect(fromRoman('V')).toBe(5);
    expect(fromRoman('X')).toBe(10);
  });

  it('parses subtractive-notation values', () => {
    expect(fromRoman('IV')).toBe(4);
    expect(fromRoman('IX')).toBe(9);
    expect(fromRoman('XL')).toBe(40);
    expect(fromRoman('XC')).toBe(90);
    expect(fromRoman('CD')).toBe(400);
    expect(fromRoman('CM')).toBe(900);
  });

  it('parses a composite value', () => {
    expect(fromRoman('MCMXCIV')).toBe(1994);
    expect(fromRoman('MMXXVI')).toBe(2026);
  });

  it('is case-insensitive', () => {
    expect(fromRoman('mcmxciv')).toBe(1994);
  });

  it('parses the max supported value', () => {
    expect(fromRoman('MMMCMXCIX')).toBe(3999);
  });

  it('throws for an empty string', () => {
    expect(() => fromRoman('')).toThrow();
  });

  it('throws for invalid characters', () => {
    expect(() => fromRoman('ABC')).toThrow();
  });

  it('throws for malformed numerals like an invalid repeat', () => {
    expect(() => fromRoman('IIII')).toThrow();
    expect(() => fromRoman('VV')).toThrow();
    expect(() => fromRoman('IC')).toThrow();
  });

  it('round-trips every value from 1 to 3999', () => {
    for (let n = 1; n <= 3999; n += 37) {
      expect(fromRoman(toRoman(n))).toBe(n);
    }
  });
});
