import { describe, it, expect } from 'vitest';
import { add, subtract, multiply, transpose, determinant, inverse } from '../../lib/matrixCalculator';

describe('add', () => {
  it('adds two matrices element-wise', () => {
    expect(add([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[6, 8], [10, 12]]);
  });

  it('throws for mismatched dimensions', () => {
    expect(() => add([[1, 2]], [[1, 2, 3]])).toThrow();
    expect(() => add([[1, 2]], [[1, 2], [3, 4]])).toThrow();
  });
});

describe('subtract', () => {
  it('subtracts two matrices element-wise', () => {
    expect(subtract([[5, 6], [7, 8]], [[1, 2], [3, 4]])).toEqual([[4, 4], [4, 4]]);
  });

  it('throws for mismatched dimensions', () => {
    expect(() => subtract([[1, 2]], [[1, 2, 3]])).toThrow();
  });
});

describe('multiply', () => {
  it('multiplies compatible matrices', () => {
    expect(multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[19, 22], [43, 50]]);
  });

  it('multiplies non-square compatible matrices', () => {
    expect(multiply([[1, 2, 3]], [[4], [5], [6]])).toEqual([[32]]);
  });

  it('throws when inner dimensions do not match', () => {
    expect(() => multiply([[1, 2]], [[1, 2]])).toThrow();
  });
});

describe('transpose', () => {
  it('transposes a matrix', () => {
    expect(transpose([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);
  });
});

describe('determinant', () => {
  it('computes a 2x2 determinant', () => {
    expect(determinant([[1, 2], [3, 4]])).toBe(-2);
  });

  it('computes a 3x3 determinant', () => {
    expect(determinant([[1, 2, 3], [4, 5, 6], [7, 8, 10]])).toBe(-3);
  });

  it('throws for non-square matrices', () => {
    expect(() => determinant([[1, 2, 3], [4, 5, 6]])).toThrow();
  });

  it('throws for unsupported sizes', () => {
    expect(() => determinant([[1]])).toThrow();
    expect(() => determinant([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]])).toThrow();
  });
});

describe('inverse', () => {
  it('computes a 2x2 inverse', () => {
    expect(inverse([[4, 7], [2, 6]])).toEqual([[0.6, -0.7], [-0.2, 0.4]]);
  });

  it('computes a 3x3 inverse', () => {
    const result = inverse([[1, 2, 3], [0, 1, 4], [5, 6, 0]]);
    expect(result[0][0]).toBeCloseTo(-24);
    expect(result[0][1]).toBeCloseTo(18);
    expect(result[0][2]).toBeCloseTo(5);
  });

  it('throws for a singular matrix', () => {
    expect(() => inverse([[1, 2], [2, 4]])).toThrow();
  });

  it('throws for non-square matrices', () => {
    expect(() => inverse([[1, 2, 3], [4, 5, 6]])).toThrow();
  });
});
