import { describe, it, expect } from 'vitest';
import { percentOf, whatPercent, percentChange } from '../../lib/percentage';

describe('percentOf', () => {
  it('computes X% of Y', () => {
    expect(percentOf(25, 200)).toBe(50);
  });

  it('handles 0%', () => {
    expect(percentOf(0, 200)).toBe(0);
  });

  it('handles percentages over 100', () => {
    expect(percentOf(150, 10)).toBe(15);
  });

  it('handles negative values', () => {
    expect(percentOf(-10, 200)).toBe(-20);
  });
});

describe('whatPercent', () => {
  it('computes what % X is of Y', () => {
    expect(whatPercent(50, 200)).toBe(25);
  });

  it('returns 100 when X equals Y', () => {
    expect(whatPercent(10, 10)).toBe(100);
  });

  it('returns Infinity when Y is 0', () => {
    expect(whatPercent(5, 0)).toBe(Infinity);
  });
});

describe('percentChange', () => {
  it('computes a percentage increase', () => {
    expect(percentChange(100, 150)).toBe(50);
  });

  it('computes a percentage decrease as negative', () => {
    expect(percentChange(200, 150)).toBe(-25);
  });

  it('returns 0 for no change', () => {
    expect(percentChange(100, 100)).toBe(0);
  });

  it('returns Infinity when starting from 0', () => {
    expect(percentChange(0, 50)).toBe(Infinity);
  });
});
