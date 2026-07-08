import { describe, it, expect } from 'vitest';
import {
  splitLines,
  extractNumber,
  dedupeLines,
  sortTextLines,
} from '../../lib/textSorter';

describe('splitLines', () => {
  it('splits on newlines', () => {
    expect(splitLines('a\nb\nc')).toEqual(['a', 'b', 'c']);
  });

  it('handles CRLF line endings', () => {
    expect(splitLines('a\r\nb\r\nc')).toEqual(['a', 'b', 'c']);
  });

  it('returns an empty array for an empty string', () => {
    expect(splitLines('')).toEqual([]);
  });
});

describe('extractNumber', () => {
  it('extracts an integer', () => {
    expect(extractNumber('item42')).toBe(42);
  });

  it('extracts a negative number', () => {
    expect(extractNumber('temp: -5 degrees')).toBe(-5);
  });

  it('extracts a decimal', () => {
    expect(extractNumber('price 19.99 usd')).toBe(19.99);
  });

  it('returns null when no number is present', () => {
    expect(extractNumber('no numbers here')).toBeNull();
  });
});

describe('dedupeLines', () => {
  it('removes exact duplicates, keeping first occurrence', () => {
    expect(dedupeLines(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });

  it('is case-sensitive by default', () => {
    expect(dedupeLines(['Apple', 'apple'])).toEqual(['Apple', 'apple']);
  });

  it('dedupes case-insensitively when requested', () => {
    expect(dedupeLines(['Apple', 'apple', 'APPLE'], false)).toEqual(['Apple']);
  });
});

describe('sortTextLines', () => {
  it('sorts alphabetically ascending, case-insensitive by default', () => {
    expect(sortTextLines('banana\nApple\ncherry', { mode: 'alphabetical' }))
      .toEqual(['Apple', 'banana', 'cherry']);
  });

  it('sorts alphabetically descending', () => {
    expect(sortTextLines('banana\nApple\ncherry', { mode: 'alphabetical', direction: 'desc' }))
      .toEqual(['cherry', 'banana', 'Apple']);
  });

  it('sorts alphabetically case-sensitively when requested', () => {
    expect(sortTextLines('apple\nBanana', { mode: 'alphabetical', caseSensitive: true }))
      .toEqual(['Banana', 'apple']);
  });

  it('sorts numerically by the first number found in each line', () => {
    expect(sortTextLines('item10\nitem2\nitem1', { mode: 'numeric' }))
      .toEqual(['item1', 'item2', 'item10']);
  });

  it('sorts numerically descending', () => {
    expect(sortTextLines('item10\nitem2\nitem1', { mode: 'numeric', direction: 'desc' }))
      .toEqual(['item10', 'item2', 'item1']);
  });

  it('places lines without numbers at the end regardless of direction', () => {
    expect(sortTextLines('b\n3\na\n1', { mode: 'numeric' })).toEqual(['1', '3', 'b', 'a']);
    expect(sortTextLines('b\n3\na\n1', { mode: 'numeric', direction: 'desc' })).toEqual(['3', '1', 'b', 'a']);
  });

  it('sorts by length ascending', () => {
    expect(sortTextLines('ccc\na\nbb', { mode: 'length' })).toEqual(['a', 'bb', 'ccc']);
  });

  it('sorts by length descending', () => {
    expect(sortTextLines('ccc\na\nbb', { mode: 'length', direction: 'desc' })).toEqual(['ccc', 'bb', 'a']);
  });

  it('trims lines before sorting when requested', () => {
    expect(sortTextLines('  b  \n a ', { mode: 'alphabetical', trimLines: true })).toEqual(['a', 'b']);
  });

  it('removes empty lines when requested', () => {
    expect(sortTextLines('b\n\n\na', { mode: 'alphabetical', removeEmpty: true })).toEqual(['a', 'b']);
  });

  it('dedupes lines when requested', () => {
    expect(sortTextLines('b\na\nb', { mode: 'alphabetical', dedupe: true })).toEqual(['a', 'b']);
  });

  it('returns an empty array for empty input', () => {
    expect(sortTextLines('', { mode: 'alphabetical' })).toEqual([]);
  });
});
