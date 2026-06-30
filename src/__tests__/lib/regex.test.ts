import { describe, it, expect } from 'vitest';
import { getRegexSegments } from '../../lib/regex';

const DEFAULT_FLAGS = { g: true, i: false, m: false };

describe('getRegexSegments', () => {
  it('returns whole string as non-match when pattern is empty', () => {
    const { segments, matchCount, error } = getRegexSegments('', DEFAULT_FLAGS, 'hello world');
    expect(segments).toHaveLength(1);
    expect(segments[0].isMatch).toBe(false);
    expect(segments[0].text).toBe('hello world');
    expect(matchCount).toBe(0);
    expect(error).toBeNull();
  });

  it('returns whole string as non-match when testString is empty', () => {
    const { segments, matchCount } = getRegexSegments('hello', DEFAULT_FLAGS, '');
    expect(matchCount).toBe(0);
    expect(segments[0].isMatch).toBe(false);
  });

  it('finds a single match', () => {
    const { segments, matchCount, error } = getRegexSegments('world', DEFAULT_FLAGS, 'hello world');
    expect(error).toBeNull();
    expect(matchCount).toBe(1);
    const match = segments.find(s => s.isMatch);
    expect(match?.text).toBe('world');
  });

  it('finds multiple matches with global flag', () => {
    const { matchCount } = getRegexSegments('a', DEFAULT_FLAGS, 'banana');
    expect(matchCount).toBe(3);
  });

  it('segments non-match text correctly', () => {
    const { segments } = getRegexSegments('world', DEFAULT_FLAGS, 'hello world');
    const nonMatch = segments.find(s => !s.isMatch);
    expect(nonMatch?.text).toBe('hello ');
  });

  it('case insensitive flag works', () => {
    const { matchCount } = getRegexSegments('HELLO', { g: true, i: true, m: false }, 'hello world');
    expect(matchCount).toBe(1);
  });

  it('case sensitive (no i flag) does not match different case', () => {
    const { matchCount } = getRegexSegments('HELLO', DEFAULT_FLAGS, 'hello world');
    expect(matchCount).toBe(0);
  });

  it('returns error for invalid regex', () => {
    const { error, matchCount } = getRegexSegments('[invalid', DEFAULT_FLAGS, 'test');
    expect(error).toBeTruthy();
    expect(matchCount).toBe(0);
  });

  it('multiline flag enables ^ and $ to match line starts/ends', () => {
    const input = 'line1\nline2\nline3';
    const { matchCount } = getRegexSegments('^line', { g: true, i: false, m: true }, input);
    expect(matchCount).toBe(3);
  });

  it('matches digit pattern', () => {
    const { matchCount } = getRegexSegments('\\d+', DEFAULT_FLAGS, 'abc 123 def 456');
    expect(matchCount).toBe(2);
  });

  it('returns correct segment indices', () => {
    const { segments } = getRegexSegments('b', DEFAULT_FLAGS, 'abc');
    const matchSeg = segments.find(s => s.isMatch);
    expect(matchSeg?.index).toBe(1);
  });
});
