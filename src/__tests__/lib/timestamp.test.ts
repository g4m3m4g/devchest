import { describe, it, expect } from 'vitest';
import { formatLocal, formatRelativeTime, convertUnixToDate, convertDateToUnix } from '../../lib/timestamp';

describe('formatLocal', () => {
  it('formats a date with zero-padded components', () => {
    const d = new Date('2024-01-05T08:03:07');
    const result = formatLocal(d);
    expect(result).toContain('2024-01-05');
    expect(result).toContain('08:03:07');
  });

  it('pads single-digit month and day', () => {
    const d = new Date(2024, 0, 5, 8, 3, 7); // Jan 5, 2024 08:03:07
    const result = formatLocal(d);
    expect(result).toMatch(/2024-01-05 08:03:07/);
  });
});

describe('formatRelativeTime', () => {
  it('formats seconds in the future', () => {
    expect(formatRelativeTime(45)).toBe('45s from now');
  });

  it('formats seconds in the past', () => {
    expect(formatRelativeTime(-45)).toBe('45s ago');
  });

  it('formats minutes in the future', () => {
    expect(formatRelativeTime(90)).toBe('1m 30s from now');
  });

  it('formats hours in the future', () => {
    expect(formatRelativeTime(3661)).toBe('1h 1m from now');
  });

  it('formats days in the future', () => {
    expect(formatRelativeTime(90000)).toBe('1d 1h from now');
  });

  it('formats days in the past', () => {
    expect(formatRelativeTime(-90000)).toBe('1d 1h ago');
  });

  it('formats exactly one minute', () => {
    expect(formatRelativeTime(60)).toBe('1m 0s from now');
  });
});

describe('convertUnixToDate', () => {
  const NOW_TS = 1700000000;

  it('converts a known timestamp to ISO', () => {
    const result = convertUnixToDate(1700000000, NOW_TS);
    expect('error' in result ? result.error : result.iso).toContain('2023');
  });

  it('includes all required fields', () => {
    const result = convertUnixToDate(1700000000, NOW_TS);
    if ('error' in result) throw new Error('Should not be an error');
    expect(result.iso).toBeTruthy();
    expect(result.local).toBeTruthy();
    expect(result.utc).toBeTruthy();
    expect(result.relative).toBeTruthy();
    expect(result.ms).toBe(1700000000 * 1000);
  });

  it('includes milliseconds value', () => {
    const result = convertUnixToDate(1000, 2000);
    if ('error' in result) throw new Error('Should not be error');
    expect(result.ms).toBe(1000000);
  });

  it('shows "ago" for past timestamps', () => {
    const result = convertUnixToDate(1000000000, 2000000000);
    if ('error' in result) throw new Error('Should not be error');
    expect(result.relative).toContain('ago');
  });

  it('shows "from now" for future timestamps', () => {
    const result = convertUnixToDate(2000000000, 1000000000);
    if ('error' in result) throw new Error('Should not be error');
    expect(result.relative).toContain('from now');
  });
});

describe('convertDateToUnix', () => {
  it('converts ISO date string to unix timestamp', () => {
    const result = convertDateToUnix('2024-01-15T12:00:00Z');
    if ('error' in result) throw new Error('Should not be error');
    expect(result.unix).toBe(Math.floor(new Date('2024-01-15T12:00:00Z').getTime() / 1000));
  });

  it('returns milliseconds value', () => {
    const result = convertDateToUnix('2024-01-15T12:00:00Z');
    if ('error' in result) throw new Error('Should not be error');
    expect(result.ms).toBe(new Date('2024-01-15T12:00:00Z').getTime());
  });

  it('returns error for invalid date string', () => {
    const result = convertDateToUnix('not-a-date');
    expect('error' in result).toBe(true);
  });

  it('returns error for empty string', () => {
    const result = convertDateToUnix('');
    expect('error' in result).toBe(true);
  });

  it('handles short date format', () => {
    const result = convertDateToUnix('2024-01-15');
    expect('error' in result).toBe(false);
  });
});
