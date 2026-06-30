import { describe, it, expect } from 'vitest';
import { formatUuid } from '../../lib/uuid';

const SAMPLE_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('formatUuid', () => {
  it('keeps standard hyphen format unchanged', () => {
    expect(formatUuid(SAMPLE_UUID, 'hyphen', false)).toBe(SAMPLE_UUID);
  });

  it('removes hyphens', () => {
    const result = formatUuid(SAMPLE_UUID, 'none', false);
    expect(result).toBe('550e8400e29b41d4a716446655440000');
    expect(result).not.toContain('-');
  });

  it('wraps in curly braces', () => {
    const result = formatUuid(SAMPLE_UUID, 'braces', false);
    expect(result).toBe(`{${SAMPLE_UUID}}`);
    expect(result.startsWith('{')).toBe(true);
    expect(result.endsWith('}')).toBe(true);
  });

  it('wraps in parentheses', () => {
    const result = formatUuid(SAMPLE_UUID, 'brackets', false);
    expect(result).toBe(`(${SAMPLE_UUID})`);
    expect(result.startsWith('(')).toBe(true);
    expect(result.endsWith(')')).toBe(true);
  });

  it('uppercases with hyphen format', () => {
    const result = formatUuid(SAMPLE_UUID, 'hyphen', true);
    expect(result).toBe(SAMPLE_UUID.toUpperCase());
    expect(result).toMatch(/^[A-F0-9-]+$/);
  });

  it('uppercases with no-hyphen format', () => {
    const result = formatUuid(SAMPLE_UUID, 'none', true);
    expect(result).toMatch(/^[A-F0-9]+$/);
    expect(result).not.toContain('-');
  });

  it('uppercases with braces format', () => {
    const result = formatUuid(SAMPLE_UUID, 'braces', true);
    expect(result.startsWith('{')).toBe(true);
    expect(result).not.toContain('a');
  });

  it('lowercase is default when uppercase=false', () => {
    const result = formatUuid(SAMPLE_UUID, 'hyphen', false);
    expect(result).toMatch(/^[a-f0-9-]+$/);
  });
});
