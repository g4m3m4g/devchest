import { describe, it, expect } from 'vitest';
import { calculateStatistics } from '../../lib/statisticsCalculator';

describe('calculateStatistics', () => {
  it('computes mean, median, mode, and std dev for an odd-length dataset', () => {
    const result = calculateStatistics([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(result.mean).toBeCloseTo(5);
    expect(result.median).toBeCloseTo(4.5);
    expect(result.mode).toEqual([4]);
    expect(result.stdDev).toBeCloseTo(2, 4);
    expect(result.variance).toBeCloseTo(4, 4);
    expect(result.min).toBe(2);
    expect(result.max).toBe(9);
    expect(result.range).toBe(7);
    expect(result.count).toBe(8);
  });

  it('computes the median for an even-length dataset as the average of the two middle values', () => {
    const result = calculateStatistics([1, 2, 3, 4]);
    expect(result.median).toBe(2.5);
  });

  it('computes the median for an odd-length dataset as the middle value', () => {
    const result = calculateStatistics([1, 2, 3]);
    expect(result.median).toBe(2);
  });

  it('handles a single value', () => {
    const result = calculateStatistics([5]);
    expect(result.mean).toBe(5);
    expect(result.median).toBe(5);
    expect(result.mode).toEqual([5]);
    expect(result.stdDev).toBe(0);
    expect(result.min).toBe(5);
    expect(result.max).toBe(5);
    expect(result.range).toBe(0);
    expect(result.count).toBe(1);
  });

  it('returns all values tied for mode when multimodal', () => {
    const result = calculateStatistics([1, 1, 2, 2, 3]);
    expect(result.mode).toEqual([1, 2]);
  });

  it('returns every value as a mode when none repeat', () => {
    const result = calculateStatistics([1, 2, 3]);
    expect(result.mode).toEqual([1, 2, 3]);
  });

  it('throws for an empty array', () => {
    expect(() => calculateStatistics([])).toThrow();
  });
});
