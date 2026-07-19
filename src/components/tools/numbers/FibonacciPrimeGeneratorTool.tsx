import { useState, useMemo } from 'react';
import { fibonacciSequence, primesUpTo } from '../../../lib/fibonacciPrime';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const inputClass = 'flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40';
const outputClass = 'flex-1 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 outline-none min-h-[3rem] whitespace-pre-wrap break-words';

type Mode = 'fibonacci' | 'prime';

export default function FibonacciPrimeGeneratorTool() {
  const [mode, setMode] = useState<Mode>('fibonacci');
  const [count, setCount] = useState('10');
  const [limit, setLimit] = useState('50');

  const result = useMemo(() => {
    try {
      if (mode === 'fibonacci') {
        if (count.trim() === '') return { value: '', error: null };
        return { value: fibonacciSequence(Number(count)).join(', '), error: null };
      }
      if (limit.trim() === '') return { value: '', error: null };
      return { value: primesUpTo(Number(limit)).join(', '), error: null };
    } catch (err) {
      return { value: '', error: (err as Error).message };
    }
  }, [mode, count, limit]);

  return (
    <ToolLayout
      title="Fibonacci / Prime Sequence Generator"
      description="Generate the first N Fibonacci numbers, or list primes up to a limit."
      outputValue={result.value}
      onClear={() => { setCount(''); setLimit(''); }}
    >
      <div className="flex flex-col gap-4 h-full">
        <Panel label="Input" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Mode">
              <button
                type="button"
                aria-label="Fibonacci"
                onClick={() => setMode('fibonacci')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mode === 'fibonacci' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/[0.04] border-white/5 text-neutral-500 hover:text-neutral-300'}`}
              >
                Fibonacci
              </button>
              <button
                type="button"
                aria-label="Prime"
                onClick={() => setMode('prime')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mode === 'prime' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/[0.04] border-white/5 text-neutral-500 hover:text-neutral-300'}`}
              >
                Prime
              </button>
            </div>

            {mode === 'fibonacci' ? (
              <div className="flex items-center gap-2">
                <label htmlFor="fib-count" className="w-32 text-xs text-neutral-500 shrink-0">Count</label>
                <input
                  id="fib-count"
                  aria-label="Count"
                  type="text"
                  value={count}
                  onChange={e => setCount(e.target.value)}
                  placeholder="10"
                  className={inputClass}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <label htmlFor="prime-limit" className="w-32 text-xs text-neutral-500 shrink-0">Limit</label>
                <input
                  id="prime-limit"
                  aria-label="Limit"
                  type="text"
                  value={limit}
                  onChange={e => setLimit(e.target.value)}
                  placeholder="50"
                  className={inputClass}
                />
              </div>
            )}
          </div>
        </Panel>

        <Panel label="Result" className="flex-1 min-h-0">
          <div className="flex flex-col gap-3 px-4 py-4 flex-1">
            <div className={outputClass}>{result.value}</div>
          </div>
        </Panel>

        {result.error && (
          <p className="shrink-0 text-xs text-red-400 px-1">{result.error}</p>
        )}
      </div>
    </ToolLayout>
  );
}
