import { describe, it, expect } from 'vitest';
import { isValidForBase, parseInBase, formatInBase, convertAll } from '../../lib/numberBase';

describe('isValidForBase', () => {
  it('accepts valid binary digits', () => {
    expect(isValidForBase('1010', 2)).toBe(true);
  });

  it('rejects invalid binary digits', () => {
    expect(isValidForBase('1012', 2)).toBe(false);
  });

  it('accepts valid octal digits', () => {
    expect(isValidForBase('377', 8)).toBe(true);
  });

  it('rejects invalid octal digits', () => {
    expect(isValidForBase('378', 8)).toBe(false);
  });

  it('accepts valid hex digits, including letters and mixed case', () => {
    expect(isValidForBase('1fF0', 16)).toBe(true);
  });

  it('rejects invalid hex digits', () => {
    expect(isValidForBase('1fG0', 16)).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidForBase('', 10)).toBe(false);
  });

  it('accepts numbers with 0x/0o/0b prefixes for the matching base', () => {
    expect(isValidForBase('0x1F', 16)).toBe(true);
    expect(isValidForBase('0o17', 8)).toBe(true);
    expect(isValidForBase('0b101', 2)).toBe(true);
  });
});

describe('parseInBase', () => {
  it('parses a decimal string', () => {
    expect(parseInBase('255', 10)).toBe(255n);
  });

  it('parses a binary string', () => {
    expect(parseInBase('11111111', 2)).toBe(255n);
  });

  it('parses an octal string', () => {
    expect(parseInBase('377', 8)).toBe(255n);
  });

  it('parses a hex string', () => {
    expect(parseInBase('ff', 16)).toBe(255n);
  });

  it('parses a hex string with a 0x prefix', () => {
    expect(parseInBase('0x1F', 16)).toBe(31n);
  });

  it('parses very large numbers using BigInt precision', () => {
    expect(parseInBase('123456789012345678901234567890', 10)).toBe(123456789012345678901234567890n);
  });

  it('throws for an invalid number in the given base', () => {
    expect(() => parseInBase('129', 8)).toThrow();
  });

  it('throws for an empty string', () => {
    expect(() => parseInBase('', 10)).toThrow();
  });
});

describe('formatInBase', () => {
  it('formats to binary', () => {
    expect(formatInBase(255n, 2)).toBe('11111111');
  });

  it('formats to octal', () => {
    expect(formatInBase(255n, 8)).toBe('377');
  });

  it('formats to decimal', () => {
    expect(formatInBase(255n, 10)).toBe('255');
  });

  it('formats to lowercase hex', () => {
    expect(formatInBase(255n, 16)).toBe('ff');
  });

  it('formats zero', () => {
    expect(formatInBase(0n, 2)).toBe('0');
  });
});

describe('convertAll', () => {
  it('converts a decimal value to all bases', () => {
    expect(convertAll('255', 10)).toEqual({
      binary: '11111111',
      octal: '377',
      decimal: '255',
      hex: 'ff',
    });
  });

  it('converts a hex value to all bases', () => {
    expect(convertAll('FF', 16)).toEqual({
      binary: '11111111',
      octal: '377',
      decimal: '255',
      hex: 'ff',
    });
  });

  it('converts a binary value to all bases', () => {
    expect(convertAll('11111111', 2)).toEqual({
      binary: '11111111',
      octal: '377',
      decimal: '255',
      hex: 'ff',
    });
  });

  it('converts an octal value to all bases', () => {
    expect(convertAll('377', 8)).toEqual({
      binary: '11111111',
      octal: '377',
      decimal: '255',
      hex: 'ff',
    });
  });

  it('converts zero to all bases', () => {
    expect(convertAll('0', 10)).toEqual({
      binary: '0',
      octal: '0',
      decimal: '0',
      hex: '0',
    });
  });

  it('throws for an invalid value in the source base', () => {
    expect(() => convertAll('129', 8)).toThrow();
  });
});
