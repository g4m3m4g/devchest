import { describe, it, expect } from 'vitest';
import { parseCron, getNextRunTimes, buildFieldExpression, detectFieldMode } from '../../lib/cron';

describe('parseCron', () => {
  it('returns an error for an empty expression', () => {
    const result = parseCron('');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/empty/i);
  });

  it('returns an error when the field count is wrong', () => {
    const result = parseCron('* * * *');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Expected 5 fields/);
  });

  it('describes "every minute"', () => {
    const result = parseCron('* * * * *');
    expect(result.valid).toBe(true);
    expect(result.description).toBe('Every minute');
  });

  it('describes a step minute expression', () => {
    const result = parseCron('*/15 * * * *');
    expect(result.valid).toBe(true);
    expect(result.description).toBe('Every 15 minutes');
  });

  it('describes a single minute past every hour', () => {
    const result = parseCron('30 * * * *');
    expect(result.valid).toBe(true);
    expect(result.description).toBe('At minute 30 past every hour');
  });

  it('describes a specific time', () => {
    const result = parseCron('30 9 * * *');
    expect(result.valid).toBe(true);
    expect(result.description).toBe('At 09:30');
  });

  it('describes a weekday range', () => {
    const result = parseCron('0 9 * * 1-5');
    expect(result.valid).toBe(true);
    expect(result.description).toBe('At 09:00, on Monday through Friday');
  });

  it('describes a day-of-month clause', () => {
    const result = parseCron('0 0 1 * *');
    expect(result.valid).toBe(true);
    expect(result.description).toBe('At 00:00, on day-of-month 1');
  });

  it('describes a month clause', () => {
    const result = parseCron('0 0 1 1 *');
    expect(result.valid).toBe(true);
    expect(result.description).toBe('At 00:00, on day-of-month 1, in January');
  });

  it('describes a weekday list', () => {
    const result = parseCron('0 9 * * 1,3,5');
    expect(result.valid).toBe(true);
    expect(result.description).toBe('At 09:00, on Monday, Wednesday, Friday');
  });

  it('accepts named weekday ranges case-insensitively', () => {
    const result = parseCron('0 9 * * MON-FRI');
    expect(result.valid).toBe(true);
    expect(result.description).toBe('At 09:00, on Monday through Friday');
  });

  it('accepts named month values', () => {
    const result = parseCron('0 0 1 JAN *');
    expect(result.valid).toBe(true);
    expect(result.description).toBe('At 00:00, on day-of-month 1, in January');
  });

  it('falls back to a generic description for multi-value minute lists', () => {
    const result = parseCron('0,30 * * * *');
    expect(result.valid).toBe(true);
    expect(result.description).toContain('minutes 0, 30');
    expect(result.description).toContain('every hour');
  });

  it('rejects an out-of-range value', () => {
    const result = parseCron('0 0 32 * *');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => /Day-of-month/.test(e))).toBe(true);
  });

  it('rejects a non-numeric value with no matching alias', () => {
    const result = parseCron('abc * * * *');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => /Minute/.test(e))).toBe(true);
  });

  it('rejects a zero step', () => {
    const result = parseCron('*/0 * * * *');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => /step/i.test(e))).toBe(true);
  });

  it('rejects a descending range', () => {
    const result = parseCron('0 0 10-5 * *');
    expect(result.valid).toBe(false);
  });
});

describe('getNextRunTimes', () => {
  it('returns an empty array for an invalid expression', () => {
    expect(getNextRunTimes('bad', 5, new Date(2024, 0, 1))).toEqual([]);
  });

  it('computes the next daily midnight runs', () => {
    const from = new Date(2024, 0, 1, 10, 30, 0);
    const runs = getNextRunTimes('0 0 * * *', 3, from);
    expect(runs).toHaveLength(3);
    expect(runs[0]).toEqual(new Date(2024, 0, 2, 0, 0, 0));
    expect(runs[1]).toEqual(new Date(2024, 0, 3, 0, 0, 0));
    expect(runs[2]).toEqual(new Date(2024, 0, 4, 0, 0, 0));
  });

  it('computes the next weekday-restricted runs', () => {
    const from = new Date(2024, 0, 1, 0, 0, 0); // Monday Jan 1 2024
    const runs = getNextRunTimes('0 9 * * 1-5', 2, from);
    expect(runs[0]).toEqual(new Date(2024, 0, 1, 9, 0, 0));
    expect(runs[1]).toEqual(new Date(2024, 0, 2, 9, 0, 0));
  });
});

describe('buildFieldExpression', () => {
  it('builds an "every" expression', () => {
    expect(buildFieldExpression('every', {})).toBe('*');
  });

  it('builds a "specific" expression from values', () => {
    expect(buildFieldExpression('specific', { values: [1, 3, 5] })).toBe('1,3,5');
  });

  it('builds a "range" expression', () => {
    expect(buildFieldExpression('range', { start: 1, end: 5 })).toBe('1-5');
  });

  it('builds a "step" expression', () => {
    expect(buildFieldExpression('step', { step: 15 })).toBe('*/15');
  });
});

describe('detectFieldMode', () => {
  it('detects "every"', () => {
    expect(detectFieldMode('*')).toBe('every');
  });

  it('detects "step"', () => {
    expect(detectFieldMode('*/15')).toBe('step');
  });

  it('detects "range"', () => {
    expect(detectFieldMode('1-5')).toBe('range');
  });

  it('detects "specific" for a single value', () => {
    expect(detectFieldMode('30')).toBe('specific');
  });

  it('detects "specific" for a list', () => {
    expect(detectFieldMode('1,3,5')).toBe('specific');
  });
});
