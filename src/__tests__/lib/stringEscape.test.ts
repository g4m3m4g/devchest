import { describe, it, expect } from 'vitest';
import { escapeString, unescapeString } from '../../lib/stringEscape';
import type { StringEscapeFormat } from '../../lib/stringEscape';

describe('escapeString', () => {
  it('escapes JS control characters and quotes', () => {
    expect(escapeString('line1\nline2\t"quoted"\\', 'js')).toBe(
      'line1\\nline2\\t\\"quoted\\"\\\\'
    );
  });

  it('escapes JS carriage returns', () => {
    expect(escapeString('a\rb', 'js')).toBe('a\\rb');
  });

  it('escapes Python control characters and quotes', () => {
    expect(escapeString("line1\nline2\t'quoted'\\", 'python')).toBe(
      "line1\\nline2\\t\\'quoted\\'\\\\"
    );
  });

  it('escapes SQL single quotes by doubling them', () => {
    expect(escapeString("O'Brien", 'sql')).toBe("O''Brien");
  });

  it('escapes SQL backslashes untouched (SQL has no backslash escaping)', () => {
    expect(escapeString('a\\b', 'sql')).toBe('a\\b');
  });

  it('returns an empty string for empty input', () => {
    expect(escapeString('', 'js')).toBe('');
  });
});

describe('unescapeString', () => {
  it('unescapes JS escape sequences', () => {
    expect(unescapeString('line1\\nline2\\t\\"quoted\\"\\\\', 'js')).toBe(
      'line1\nline2\t"quoted"\\'
    );
  });

  it('unescapes JS carriage returns', () => {
    expect(unescapeString('a\\rb', 'js')).toBe('a\rb');
  });

  it('unescapes Python escape sequences', () => {
    expect(unescapeString("line1\\nline2\\t\\'quoted\\'\\\\", 'python')).toBe(
      "line1\nline2\t'quoted'\\"
    );
  });

  it('unescapes SQL doubled single quotes', () => {
    expect(unescapeString("O''Brien", 'sql')).toBe("O'Brien");
  });

  it('returns an empty string for empty input', () => {
    expect(unescapeString('', 'js')).toBe('');
  });

  it('round-trips through escape then unescape for js', () => {
    const original = 'Tab\tNewline\nQuote"Backslash\\';
    expect(unescapeString(escapeString(original, 'js'), 'js')).toBe(original);
  });

  it('round-trips through escape then unescape for python', () => {
    const original = "Tab\tNewline\nQuote'Backslash\\";
    expect(unescapeString(escapeString(original, 'python'), 'python')).toBe(original);
  });

  it('round-trips through escape then unescape for sql', () => {
    const original = "It's a test";
    expect(unescapeString(escapeString(original, 'sql'), 'sql')).toBe(original);
  });
});

describe('StringEscapeFormat', () => {
  it('supports js, python, and sql formats', () => {
    const formats: StringEscapeFormat[] = ['js', 'python', 'sql'];
    expect(formats).toHaveLength(3);
  });
});
