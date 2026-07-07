import { describe, it, expect } from 'vitest';
import { punycodeEncode, punycodeDecode, toASCII, toUnicode } from '../../lib/punycode';

describe('punycodeEncode', () => {
  it('handles empty string', () => {
    expect(punycodeEncode('')).toBe('');
  });

  it('appends a trailing delimiter for pure ASCII input with no extended digits', () => {
    expect(punycodeEncode('example')).toBe('example-');
  });

  it('encodes a known Latin-1 example', () => {
    expect(punycodeEncode('bücher')).toBe('bcher-kva');
  });

  it('encodes a known accented example', () => {
    expect(punycodeEncode('mañana')).toBe('maana-pta');
  });

  it('encodes an emoji', () => {
    expect(punycodeEncode('😀')).toBe('e28h');
  });
});

describe('punycodeDecode', () => {
  it('handles empty string', () => {
    expect(punycodeDecode('')).toBe('');
  });

  it('treats input with no delimiter as all-basic code points', () => {
    expect(punycodeDecode('example')).toBe('Ωίθηδ');
  });

  it('decodes a known Latin-1 example', () => {
    expect(punycodeDecode('bcher-kva')).toBe('bücher');
  });

  it('decodes a known accented example', () => {
    expect(punycodeDecode('maana-pta')).toBe('mañana');
  });

  it('decodes an emoji', () => {
    expect(punycodeDecode('e28h')).toBe('😀');
  });

  it('throws for an invalid digit', () => {
    expect(() => punycodeDecode('a-!!!')).toThrow();
  });

  it('round-trips arbitrary unicode strings', () => {
    const original = 'Héllo, 世界 😀!';
    expect(punycodeDecode(punycodeEncode(original))).toBe(original);
  });
});

describe('toASCII', () => {
  it('handles empty string', () => {
    expect(toASCII('')).toBe('');
  });

  it('leaves an ASCII-only domain unchanged', () => {
    expect(toASCII('example.com')).toBe('example.com');
  });

  it('encodes a single-label IDN domain with the xn-- prefix', () => {
    expect(toASCII('bücher.de')).toBe('xn--bcher-kva.de');
  });

  it('encodes an emoji domain', () => {
    expect(toASCII('😀.com')).toBe('xn--e28h.com');
  });

  it('encodes each non-ASCII label independently in a multi-label domain', () => {
    expect(toASCII('mañana.bücher.com')).toBe('xn--maana-pta.xn--bcher-kva.com');
  });
});

describe('toUnicode', () => {
  it('handles empty string', () => {
    expect(toUnicode('')).toBe('');
  });

  it('leaves a plain ASCII domain unchanged', () => {
    expect(toUnicode('example.com')).toBe('example.com');
  });

  it('decodes an xn-- prefixed label', () => {
    expect(toUnicode('xn--bcher-kva.de')).toBe('bücher.de');
  });

  it('decodes an emoji domain', () => {
    expect(toUnicode('xn--e28h.com')).toBe('😀.com');
  });

  it('decodes each xn-- label independently in a multi-label domain', () => {
    expect(toUnicode('xn--maana-pta.xn--bcher-kva.com')).toBe('mañana.bücher.com');
  });

  it('throws for an invalid punycode label', () => {
    expect(() => toUnicode('xn--a-!!!.com')).toThrow();
  });

  it('round-trips through toASCII and toUnicode', () => {
    const original = 'mañana.example.com';
    expect(toUnicode(toASCII(original))).toBe(original);
  });
});
