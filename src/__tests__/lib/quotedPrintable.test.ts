import { describe, it, expect } from 'vitest';
import { encodeQuotedPrintable, decodeQuotedPrintable } from '../../lib/quotedPrintable';

describe('encodeQuotedPrintable', () => {
  it('handles empty string', () => {
    expect(encodeQuotedPrintable('')).toBe('');
  });

  it('leaves safe printable ASCII unchanged', () => {
    expect(encodeQuotedPrintable("Now's the time")).toBe("Now's the time");
  });

  it('escapes the literal equals sign as =3D', () => {
    expect(encodeQuotedPrintable('truth=beauty')).toBe('truth=3Dbeauty');
  });

  it('escapes non-ASCII bytes as their UTF-8 hex sequence', () => {
    expect(encodeQuotedPrintable('café')).toBe('caf=C3=A9');
  });

  it('keeps interior spaces literal', () => {
    expect(encodeQuotedPrintable('a b')).toBe('a b');
  });

  it('escapes trailing space at the end of a line', () => {
    expect(encodeQuotedPrintable('a \nb')).toBe('a=20\nb');
  });

  it('escapes trailing tab at the end of input', () => {
    expect(encodeQuotedPrintable('a\t')).toBe('a=09');
  });

  it('preserves hard line breaks literally', () => {
    expect(encodeQuotedPrintable('line1\nline2')).toBe('line1\nline2');
  });

  it('normalizes CRLF line breaks to a single hard break', () => {
    expect(encodeQuotedPrintable('line1\r\nline2')).toBe('line1\nline2');
  });

  it('inserts a soft line break before exceeding the configured line length', () => {
    const result = encodeQuotedPrintable('abcdefghij', { lineLength: 5 });
    expect(result).toBe('abcd=\nefgh=\nij');
  });
});

describe('decodeQuotedPrintable', () => {
  it('handles empty string', () => {
    expect(decodeQuotedPrintable('')).toBe('');
  });

  it('leaves plain ASCII unchanged', () => {
    expect(decodeQuotedPrintable("Now's the time")).toBe("Now's the time");
  });

  it('decodes =3D back to the literal equals sign', () => {
    expect(decodeQuotedPrintable('truth=3Dbeauty')).toBe('truth=beauty');
  });

  it('decodes a multi-byte UTF-8 escape sequence', () => {
    expect(decodeQuotedPrintable('caf=C3=A9')).toBe('café');
  });

  it('removes a soft line break', () => {
    expect(decodeQuotedPrintable('abcd=\nefgh')).toBe('abcdefgh');
  });

  it('removes a CRLF soft line break', () => {
    expect(decodeQuotedPrintable('abcd=\r\nefgh')).toBe('abcdefgh');
  });

  it('is case-insensitive for hex digits', () => {
    expect(decodeQuotedPrintable('caf=c3=a9')).toBe('café');
  });

  it('throws for an invalid escape sequence', () => {
    expect(() => decodeQuotedPrintable('bad=zz')).toThrow(/Invalid quoted-printable/);
  });

  it('throws for a trailing incomplete escape sequence', () => {
    expect(() => decodeQuotedPrintable('bad=4')).toThrow(/Invalid quoted-printable/);
  });

  it('throws for raw non-ASCII characters in the input', () => {
    expect(() => decodeQuotedPrintable('café')).toThrow(/must be ASCII/);
  });

  it('round-trips through encode and decode', () => {
    const original = 'Héllo, world! Cost: 100=200, tab\tend.';
    expect(decodeQuotedPrintable(encodeQuotedPrintable(original))).toBe(original);
  });
});
