import { describe, it, expect } from 'vitest';
import { encodeMorse, decodeMorse } from '../../lib/morse';

describe('encodeMorse', () => {
  it('handles empty string', () => {
    expect(encodeMorse('')).toBe('');
  });

  it('encodes a single letter', () => {
    expect(encodeMorse('A')).toBe('.-');
  });

  it('encodes lowercase letters the same as uppercase', () => {
    expect(encodeMorse('sos')).toBe('... --- ...');
  });

  it('encodes a word with letters separated by single spaces', () => {
    expect(encodeMorse('HI')).toBe('.... ..');
  });

  it('encodes digits', () => {
    expect(encodeMorse('123')).toBe('.---- ..--- ...--');
  });

  it('encodes punctuation', () => {
    expect(encodeMorse('A.')).toBe('.- .-.-.-');
  });

  it('uses a slash to separate words', () => {
    expect(encodeMorse('HI THERE')).toBe('.... .. / - .... . .-. .');
  });

  it('throws for characters with no Morse mapping', () => {
    expect(() => encodeMorse('café')).toThrow();
  });
});

describe('decodeMorse', () => {
  it('handles empty string', () => {
    expect(decodeMorse('')).toBe('');
  });

  it('decodes a single letter', () => {
    expect(decodeMorse('.-')).toBe('A');
  });

  it('decodes a word', () => {
    expect(decodeMorse('... --- ...')).toBe('SOS');
  });

  it('decodes multiple words separated by slash', () => {
    expect(decodeMorse('.... .. / - .... . .-. .')).toBe('HI THERE');
  });

  it('decodes digits and punctuation', () => {
    expect(decodeMorse('.---- ..--- ...--')).toBe('123');
  });

  it('tolerates extra whitespace around slashes and codes', () => {
    expect(decodeMorse('....  ..   /   -  ....  .  .-.  .')).toBe('HI THERE');
  });

  it('throws for an invalid Morse sequence', () => {
    expect(() => decodeMorse('.......')).toThrow();
  });

  it('round-trips through encode and decode', () => {
    const original = 'HELLO WORLD 123';
    expect(decodeMorse(encodeMorse(original))).toBe(original);
  });
});
