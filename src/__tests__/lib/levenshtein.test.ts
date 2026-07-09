import { describe, it, expect } from 'vitest';
import { levenshteinDistance, similarityPercent } from '../../lib/levenshtein';

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('kitten', 'kitten')).toBe(0);
  });

  it('returns the length of the other string when one is empty', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3);
    expect(levenshteinDistance('abc', '')).toBe(3);
  });

  it('returns 0 for two empty strings', () => {
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('computes the classic kitten/sitting example', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
  });

  it('computes distance for a single substitution', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1);
  });

  it('computes distance for a single insertion', () => {
    expect(levenshteinDistance('cat', 'cats')).toBe(1);
  });

  it('computes distance for a single deletion', () => {
    expect(levenshteinDistance('cats', 'cat')).toBe(1);
  });

  it('is symmetric', () => {
    expect(levenshteinDistance('flaw', 'lawn')).toBe(levenshteinDistance('lawn', 'flaw'));
  });
});

describe('similarityPercent', () => {
  it('returns 100 for identical strings', () => {
    expect(similarityPercent('abc', 'abc')).toBe(100);
  });

  it('returns 100 for two empty strings', () => {
    expect(similarityPercent('', '')).toBe(100);
  });

  it('returns 0 when strings share no characters and differ in every position', () => {
    expect(similarityPercent('abc', 'xyz')).toBe(0);
  });

  it('returns a value between 0 and 100 for partially similar strings', () => {
    const result = similarityPercent('kitten', 'sitting');
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100);
  });
});
