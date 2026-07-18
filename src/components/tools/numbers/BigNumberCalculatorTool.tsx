import { useState, useMemo } from 'react';
import { bigNumberOp, BIG_NUMBER_OPS } from '../../../lib/bigNumberCalculator';
import type { BigNumberOp } from '../../../lib/bigNumberCalculator';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const selectClass = 'flex-1 bg-white/5 border border-white/5 text-neutral-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/40';
const inputClass = 'flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40';

const OP_LABELS: Record<BigNumberOp, string> = {
  ADD: 'Add (+)',
  SUBTRACT: 'Subtract (−)',
  MULTIPLY: 'Multiply (×)',
  DIVIDE: 'Divide (÷, truncated)',
  MODULO: 'Modulo (%)',
  POWER: 'Power (^)',
};

function parseOperand(value: string): bigint | null {
  if (value.trim() === '' || !/^-?\d+$/.test(value.trim())) return null;
  try {
    return BigInt(value.trim());
  } catch {
    return null;
  }
}

export default function BigNumberCalculatorTool() {
  const [op, setOp] = useState<BigNumberOp>('ADD');
  const [first, setFirst] = useState('999999999999999999');
  const [second, setSecond] = useState('1');

  const result = useMemo(() => {
    const a = parseOperand(first);
    const b = parseOperand(second);
    if (a === null || b === null) return { value: null, error: null };
    try {
      return { value: bigNumberOp(a, b, op), error: null };
    } catch (err) {
      return { value: null, error: (err as Error).message };
    }
  }, [first, second, op]);

  const resultStr = result.value === null ? '' : result.value.toString();

  return (
    <ToolLayout
      title="Big Number Calculator"
      description="Exact arbitrary-precision integer arithmetic — no floating-point rounding."
      outputValue={resultStr}
      onClear={() => { setFirst(''); setSecond(''); }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-2">
          <label htmlFor="bignum-op" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 shrink-0">
            Operation
          </label>
          <select
            id="bignum-op"
            aria-label="Operation"
            value={op}
            onChange={e => setOp(e.target.value as BigNumberOp)}
            className={selectClass}
          >
            {BIG_NUMBER_OPS.map(o => (
              <option key={o} value={o}>{OP_LABELS[o]}</option>
            ))}
          </select>
        </div>

        <Panel label="Operands" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <label htmlFor="bignum-first" className="w-32 text-xs text-neutral-500 shrink-0">First number</label>
              <input
                id="bignum-first"
                aria-label="First number"
                type="text"
                value={first}
                onChange={e => setFirst(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="bignum-second" className="w-32 text-xs text-neutral-500 shrink-0">Second number</label>
              <input
                id="bignum-second"
                aria-label="Second number"
                type="text"
                value={second}
                onChange={e => setSecond(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>
        </Panel>

        <Panel label="Result" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <label htmlFor="bignum-result" className="w-32 text-xs text-neutral-500 shrink-0">Result</label>
              <input
                id="bignum-result"
                aria-label="Result"
                type="text"
                value={resultStr}
                readOnly
                placeholder="—"
                className="flex-1 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 placeholder-neutral-800 outline-none break-all"
              />
            </div>
          </div>
        </Panel>

        {result.error && (
          <p className="shrink-0 text-xs text-red-400 px-1">{result.error}</p>
        )}
      </div>
    </ToolLayout>
  );
}
