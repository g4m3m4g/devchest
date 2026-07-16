import { useState, useMemo } from 'react';
import { percentOf, whatPercent, percentChange } from '../../../lib/percentage';
import type { PercentageMode } from '../../../lib/percentage';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const selectClass = 'flex-1 bg-white/5 border border-white/5 text-neutral-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/40';

const MODES: { id: PercentageMode; label: string; firstLabel: string; secondLabel: string; template: (a: string, b: string) => string }[] = [
  { id: 'percent-of', label: 'X% of Y', firstLabel: 'Percent', secondLabel: 'Of value', template: (a, b) => `${a || 'X'}% of ${b || 'Y'}` },
  { id: 'what-percent', label: 'X is what % of Y', firstLabel: 'X', secondLabel: 'Y', template: (a, b) => `${a || 'X'} is what % of ${b || 'Y'}` },
  { id: 'percent-change', label: '% change from X to Y', firstLabel: 'From (X)', secondLabel: 'To (Y)', template: (a, b) => `% change from ${a || 'X'} to ${b || 'Y'}` },
];

export default function PercentageCalculatorTool() {
  const [mode, setMode] = useState<PercentageMode>('percent-of');
  const [first, setFirst] = useState('25');
  const [second, setSecond] = useState('200');

  const activeMode = MODES.find(m => m.id === mode)!;

  const result = useMemo(() => {
    const a = Number(first);
    const b = Number(second);
    if (first.trim() === '' || second.trim() === '' || Number.isNaN(a) || Number.isNaN(b)) return '';

    const value = mode === 'percent-of' ? percentOf(a, b)
      : mode === 'what-percent' ? whatPercent(a, b)
      : percentChange(a, b);

    return Number.isFinite(value) ? trimTrailingZeros(value) : '';
  }, [mode, first, second]);

  return (
    <ToolLayout
      title="Percentage Calculator"
      description="Calculate percentages, percent-of values, and percentage change."
      outputValue={result}
      onClear={() => { setFirst(''); setSecond(''); }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-2">
          <label htmlFor="percentage-mode" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 shrink-0">
            Mode
          </label>
          <select
            id="percentage-mode"
            aria-label="Mode"
            value={mode}
            onChange={e => setMode(e.target.value as PercentageMode)}
            className={selectClass}
          >
            {MODES.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        <Panel label={activeMode.template(first, second)} className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <label htmlFor="percentage-first" className="w-28 text-xs text-neutral-500 shrink-0">{activeMode.firstLabel}</label>
              <input
                id="percentage-first"
                aria-label="First value"
                type="number"
                value={first}
                onChange={e => setFirst(e.target.value)}
                placeholder="0"
                className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="percentage-second" className="w-28 text-xs text-neutral-500 shrink-0">{activeMode.secondLabel}</label>
              <input
                id="percentage-second"
                aria-label="Second value"
                type="number"
                value={second}
                onChange={e => setSecond(e.target.value)}
                placeholder="0"
                className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="percentage-result" className="w-28 text-xs text-neutral-500 shrink-0">Result</label>
              <input
                id="percentage-result"
                aria-label="Result"
                type="text"
                value={result}
                readOnly
                placeholder="—"
                className="flex-1 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 placeholder-neutral-800 outline-none"
              />
            </div>
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}

function trimTrailingZeros(n: number): string {
  return n.toFixed(6).replace(/\.?0+$/, '');
}
