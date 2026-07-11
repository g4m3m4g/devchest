import { useState, useCallback } from 'react';
import { RefreshCw, Copy, Check, Trash2 } from 'lucide-react';
import { generateNanoId, DEFAULT_ALPHABET, DEFAULT_SIZE } from '../../../lib/nanoid';
import ToolLayout from '../../layout/ToolLayout';

export default function NanoIdGenerator() {
  const [quantity, setQuantity] = useState(5);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [alphabet, setAlphabet] = useState(DEFAULT_ALPHABET);
  const [ids, setIds] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generate = useCallback(() => {
    setIds(Array.from({ length: Math.min(quantity, 100) }, () => generateNanoId(size, alphabet || DEFAULT_ALPHABET)));
  }, [quantity, size, alphabet]);

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
    if (!ids.length) return;
    try {
      await navigator.clipboard.writeText(ids.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      // unavailable
    }
  };

  return (
    <ToolLayout
      title="Nano ID Generator"
      description="Generate bulk Nano IDs with configurable size and alphabet — compact, URL-safe, cryptographically random."
      outputValue={ids.join('\n')}
      onClear={() => setIds([])}
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
            <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Size</label>
            <input
              type="number"
              min={2}
              max={128}
              value={size}
              onChange={e => setSize(Math.max(2, Math.min(128, Number(e.target.value))))}
              className="w-16 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40 text-center"
            />
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[12rem]">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 shrink-0">Alphabet</label>
            <input
              type="text"
              value={alphabet}
              onChange={e => setAlphabet(e.target.value)}
              spellCheck={false}
              className="flex-1 min-w-0 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {ids.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setIds([])}
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
          {ids.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-neutral-700">Click Generate to produce Nano IDs</p>
                <p className="text-[10px] text-neutral-800 mt-1">cryptographically random</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {ids.map((id, i) => (
                <li key={i} className="group flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.03] transition-all">
                  <span className="text-[10px] text-neutral-800 font-mono w-5 shrink-0 text-right select-none">{i + 1}</span>
                  <span className="flex-1 font-mono text-sm text-neutral-300 select-all break-all">{id}</span>
                  <button
                    type="button"
                    onClick={() => copyOne(i, id)}
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
