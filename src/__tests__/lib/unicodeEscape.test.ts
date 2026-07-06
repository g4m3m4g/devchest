import { describe, it, expect } from 'vitest';
import { encodeUnicode, decodeUnicode } from '../../lib/unicodeEscape';

describe('encodeUnicode', () => {
  it('handles empty string', () => {
    expect(encodeUnicode('')).toBe('');
  });

  it('leaves ASCII unchanged in nonAscii scope', () => {
    expect(encodeUnicode('hello world 123', 'js', 'nonAscii')).toBe('hello world 123');
  });

  describe('js style', () => {
    it('encodes BMP characters as \\uXXXX', () => {
      expect(encodeUnicode('café', 'js', 'nonAscii')).toBe('caf\\u00e9');
    });

    it('encodes astral characters as \\u{XXXXX}', () => {
      expect(encodeUnicode('😀', 'js', 'nonAscii')).toBe('\\u{1f600}');
    });

    it('encodes every character in "all" scope', () => {
      expect(encodeUnicode('AB', 'js', 'all')).toBe('\\u0041\\u0042');
    });
  });

  describe('css style', () => {
    it('encodes BMP characters as \\XXXX with a trailing space', () => {
      expect(encodeUnicode('café', 'css', 'nonAscii')).toBe('caf\\e9 ');
    });

    it('encodes astral characters using the full code point', () => {
      expect(encodeUnicode('😀', 'css', 'nonAscii')).toBe('\\1f600 ');
    });
  });

  describe('python style', () => {
    it('encodes BMP characters as \\uXXXX', () => {
      expect(encodeUnicode('café', 'python', 'nonAscii')).toBe('caf\\u00e9');
    });

    it('encodes astral characters as \\UXXXXXXXX', () => {
      expect(encodeUnicode('😀', 'python', 'nonAscii')).toBe('\\U0001f600');
    });
  });

  describe('codepoint style', () => {
    it('encodes characters as U+XXXX', () => {
      expect(encodeUnicode('café', 'codepoint', 'nonAscii')).toBe('cafU+00E9');
    });

    it('encodes astral characters as U+XXXXX', () => {
      expect(encodeUnicode('😀', 'codepoint', 'nonAscii')).toBe('U+1F600');
    });
  });
});

describe('decodeUnicode', () => {
  it('handles empty string', () => {
    expect(decodeUnicode('')).toBe('');
  });

  it('leaves plain text unchanged', () => {
    expect(decodeUnicode('hello world 123')).toBe('hello world 123');
  });

  it('decodes \\uXXXX escapes', () => {
    expect(decodeUnicode('caf\\u00e9')).toBe('café');
  });

  it('decodes \\u{XXXXX} escapes', () => {
    expect(decodeUnicode('\\u{1f600}')).toBe('😀');
  });

  it('decodes \\UXXXXXXXX escapes', () => {
    expect(decodeUnicode('\\U0001f600')).toBe('😀');
  });

  it('decodes CSS-style \\XXXX escapes with trailing space', () => {
    expect(decodeUnicode('caf\\e9 ')).toBe('café');
  });

  it('decodes CSS-style escapes without a trailing space at end of string', () => {
    expect(decodeUnicode('caf\\e9')).toBe('café');
  });

  it('decodes U+XXXX notation', () => {
    expect(decodeUnicode('U+00E9')).toBe('é');
  });

  it('decodes U+XXXXX astral notation', () => {
    expect(decodeUnicode('U+1F600')).toBe('😀');
  });

  it('decodes a mix of escape styles in the same string', () => {
    expect(decodeUnicode('caf\\u00e9 and U+1F600 and \\U0001f600')).toBe('café and 😀 and 😀');
  });

  it('leaves invalid escapes unchanged', () => {
    expect(decodeUnicode('\\u{110000}')).toBe('\\u{110000}');
  });

  it('round-trips through all styles', () => {
    const original = 'Hello, 世界 😀!';
    expect(decodeUnicode(encodeUnicode(original, 'js', 'all'))).toBe(original);
    expect(decodeUnicode(encodeUnicode(original, 'css', 'all'))).toBe(original);
    expect(decodeUnicode(encodeUnicode(original, 'python', 'all'))).toBe(original);
    expect(decodeUnicode(encodeUnicode(original, 'codepoint', 'all'))).toBe(original);
  });
});
