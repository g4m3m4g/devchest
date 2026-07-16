import { useState, useMemo } from 'react';
import { bitwiseOp, toBinaryString, BITWISE_OPS } from '../../../lib/bitwiseCalculator';
import type { BitwiseOp } from '../../../lib/bitwiseCalculator';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const selectClass = 'flex-1 bg-white/5 border border-white/5 text-neutral-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/40';
const inputClass = 'flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40 disabled:opacity-40 disabled:cursor-not-allowed';

const OP_LABELS: Record<BitwiseOp, string> = {
  AND: 'AND (&)',
  OR: 'OR (|)',
  XOR: 'XOR (^)',
  NOT: 'NOT (~)',
  LSHIFT: 'Left Shift (<<)',
  RSHIFT: 'Right Shift (>>)',
};

function parseOperand(value: string): bigint | null {
  if (value.trim() === '' || !/^-?\d+$/.test(value.trim())) return null;
  try {
    return BigInt(value.trim());
  } catch {
    return null;
  }
}

export default function BitwiseCalculatorTool() {
  const [op, setOp] = useState<BitwiseOp>('AND');
  const [first, setFirst] = useState('12');
  const [second, setSecond] = useState('10');

  const needsSecond = op !== 'NOT';

  const result = useMemo(() => {
    const a = parseOperand(first);
    const b = needsSecond ? parseOperand(second) : 0n;
    if (a === null || b === null) return null;
    if ((op === 'LSHIFT' || op === 'RSHIFT') && b < 0n) return null;
    try {
      return bitwiseOp(a, b, op);
    } catch {
      return null;
    }
  }, [first, second, op, needsSecond]);

  const resultStr = result === null ? '' : result.toString();
  const binaryStr = result === null ? '' : toBinaryString(result);

  return (
    <ToolLayout
      title="Bitwise Calculator"
      description="Compute AND, OR, XOR, NOT, and bit shifts with a binary result view."
      outputValue={resultStr}
      onClear={() => { setFirst(''); setSecond(''); }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-2">
          <label htmlFor="bitwise-op" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 shrink-0">
            Operation
          </label>
          <select
            id="bitwise-op"
            aria-label="Operation"
            value={op}
            onChange={e => setOp(e.target.value as BitwiseOp)}
            className={selectClass}
          >
            {BITWISE_OPS.map(o => (
              <option key={o} value={o}>{OP_LABELS[o]}</option>
            ))}
          </select>
        </div>

        <Panel label="Operands" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <label htmlFor="bitwise-first" className="w-32 text-xs text-neutral-500 shrink-0">First operand</label>
              <input
                id="bitwise-first"
                aria-label="First operand"
                type="number"
                value={first}
                onChange={e => setFirst(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="bitwise-second" className="w-32 text-xs text-neutral-500 shrink-0">Second operand</label>
              <input
                id="bitwise-second"
                aria-label="Second operand"
                type="number"
                value={second}
                onChange={e => setSecond(e.target.value)}
                placeholder="0"
                disabled={!needsSecond}
                className={inputClass}
              />
            </div>
          </div>
        </Panel>

        <Panel label="Result" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <label htmlFor="bitwise-result" className="w-32 text-xs text-neutral-500 shrink-0">Decimal</label>
              <input
                id="bitwise-result"
                aria-label="Result"
                type="text"
                value={resultStr}
                readOnly
                placeholder="—"
                className="flex-1 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 placeholder-neutral-800 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-32 text-xs text-neutral-500 shrink-0">Binary</span>
              <p aria-label="Result binary" className="flex-1 font-mono text-xs text-neutral-400 break-all">
                {binaryStr || <span className="text-neutral-800">—</span>}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
