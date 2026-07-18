import { describe, it, expect } from 'vitest';
import { analyzeFloat } from '../../lib/ieee754';

describe('analyzeFloat — single precision', () => {
  it('decodes 1 as sign 0, biased exponent 127, zero mantissa', () => {
    const b = analyzeFloat(1, 'single');
    expect(b.sign).toBe('0');
    expect(b.exponentBits).toBe('01111111');
    expect(b.mantissaBits).toBe('00000000000000000000000');
    expect(b.biasedExponent).toBe(127);
    expect(b.unbiasedExponent).toBe(0);
    expect(b.hex).toBe('3f800000');
    expect(b.reconstructedValue).toBe(1);
  });

  it('sets the sign bit for negative numbers', () => {
    const b = analyzeFloat(-1, 'single');
    expect(b.sign).toBe('1');
    expect(b.hex).toBe('bf800000');
  });

  it('rounds values that are not exactly representable', () => {
    const b = analyzeFloat(0.1, 'single');
    expect(b.reconstructedValue).not.toBe(0.1);
    expect(b.reconstructedValue).toBeCloseTo(0.1, 6);
  });

  it('gives Infinity an all-ones exponent and zero mantissa', () => {
    const b = analyzeFloat(Infinity, 'single');
    expect(b.exponentBits).toBe('11111111');
    expect(b.mantissaBits).toBe('00000000000000000000000');
    expect(b.reconstructedValue).toBe(Infinity);
  });

  it('gives NaN an all-ones exponent and a non-zero mantissa', () => {
    const b = analyzeFloat(NaN, 'single');
    expect(b.exponentBits).toBe('11111111');
    expect(b.mantissaBits).not.toBe('00000000000000000000000');
    expect(Number.isNaN(b.reconstructedValue)).toBe(true);
  });

  it('distinguishes -0 from 0 via the sign bit', () => {
    const zero = analyzeFloat(0, 'single');
    const negZero = analyzeFloat(-0, 'single');
    expect(zero.sign).toBe('0');
    expect(negZero.sign).toBe('1');
    expect(zero.hex).toBe('00000000');
    expect(negZero.hex).toBe('80000000');
  });
});

describe('analyzeFloat — double precision', () => {
  it('decodes 1 as sign 0, biased exponent 1023, zero mantissa', () => {
    const b = analyzeFloat(1, 'double');
    expect(b.sign).toBe('0');
    expect(b.exponentBits).toBe('01111111111');
    expect(b.mantissaBits).toBe('0'.repeat(52));
    expect(b.biasedExponent).toBe(1023);
    expect(b.unbiasedExponent).toBe(0);
    expect(b.hex).toBe('3ff0000000000000');
    expect(b.reconstructedValue).toBe(1);
  });

  it('preserves 0.1 exactly (round-trips through double)', () => {
    const b = analyzeFloat(0.1, 'double');
    expect(b.reconstructedValue).toBe(0.1);
  });

  it('sets the sign bit for negative numbers', () => {
    const b = analyzeFloat(-2, 'double');
    expect(b.sign).toBe('1');
  });
});
