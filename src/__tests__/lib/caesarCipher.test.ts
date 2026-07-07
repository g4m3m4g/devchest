import { describe, it, expect } from 'vitest';
import { caesarEncode, caesarDecode, rot13 } from '../../lib/caesarCipher';

describe('caesarEncode', () => {
  it('handles empty string', () => {
    expect(caesarEncode('', 3)).toBe('');
  });

  it('shifts lowercase letters', () => {
    expect(caesarEncode('abc', 3)).toBe('def');
  });

  it('wraps around the end of the alphabet', () => {
    expect(caesarEncode('xyz', 3)).toBe('abc');
  });

  it('shifts uppercase letters', () => {
    expect(caesarEncode('ABC', 3)).toBe('DEF');
  });

  it('preserves case and leaves non-letters unchanged', () => {
    expect(caesarEncode('Hello, World!', 3)).toBe('Khoor, Zruog!');
  });

  it('handles a shift of 0 as a no-op', () => {
    expect(caesarEncode('Hello', 0)).toBe('Hello');
  });

  it('normalizes negative shifts', () => {
    expect(caesarEncode('abc', -3)).toBe('xyz');
  });

  it('normalizes shifts larger than 26', () => {
    expect(caesarEncode('abc', 29)).toBe(caesarEncode('abc', 3));
  });
});

describe('caesarDecode', () => {
  it('handles empty string', () => {
    expect(caesarDecode('', 3)).toBe('');
  });

  it('reverses an encoded string with the same shift', () => {
    expect(caesarDecode('Khoor, Zruog!', 3)).toBe('Hello, World!');
  });

  it('round-trips through encode and decode', () => {
    const original = 'The Quick Brown Fox Jumps Over The Lazy Dog.';
    expect(caesarDecode(caesarEncode(original, 17), 17)).toBe(original);
  });
});

describe('rot13', () => {
  it('handles empty string', () => {
    expect(rot13('')).toBe('');
  });

  it('encodes using a fixed shift of 13', () => {
    expect(rot13('Hello, World!')).toBe('Uryyb, Jbeyq!');
  });

  it('is its own inverse', () => {
    const original = 'The Quick Brown Fox';
    expect(rot13(rot13(original))).toBe(original);
  });
});
