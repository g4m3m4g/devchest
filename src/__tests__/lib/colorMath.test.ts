import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, mixColors, relativeLuminance, contrastRatio, wcagLevel } from '../../lib/colorMath';

describe('hexToRgb', () => {
  it('parses a 6-digit hex color', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('parses a 3-digit shorthand hex color', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('is case-insensitive and tolerates missing #', () => {
    expect(hexToRgb('FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('throws for invalid hex strings', () => {
    expect(() => hexToRgb('#zzzzzz')).toThrow();
    expect(() => hexToRgb('#ff00')).toThrow();
    expect(() => hexToRgb('')).toThrow();
  });
});

describe('rgbToHex', () => {
  it('formats an RGB object as a 6-digit hex string', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
  });
});

describe('mixColors', () => {
  it('returns the first color at ratio 0', () => {
    expect(mixColors({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, 0)).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('returns the second color at ratio 1', () => {
    expect(mixColors({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, 1)).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('averages evenly at ratio 0.5', () => {
    expect(mixColors({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, 0.5)).toEqual({ r: 128, g: 0, b: 128 });
  });
});

describe('relativeLuminance', () => {
  it('returns 0 for black and 1 for white', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
  });
});

describe('contrastRatio', () => {
  it('computes a 21:1 ratio for black on white', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 1);
  });

  it('computes a 1:1 ratio for identical colors', () => {
    expect(contrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 })).toBeCloseTo(1, 5);
  });

  it('is symmetric regardless of argument order', () => {
    const a = { r: 20, g: 90, b: 200 };
    const b = { r: 240, g: 240, b: 240 };
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 5);
  });
});

describe('wcagLevel', () => {
  it('passes AA and AAA for normal text at 21:1', () => {
    expect(wcagLevel(21, false)).toEqual({ aa: true, aaa: true });
  });

  it('fails AA for normal text below 4.5:1', () => {
    expect(wcagLevel(4, false)).toEqual({ aa: false, aaa: false });
  });

  it('passes AA but not AAA for normal text between 4.5 and 7', () => {
    expect(wcagLevel(5, false)).toEqual({ aa: true, aaa: false });
  });

  it('uses a lower threshold for large text', () => {
    expect(wcagLevel(3.5, true)).toEqual({ aa: true, aaa: false });
    expect(wcagLevel(3.5, false)).toEqual({ aa: false, aaa: false });
  });
});
