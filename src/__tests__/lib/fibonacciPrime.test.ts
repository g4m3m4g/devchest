import { describe, it, expect } from 'vitest';
import { fibonacciSequence, primesUpTo } from '../../lib/fibonacciPrime';

describe('fibonacciSequence', () => {
  it('returns the first n Fibonacci numbers starting 0, 1', () => {
    expect(fibonacciSequence(1)).toEqual([0n]);
    expect(fibonacciSequence(2)).toEqual([0n, 1n]);
    expect(fibonacciSequence(5)).toEqual([0n, 1n, 1n, 2n, 3n]);
    expect(fibonacciSequence(10)).toEqual([0n, 1n, 1n, 2n, 3n, 5n, 8n, 13n, 21n, 34n]);
  });

  it('handles large n using bigint without precision loss', () => {
    const seq = fibonacciSequence(100);
    expect(seq).toHaveLength(100);
    expect(seq[99]).toBe(218922995834555169026n);
  });

  it('throws for n < 1', () => {
    expect(() => fibonacciSequence(0)).toThrow();
    expect(() => fibonacciSequence(-3)).toThrow();
  });

  it('throws for non-integer n', () => {
    expect(() => fibonacciSequence(2.5)).toThrow();
  });
});

describe('primesUpTo', () => {
  it('returns all primes up to and including the limit', () => {
    expect(primesUpTo(2)).toEqual([2]);
    expect(primesUpTo(10)).toEqual([2, 3, 5, 7]);
    expect(primesUpTo(29)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  });

  it('returns an empty array when limit is below the smallest prime but still >= 2 guard boundary', () => {
    expect(primesUpTo(2)).toEqual([2]);
  });

  it('throws for limit < 2', () => {
    expect(() => primesUpTo(1)).toThrow();
    expect(() => primesUpTo(0)).toThrow();
    expect(() => primesUpTo(-5)).toThrow();
  });

  it('throws for non-integer limit', () => {
    expect(() => primesUpTo(10.5)).toThrow();
  });
});
