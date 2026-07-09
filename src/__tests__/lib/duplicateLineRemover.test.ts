import { describe, it, expect } from 'vitest';
import { removeDuplicateLines } from '../../lib/duplicateLineRemover';
import type { DuplicateLineOptions } from '../../lib/duplicateLineRemover';

const base: DuplicateLineOptions = { caseSensitive: true, trimLines: false };

describe('removeDuplicateLines', () => {
  it('removes exact duplicate lines, keeping the first occurrence', () => {
    expect(removeDuplicateLines('a\nb\na\nc\nb', base)).toEqual(['a', 'b', 'c']);
  });

  it('is case-sensitive by default', () => {
    expect(removeDuplicateLines('Apple\napple', base)).toEqual(['Apple', 'apple']);
  });

  it('is case-insensitive when requested', () => {
    expect(removeDuplicateLines('Apple\napple', { ...base, caseSensitive: false })).toEqual(['Apple']);
  });

  it('does not trim lines by default', () => {
    expect(removeDuplicateLines('a\n a', base)).toEqual(['a', ' a']);
  });

  it('trims lines before comparing when requested', () => {
    expect(removeDuplicateLines('a\n a ', { ...base, trimLines: true })).toEqual(['a']);
  });

  it('preserves blank lines as their own dedup group', () => {
    expect(removeDuplicateLines('a\n\n\nb', base)).toEqual(['a', '', 'b']);
  });

  it('returns an empty array for empty input', () => {
    expect(removeDuplicateLines('', base)).toEqual([]);
  });
});
