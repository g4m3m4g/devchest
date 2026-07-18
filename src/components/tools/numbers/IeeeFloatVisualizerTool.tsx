import { useState, useMemo } from 'react';
import { analyzeFloat } from '../../../lib/ieee754';
import type { FloatPrecision } from '../../../lib/ieee754';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const selectClass = 'flex-1 bg-white/5 border border-white/5 text-neutral-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/40';
const inputClass = 'flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40';
const bitClass = 'flex-1 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 font-mono text-xs text-neutral-300 break-all';

export default function IeeeFloatVisualizerTool() {
  const [value, setValue] = useState('1');
  const [precision, setPrecision] = useState<FloatPrecision>('single');

  const breakdown = useMemo(() => {
    const n = Number(value);
    if (value.trim() === '' || Number.isNaN(n)) {
      return value.trim().toLowerCase() === 'nan' ? analyzeFloat(NaN, precision) : null;
    }
    return analyzeFloat(n, precision);
  }, [value, precision]);

  return (
    <ToolLayout
      title="IEEE 754 Float Visualizer"
      description="Break a floating-point number down into its sign, exponent, and mantissa bits."
      outputValue={breakdown ? breakdown.hex : ''}
      onClear={() => setValue('')}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-2">
          <label htmlFor="ieee-value" className="w-20 text-xs text-neutral-500 shrink-0">Value</label>
          <input
            id="ieee-value"
            aria-label="Value"
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
          <label htmlFor="ieee-precision" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 shrink-0">
            Precision
          </label>
          <select
            id="ieee-precision"
            aria-label="Precision"
            value={precision}
            onChange={e => setPrecision(e.target.value as FloatPrecision)}
            className={selectClass}
          >
            <option value="single">Single (32-bit)</option>
            <option value="double">Double (64-bit)</option>
          </select>
        </div>

        <Panel label="Bit Breakdown" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <span className="w-32 text-xs text-neutral-500 shrink-0">Sign</span>
              <p aria-label="Sign bit" className={bitClass}>
                {breakdown ? breakdown.sign : <span className="text-neutral-800">—</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-32 text-xs text-neutral-500 shrink-0">Exponent</span>
              <p aria-label="Exponent bits" className={bitClass}>
                {breakdown ? breakdown.exponentBits : <span className="text-neutral-800">—</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-32 text-xs text-neutral-500 shrink-0">Mantissa</span>
              <p aria-label="Mantissa bits" className={bitClass}>
                {breakdown ? breakdown.mantissaBits : <span className="text-neutral-800">—</span>}
              </p>
            </div>
          </div>
        </Panel>

        <Panel label="Decoded" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <span className="w-32 text-xs text-neutral-500 shrink-0">Hex</span>
              <p aria-label="Hex" className="flex-1 font-mono text-sm text-emerald-400 break-all">
                {breakdown ? breakdown.hex : <span className="text-neutral-800">—</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-32 text-xs text-neutral-500 shrink-0">Biased exponent</span>
              <p className="flex-1 font-mono text-xs text-neutral-400">
                {breakdown ? breakdown.biasedExponent : <span className="text-neutral-800">—</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-32 text-xs text-neutral-500 shrink-0">Unbiased exponent</span>
              <p className="flex-1 font-mono text-xs text-neutral-400">
                {breakdown ? breakdown.unbiasedExponent : <span className="text-neutral-800">—</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-32 text-xs text-neutral-500 shrink-0">Reconstructed value</span>
              <p aria-label="Reconstructed value" className="flex-1 font-mono text-xs text-neutral-400">
                {breakdown ? String(breakdown.reconstructedValue) : <span className="text-neutral-800">—</span>}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
