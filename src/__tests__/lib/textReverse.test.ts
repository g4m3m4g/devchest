import { describe, it, expect } from 'vitest';
import {
  reverseCharacters,
  reverseWords,
  reverseLines,
  reverseText,
} from '../../lib/textReverse';

describe('reverseCharacters', () => {
  it('reverses a simple string', () => {
    expect(reverseCharacters('hello')).toBe('olleh');
  });

  it('returns an empty string unchanged', () => {
    expect(reverseCharacters('')).toBe('');
  });

  it('preserves multi-byte characters (emoji) intact', () => {
    expect(reverseCharacters('😀ab')).toBe('ba😀');
  });

  it('reverses across newlines', () => {
    expect(reverseCharacters('ab\ncd')).toBe('dc\nba');
  });
});

describe('reverseWords', () => {
  it('reverses word order', () => {
    expect(reverseWords('the quick brown fox')).toBe('fox brown quick the');
  });

  it('collapses repeated whitespace between words', () => {
    expect(reverseWords('a   b')).toBe('b a');
  });

  it('trims leading and trailing whitespace', () => {
    expect(reverseWords('  a b  ')).toBe('b a');
  });

  it('returns an empty string for empty input', () => {
    expect(reverseWords('')).toBe('');
  });

  it('returns an empty string for whitespace-only input', () => {
    expect(reverseWords('   ')).toBe('');
  });
});

describe('reverseLines', () => {
  it('reverses line order', () => {
    expect(reverseLines('a\nb\nc')).toBe('c\nb\na');
  });

  it('returns an empty string unchanged', () => {
    expect(reverseLines('')).toBe('');
  });

  it('handles a single line', () => {
    expect(reverseLines('hello')).toBe('hello');
  });
});

describe('reverseText', () => {
  it('dispatches to reverseCharacters for "characters" mode', () => {
    expect(reverseText('hello', 'characters')).toBe('olleh');
  });

  it('dispatches to reverseWords for "words" mode', () => {
    expect(reverseText('the quick fox', 'words')).toBe('fox quick the');
  });

  it('dispatches to reverseLines for "lines" mode', () => {
    expect(reverseText('a\nb', 'lines')).toBe('b\na');
  });
});
