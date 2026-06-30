import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { CONVERSIONS } from '../../../lib/cases';
import ToolLayout from '../../layout/ToolLayout';

export default function CaseConverter() {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const results = useMemo(
    () => CONVERSIONS.map(c => ({ ...c, output: input ? c.convert(input) : '' })),
    [input]
  );

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // unavailable
    }
  };

  return (
    <ToolLayout
      title="Case Converter"
      description="Instantly transform text into every common casing format — click any result to copy it."
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5">
          <div className="px-4 py-2 border-b border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Input Text</span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type or paste your text here…"
            rows={3}
            className="w-full resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto">
          {results.map(({ id, label, sample, output }) => {
            const isCopied = copiedId === id;
            const display = output || sample;
            return (
              <button
                key={id}
                type="button"
                onClick={() => output && handleCopy(id, output)}
                disabled={!output}
                className={[
                  'group flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all',
                  output
                    ? 'bg-[#2c2c2e]/60 border-white/5 hover:bg-white/[0.07] hover:border-white/10 cursor-pointer'
                    : 'bg-white/[0.02] border-white/[0.03] cursor-default',
                ].join(' ')}
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 mb-1">{label}</p>
                  <p className={['font-mono text-sm truncate transition-colors', output ? 'text-neutral-200' : 'text-neutral-800'].join(' ')}>
                    {display}
                  </p>
                </div>
                <div className={[
                  'shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all',
                  isCopied
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-white/5 text-neutral-700 opacity-0 group-hover:opacity-100',
                ].join(' ')}>
                  {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
