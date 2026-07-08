import { describe, it, expect } from 'vitest';
import {
  parseDataUrl,
  buildDataUrl,
  base64ByteLength,
  formatBytes,
  suggestFileName,
} from '../../lib/dataUrl';

describe('parseDataUrl', () => {
  it('parses a base64-encoded data URL', () => {
    expect(parseDataUrl('data:image/png;base64,iVBORw0KGgo=')).toEqual({
      mimeType: 'image/png',
      isBase64: true,
      data: 'iVBORw0KGgo=',
    });
  });

  it('parses a plain (non-base64) data URL', () => {
    expect(parseDataUrl('data:text/plain,Hello%2C%20World!')).toEqual({
      mimeType: 'text/plain',
      isBase64: false,
      data: 'Hello%2C%20World!',
    });
  });

  it('defaults to text/plain when no media type is given', () => {
    expect(parseDataUrl('data:,Hello')).toEqual({
      mimeType: 'text/plain',
      isBase64: false,
      data: 'Hello',
    });
  });

  it('preserves media type parameters like charset', () => {
    expect(parseDataUrl('data:text/plain;charset=utf-8,Hello')).toEqual({
      mimeType: 'text/plain;charset=utf-8',
      isBase64: false,
      data: 'Hello',
    });
  });

  it('handles commas within the payload', () => {
    expect(parseDataUrl('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==')).toEqual({
      mimeType: 'text/plain',
      isBase64: true,
      data: 'SGVsbG8sIFdvcmxkIQ==',
    });
  });

  it('returns null for input missing the data: prefix', () => {
    expect(parseDataUrl('not a data url')).toBeNull();
  });

  it('returns null for input missing a comma', () => {
    expect(parseDataUrl('data:image/png;base64')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseDataUrl('')).toBeNull();
  });
});

describe('buildDataUrl', () => {
  it('builds a base64 data URL from a MIME type and payload', () => {
    expect(buildDataUrl('image/png', 'iVBORw0KGgo=')).toBe('data:image/png;base64,iVBORw0KGgo=');
  });
});

describe('base64ByteLength', () => {
  it('returns 0 for an empty string', () => {
    expect(base64ByteLength('')).toBe(0);
  });

  it('computes the decoded byte length with no padding', () => {
    expect(base64ByteLength('aGVsbG8h')).toBe(6); // "hello!"
  });

  it('accounts for one padding character', () => {
    expect(base64ByteLength('aGVsbG8=')).toBe(5); // "hello"
  });

  it('accounts for two padding characters', () => {
    expect(base64ByteLength('aGk=')).toBe(2); // "hi"
  });

  it('ignores surrounding whitespace and newlines', () => {
    expect(base64ByteLength('aGVsbG8h\n')).toBe(6);
  });
});

describe('formatBytes', () => {
  it('formats bytes under 1024 as-is', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1_500_000)).toBe('1.43 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(2 * 1024 ** 3)).toBe('2 GB');
  });
});

describe('suggestFileName', () => {
  it('suggests a filename with the correct extension for a known MIME type', () => {
    expect(suggestFileName('image/png')).toBe('download.png');
  });

  it('strips media type parameters before lookup', () => {
    expect(suggestFileName('text/plain;charset=utf-8')).toBe('download.txt');
  });

  it('falls back to .bin for an unknown MIME type', () => {
    expect(suggestFileName('application/x-not-real')).toBe('download.bin');
  });
});
