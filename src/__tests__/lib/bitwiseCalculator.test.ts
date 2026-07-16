import { describe, it, expect } from 'vitest';
import { bitwiseOp, toBinaryString } from '../../lib/bitwiseCalculator';

describe('bitwiseOp', () => {
  it('computes AND', () => {
    expect(bitwiseOp(12n, 10n, 'AND')).toBe(8n);
  });

  it('computes OR', () => {
    expect(bitwiseOp(12n, 10n, 'OR')).toBe(14n);
  });

  it('computes XOR', () => {
    expect(bitwiseOp(12n, 10n, 'XOR')).toBe(6n);
  });

  it('computes NOT ignoring the second operand', () => {
    expect(bitwiseOp(0n, 0n, 'NOT')).toBe(-1n);
    expect(bitwiseOp(5n, 0n, 'NOT')).toBe(-6n);
  });

  it('computes left shift', () => {
    expect(bitwiseOp(1n, 4n, 'LSHIFT')).toBe(16n);
  });

  it('computes right shift', () => {
    expect(bitwiseOp(16n, 4n, 'RSHIFT')).toBe(1n);
  });

  it('throws for a negative shift amount', () => {
    expect(() => bitwiseOp(1n, -1n, 'LSHIFT')).toThrow();
  });
});

describe('toBinaryString', () => {
  it('formats a positive value with no leading zeros', () => {
    expect(toBinaryString(10n)).toBe('1010');
  });

  it('formats zero as "0"', () => {
    expect(toBinaryString(0n)).toBe('0');
  });

  it('pads to the requested bit width', () => {
    expect(toBinaryString(10n, 8)).toBe('00001010');
  });
});
