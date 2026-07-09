import { describe, it, expect } from 'vitest';
import { renderAsciiArt, ASCII_FONT_HEIGHT } from '../../lib/asciiArt';

describe('renderAsciiArt', () => {
  it('returns an empty array for empty input', () => {
    expect(renderAsciiArt('')).toEqual([]);
  });

  it('returns 5 rows for any non-empty input', () => {
    expect(renderAsciiArt('A')).toHaveLength(ASCII_FONT_HEIGHT);
    expect(renderAsciiArt('HELLO')).toHaveLength(ASCII_FONT_HEIGHT);
  });

  it('renders the letter I as a single vertical bar', () => {
    const rows = renderAsciiArt('I');
    expect(rows.every(row => row.trim() === '#')).toBe(true);
  });

  it('renders the letter L with a horizontal base', () => {
    const rows = renderAsciiArt('L');
    expect(rows[rows.length - 1].trim()).toBe('#####');
    expect(rows[0].trim()).toBe('#');
  });

  it('is case-insensitive', () => {
    expect(renderAsciiArt('a')).toEqual(renderAsciiArt('A'));
  });

  it('produces wider output for longer text', () => {
    const short = renderAsciiArt('A');
    const long = renderAsciiArt('AA');
    expect(long[0].length).toBeGreaterThan(short[0].length);
  });

  it('renders unsupported characters as a blank glyph without throwing', () => {
    expect(() => renderAsciiArt('A@Z')).not.toThrow();
    const rows = renderAsciiArt('A@Z');
    expect(rows).toHaveLength(ASCII_FONT_HEIGHT);
  });

  it('renders digits', () => {
    const rows = renderAsciiArt('0');
    expect(rows).toHaveLength(ASCII_FONT_HEIGHT);
    expect(rows.some(r => r.trim() !== '')).toBe(true);
  });
});
