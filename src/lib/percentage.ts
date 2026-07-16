export type PercentageMode = 'percent-of' | 'what-percent' | 'percent-change';

export function percentOf(percent: number, of: number): number {
  return (percent / 100) * of;
}

export function whatPercent(x: number, y: number): number {
  return (x / y) * 100;
}

export function percentChange(from: number, to: number): number {
  return ((to - from) / from) * 100;
}
