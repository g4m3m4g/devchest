import { describe, it, expect } from 'vitest';
import { slugify } from '../../lib/slugGenerator';

describe('slugify', () => {
  it('lowercases and hyphenates a simple title', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('returns an empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });

  it('collapses repeated whitespace into a single separator', () => {
    expect(slugify('  Hello   World  ')).toBe('hello-world');
  });

  it('strips accents and diacritics', () => {
    expect(slugify('Café à la carte')).toBe('cafe-a-la-carte');
  });

  it('collapses runs of non-alphanumeric characters into one separator', () => {
    expect(slugify('C++ Programming')).toBe('c-programming');
  });

  it('trims leading and trailing separators', () => {
    expect(slugify('___under_score___')).toBe('under-score');
  });

  it('uses a custom separator', () => {
    expect(slugify('Hello World', { separator: '_' })).toBe('hello_world');
  });

  it('preserves case when lowercase is disabled', () => {
    expect(slugify('Hello World', { lowercase: false })).toBe('Hello-World');
  });

  it('preserves existing numbers', () => {
    expect(slugify('Top 10 Tips in 2024')).toBe('top-10-tips-in-2024');
  });

  it('truncates to maxLength and trims a trailing separator', () => {
    expect(slugify('one two three', { maxLength: 4 })).toBe('one');
  });

  it('does not truncate when under maxLength', () => {
    expect(slugify('one two', { maxLength: 20 })).toBe('one-two');
  });
});
