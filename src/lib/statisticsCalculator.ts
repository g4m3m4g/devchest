export interface Statistics {
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  range: number;
  count: number;
}

export function calculateStatistics(values: number[]): Statistics {
  if (values.length === 0) {
    throw new Error('At least one value is required');
  }

  const count = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / count;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(count / 2);
  const median = count % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  const frequency = new Map<number, number>();
  for (const v of values) {
    frequency.set(v, (frequency.get(v) ?? 0) + 1);
  }
  const maxFrequency = Math.max(...frequency.values());
  const mode = [...frequency.entries()]
    .filter(([, freq]) => freq === maxFrequency)
    .map(([value]) => value)
    .sort((a, b) => a - b);

  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / count;
  const stdDev = Math.sqrt(variance);

  const min = sorted[0];
  const max = sorted[count - 1];

  return { mean, median, mode, variance, stdDev, min, max, range: max - min, count };
}
