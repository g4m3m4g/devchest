import { describe, it, expect } from 'vitest';
import { bigNumberOp, BIG_NUMBER_OPS } from '../../lib/bigNumberCalculator';

describe('bigNumberOp', () => {
  it('adds two arbitrarily large integers', () => {
    const a = 10n ** 30n;
    const b = 1n;
    expect(bigNumberOp(a, b, 'ADD')).toBe(a + 1n);
  });

  it('subtracts', () => {
    expect(bigNumberOp(10n, 3n, 'SUBTRACT')).toBe(7n);
  });

  it('multiplies large integers exactly (no float precision loss)', () => {
    const a = 123456789012345678901234567890n;
    const b = 2n;
    expect(bigNumberOp(a, b, 'MULTIPLY')).toBe(a * 2n);
  });

  it('divides using truncating integer division', () => {
    expect(bigNumberOp(10n, 3n, 'DIVIDE')).toBe(3n);
    expect(bigNumberOp(-10n, 3n, 'DIVIDE')).toBe(-3n);
  });

  it('throws when dividing by zero', () => {
    expect(() => bigNumberOp(10n, 0n, 'DIVIDE')).toThrow();
  });

  it('computes the modulo', () => {
    expect(bigNumberOp(10n, 3n, 'MODULO')).toBe(1n);
  });

  it('throws for modulo by zero', () => {
    expect(() => bigNumberOp(10n, 0n, 'MODULO')).toThrow();
  });

  it('raises to a power', () => {
    expect(bigNumberOp(2n, 10n, 'POWER')).toBe(1024n);
  });

  it('throws for a negative exponent', () => {
    expect(() => bigNumberOp(2n, -1n, 'POWER')).toThrow();
  });

  it('exposes all six operations', () => {
    expect(BIG_NUMBER_OPS).toEqual(['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE', 'MODULO', 'POWER']);
  });
});
