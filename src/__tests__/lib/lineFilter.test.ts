import { describe, it, expect } from 'vitest';
import { filterLines } from '../../lib/lineFilter';
import type { LineFilterOptions } from '../../lib/lineFilter';

const base: LineFilterOptions = {
  pattern: '',
  mode: 'keep',
  useRegex: false,
  caseSensitive: true,
};

describe('filterLines — plain text', () => {
  it('keeps lines containing the pattern', () => {
    const result = filterLines('apple\nbanana\ncherry', { ...base, pattern: 'an' });
    expect(result).toEqual({ lines: ['banana'], error: null });
  });

  it('removes lines containing the pattern', () => {
    const result = filterLines('apple\nbanana\ncherry', { ...base, pattern: 'an', mode: 'remove' });
    expect(result).toEqual({ lines: ['apple', 'cherry'], error: null });
  });

  it('is case-sensitive by default', () => {
    const result = filterLines('Apple\napple', { ...base, pattern: 'Apple' });
    expect(result).toEqual({ lines: ['Apple'], error: null });
  });

  it('is case-insensitive when requested', () => {
    const result = filterLines('Apple\napple', { ...base, pattern: 'apple', caseSensitive: false });
    expect(result).toEqual({ lines: ['Apple', 'apple'], error: null });
  });

  it('returns all lines unchanged for keep mode when pattern is empty', () => {
    const result = filterLines('a\nb\nc', { ...base, pattern: '' });
    expect(result).toEqual({ lines: ['a', 'b', 'c'], error: null });
  });

  it('returns all lines unchanged for remove mode when pattern is empty', () => {
    const result = filterLines('a\nb\nc', { ...base, pattern: '', mode: 'remove' });
    expect(result).toEqual({ lines: ['a', 'b', 'c'], error: null });
  });

  it('treats regex special characters as literal text in plain mode', () => {
    const result = filterLines('a.b\naxb', { ...base, pattern: 'a.b' });
    expect(result).toEqual({ lines: ['a.b'], error: null });
  });

  it('returns an empty array for empty input', () => {
    const result = filterLines('', { ...base, pattern: 'a' });
    expect(result).toEqual({ lines: [], error: null });
  });
});

describe('filterLines — regex mode', () => {
  it('keeps lines matching a regex pattern', () => {
    const result = filterLines('foo123\nbar\nbaz456', {
      ...base, pattern: '\\d+', useRegex: true,
    });
    expect(result).toEqual({ lines: ['foo123', 'baz456'], error: null });
  });

  it('removes lines matching a regex pattern', () => {
    const result = filterLines('foo123\nbar\nbaz456', {
      ...base, pattern: '\\d+', useRegex: true, mode: 'remove',
    });
    expect(result).toEqual({ lines: ['bar'], error: null });
  });

  it('is case-insensitive in regex mode when requested', () => {
    const result = filterLines('FOO\nbar', {
      ...base, pattern: 'foo', useRegex: true, caseSensitive: false,
    });
    expect(result).toEqual({ lines: ['FOO'], error: null });
  });

  it('returns an error for an invalid regex pattern', () => {
    const result = filterLines('abc', { ...base, pattern: '(', useRegex: true });
    expect(result.lines).toEqual([]);
    expect(result.error).not.toBeNull();
  });
});
