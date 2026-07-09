import { describe, it, expect } from 'vitest';
import { findAndReplace } from '../../lib/findReplace';
import type { FindReplaceOptions } from '../../lib/findReplace';

const base: FindReplaceOptions = {
  find: '',
  replace: '',
  useRegex: false,
  caseSensitive: true,
  global: true,
};

describe('findAndReplace — plain text', () => {
  it('replaces all occurrences by default (global)', () => {
    const result = findAndReplace('foo bar foo', { ...base, find: 'foo', replace: 'baz' });
    expect(result).toEqual({ output: 'baz bar baz', matchCount: 2, error: null });
  });

  it('replaces only the first occurrence when global is false', () => {
    const result = findAndReplace('foo bar foo', { ...base, find: 'foo', replace: 'baz', global: false });
    expect(result).toEqual({ output: 'baz bar foo', matchCount: 1, error: null });
  });

  it('is case-sensitive by default', () => {
    const result = findAndReplace('Foo foo', { ...base, find: 'foo', replace: 'baz' });
    expect(result).toEqual({ output: 'Foo baz', matchCount: 1, error: null });
  });

  it('is case-insensitive when requested', () => {
    const result = findAndReplace('Foo foo', { ...base, find: 'foo', replace: 'baz', caseSensitive: false });
    expect(result).toEqual({ output: 'baz baz', matchCount: 2, error: null });
  });

  it('returns the original text unchanged when find is empty', () => {
    const result = findAndReplace('hello', { ...base, find: '', replace: 'x' });
    expect(result).toEqual({ output: 'hello', matchCount: 0, error: null });
  });

  it('treats regex special characters as literal text in plain mode', () => {
    const result = findAndReplace('a.b.c', { ...base, find: '.', replace: '-' });
    expect(result).toEqual({ output: 'a-b-c', matchCount: 2, error: null });
  });
});

describe('findAndReplace — regex mode', () => {
  it('replaces using a regex pattern', () => {
    const result = findAndReplace('foo123bar456', {
      ...base, find: '\\d+', replace: '#', useRegex: true,
    });
    expect(result).toEqual({ output: 'foo#bar#', matchCount: 2, error: null });
  });

  it('substitutes capture groups with $1 syntax', () => {
    const result = findAndReplace('John Smith', {
      ...base, find: '(\\w+) (\\w+)', replace: '$2 $1', useRegex: true,
    });
    expect(result).toEqual({ output: 'Smith John', matchCount: 1, error: null });
  });

  it('replaces only the first match when global is false', () => {
    const result = findAndReplace('a1 b2 c3', {
      ...base, find: '\\d', replace: 'X', useRegex: true, global: false,
    });
    expect(result).toEqual({ output: 'a1 b2 c3'.replace(/\d/, 'X'), matchCount: 1, error: null });
  });

  it('is case-insensitive in regex mode when requested', () => {
    const result = findAndReplace('Foo foo', {
      ...base, find: 'foo', replace: 'x', useRegex: true, caseSensitive: false,
    });
    expect(result).toEqual({ output: 'x x', matchCount: 2, error: null });
  });

  it('returns an error for an invalid regex pattern', () => {
    const result = findAndReplace('abc', { ...base, find: '(', replace: 'x', useRegex: true });
    expect(result.output).toBe('abc');
    expect(result.matchCount).toBe(0);
    expect(result.error).not.toBeNull();
  });

  it('returns the original text unchanged when find is empty in regex mode', () => {
    const result = findAndReplace('hello', { ...base, find: '', replace: 'x', useRegex: true });
    expect(result).toEqual({ output: 'hello', matchCount: 0, error: null });
  });
});
