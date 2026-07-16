import { describe, it, expect } from 'vitest';
import { simplifyRatio, resolveHeight, resolveWidth } from '../../lib/aspectRatio';

describe('simplifyRatio', () => {
  it('reduces 1920x1080 to 16:9', () => {
    expect(simplifyRatio(1920, 1080)).toEqual({ w: 16, h: 9 });
  });

  it('reduces 800x600 to 4:3', () => {
    expect(simplifyRatio(800, 600)).toEqual({ w: 4, h: 3 });
  });

  it('leaves already-simplified ratios unchanged', () => {
    expect(simplifyRatio(16, 9)).toEqual({ w: 16, h: 9 });
  });

  it('reduces equal dimensions to 1:1', () => {
    expect(simplifyRatio(500, 500)).toEqual({ w: 1, h: 1 });
  });

  it('throws for a zero dimension', () => {
    expect(() => simplifyRatio(0, 100)).toThrow();
  });

  it('throws for a negative dimension', () => {
    expect(() => simplifyRatio(-1, 100)).toThrow();
  });
});

describe('resolveHeight', () => {
  it('computes height from a known width and target ratio', () => {
    expect(resolveHeight(1920, 16, 9)).toBeCloseTo(1080);
  });

  it('computes height for a 4:3 ratio', () => {
    expect(resolveHeight(800, 4, 3)).toBeCloseTo(600);
  });

  it('throws when ratio width is 0', () => {
    expect(() => resolveHeight(1920, 0, 9)).toThrow();
  });
});

describe('resolveWidth', () => {
  it('computes width from a known height and target ratio', () => {
    expect(resolveWidth(1080, 16, 9)).toBeCloseTo(1920);
  });

  it('computes width for a 4:3 ratio', () => {
    expect(resolveWidth(600, 4, 3)).toBeCloseTo(800);
  });

  it('throws when ratio height is 0', () => {
    expect(() => resolveWidth(1080, 16, 0)).toThrow();
  });
});
