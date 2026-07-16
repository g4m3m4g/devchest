import { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { COMMON_CURRENCIES, convertCurrency, fetchRates } from '../../../lib/currencyConverter';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const selectClass = 'flex-1 bg-white/5 border border-white/5 text-neutral-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/40';

export default function CurrencyConverterTool() {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1');
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRates = useCallback((base: string) => {
    setLoading(true);
    setError(null);
    fetchRates(base)
      .then(r => setRates(r))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadRates(baseCurrency);
  }, [baseCurrency, loadRates]);

  const result = useMemo(() => {
    if (!rates || amount.trim() === '' || Number.isNaN(Number(amount))) return '';
    const rate = rates[toCurrency];
    if (rate === undefined) return '';
    return trimTrailingZeros(convertCurrency(Number(amount), rate));
  }, [rates, amount, toCurrency]);

  return (
    <ToolLayout
      title="Currency Converter"
      description="Convert between world currencies using live exchange rates."
      outputValue={result}
      onClear={() => setAmount('')}
    >
      <div className="flex flex-col gap-4 h-full">
        {loading && (
          <div className="shrink-0 flex items-center gap-2 text-xs text-neutral-500 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-4 py-3">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <span>Loading exchange rates…</span>
          </div>
        )}

        {error && (
          <div className="shrink-0 flex items-center justify-between gap-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => loadRates(baseCurrency)}
              className="shrink-0 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        <Panel label="Convert" className="shrink-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <label htmlFor="currency-amount" className="sr-only">Amount</label>
              <input
                id="currency-amount"
                aria-label="Amount"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter an amount…"
                className="w-40 bg-white/5 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
              />
              <select
                aria-label="From currency"
                value={baseCurrency}
                onChange={e => setBaseCurrency(e.target.value)}
                className={selectClass}
              >
                {COMMON_CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="currency-result" className="sr-only">Result</label>
              <input
                id="currency-result"
                aria-label="Result"
                type="text"
                value={result}
                readOnly
                placeholder="—"
                className="w-40 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 placeholder-neutral-800 outline-none"
              />
              <select
                aria-label="To currency"
                value={toCurrency}
                onChange={e => setToCurrency(e.target.value)}
                className={selectClass}
              >
                {COMMON_CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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
