import { useState, useMemo } from 'react';
import { calculateStatistics } from '../../../lib/statisticsCalculator';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const inputClass = 'flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40 resize-none';
const outputClass = 'flex-1 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 placeholder-neutral-800 outline-none';

function parseValues(text: string): number[] {
  const tokens = text.split(/[,\s\n]+/).map(t => t.trim()).filter(Boolean);
  if (tokens.length === 0) {
    throw new Error('At least one value is required');
  }
  return tokens.map(token => {
    const num = Number(token);
    if (Number.isNaN(num)) throw new Error(`"${token}" is not a valid number`);
    return num;
  });
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 10000) / 10000);
}

export default function StatisticsCalculatorTool() {
  const [values, setValues] = useState('2, 4, 4, 4, 5, 5, 7, 9');

  const result = useMemo(() => {
    try {
      const parsed = parseValues(values);
      const stats = calculateStatistics(parsed);
      return { stats, error: null };
    } catch (err) {
      return { stats: null, error: (err as Error).message };
    }
  }, [values]);

  const outputValue = result.stats
    ? [
        `Mean: ${formatNumber(result.stats.mean)}`,
        `Median: ${formatNumber(result.stats.median)}`,
        `Mode: ${result.stats.mode.map(formatNumber).join(', ')}`,
        `Std Dev: ${formatNumber(result.stats.stdDev)}`,
        `Variance: ${formatNumber(result.stats.variance)}`,
        `Min: ${formatNumber(result.stats.min)}`,
        `Max: ${formatNumber(result.stats.max)}`,
        `Range: ${formatNumber(result.stats.range)}`,
        `Count: ${result.stats.count}`,
      ].join('\n')
    : '';

  return (
    <ToolLayout
      title="Statistics Calculator"
      description="Compute mean, median, mode, standard deviation, and more from a list of numbers."
      outputValue={outputValue}
      onClear={() => setValues('')}
    >
      <div className="flex flex-col gap-4 h-full">
        <Panel label="Values" className="shrink-0">
          <textarea
            id="stats-values"
            aria-label="Values"
            value={values}
            onChange={e => setValues(e.target.value)}
            placeholder="1, 2, 3, 4"
            rows={3}
            className={`${inputClass} m-4`}
          />
        </Panel>

        <Panel label="Results" className="flex-1 min-h-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            {(
              [
                ['Mean', result.stats ? formatNumber(result.stats.mean) : ''],
                ['Median', result.stats ? formatNumber(result.stats.median) : ''],
                ['Mode', result.stats ? result.stats.mode.map(formatNumber).join(', ') : ''],
                ['Std Dev', result.stats ? formatNumber(result.stats.stdDev) : ''],
                ['Variance', result.stats ? formatNumber(result.stats.variance) : ''],
                ['Min', result.stats ? formatNumber(result.stats.min) : ''],
                ['Max', result.stats ? formatNumber(result.stats.max) : ''],
                ['Range', result.stats ? formatNumber(result.stats.range) : ''],
                ['Count', result.stats ? String(result.stats.count) : ''],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} className="flex items-center gap-2">
                <label htmlFor={`stats-${label.toLowerCase().replace(/\s+/g, '-')}`} className="w-32 text-xs text-neutral-500 shrink-0">{label}</label>
                <input
                  id={`stats-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  aria-label={label}
                  type="text"
                  value={value}
                  readOnly
                  placeholder="—"
                  className={outputClass}
                />
              </div>
            ))}
          </div>
        </Panel>

        {result.error && (
          <p className="shrink-0 text-xs text-red-400 px-1">{result.error}</p>
        )}
      </div>
    </ToolLayout>
  );
}
