import { useState, useCallback } from 'react';
import { RefreshCw, Copy, Check, Trash2 } from 'lucide-react';
import { formatUuid, DELIMITER_OPTIONS } from '../../../lib/uuid';
import type { Delimiter } from '../../../lib/uuid';
import ToolLayout from '../../layout/ToolLayout';

export default function UuidGenerator() {
  const [quantity, setQuantity] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [delimiter, setDelimiter] = useState<Delimiter>('hyphen');
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generate = useCallback(() => {
    setUuids(Array.from({ length: Math.min(quantity, 100) }, () =>
      formatUuid(crypto.randomUUID(), delimiter, uppercase)
    ));
  }, [quantity, delimiter, uppercase]);

  const copyOne = async (i: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(i);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch {
      // unavailable
    }
  };

  const copyAll = async () => {
    if (!uuids.length) return;
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      // unavailable
    }
  };

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate bulk v4 UUIDs with controls for quantity, case, and delimiter format."
      outputValue={uuids.join('\n')}
      onClear={() => setUuids([])}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Count</label>
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-16 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40 text-center"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Format</label>
            <select
              value={delimiter}
              onChange={e => setDelimiter(e.target.value as Delimiter)}
              className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500/40"
            >
              {DELIMITER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={e => setUppercase(e.target.checked)}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Uppercase</span>
          </label>

          <div className="flex items-center gap-2 ml-auto">
            {uuids.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setUuids([])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/5 text-neutral-600 hover:text-neutral-400 hover:bg-white/[0.08] transition-all"
                >
                  <Trash2 className="w-3 h-3" />Clear
                </button>
                <button
                  type="button"
                  onClick={copyAll}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    copiedAll
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-white/[0.04] border-white/5 text-neutral-500 hover:bg-white/[0.08] hover:text-neutral-300',
                  ].join(' ')}
                >
                  {copiedAll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedAll ? 'Copied!' : 'Copy All'}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={generate}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all"
            >
              <RefreshCw className="w-3 h-3" />Generate
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5">
          {uuids.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-neutral-700">Click Generate to produce UUIDs</p>
                <p className="text-[10px] text-neutral-800 mt-1">v4 · cryptographically random</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {uuids.map((uuid, i) => (
                <li key={i} className="group flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.03] transition-all">
                  <span className="text-[10px] text-neutral-800 font-mono w-5 shrink-0 text-right select-none">{i + 1}</span>
                  <span className="flex-1 font-mono text-sm text-neutral-300 select-all">{uuid}</span>
                  <button
                    type="button"
                    onClick={() => copyOne(i, uuid)}
                    className={[
                      'shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all border opacity-0 group-hover:opacity-100',
                      copiedIndex === i
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 opacity-100'
                        : 'bg-white/5 border-white/5 text-neutral-600 hover:text-neutral-300',
                    ].join(' ')}
                  >
                    {copiedIndex === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
