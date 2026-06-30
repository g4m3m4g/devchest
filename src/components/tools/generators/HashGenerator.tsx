import { useState, useMemo } from 'react';
import CryptoJS from 'crypto-js';
import { Copy, Check } from 'lucide-react';
import ToolLayout from '../../layout/ToolLayout';

const ALGORITHMS = [
  { id: 'MD5',    label: 'MD5',    bits: 128, fn: (s: string) => CryptoJS.MD5(s).toString() },
  { id: 'SHA1',   label: 'SHA-1',  bits: 160, fn: (s: string) => CryptoJS.SHA1(s).toString() },
  { id: 'SHA256', label: 'SHA-256',bits: 256, fn: (s: string) => CryptoJS.SHA256(s).toString() },
  { id: 'SHA512', label: 'SHA-512',bits: 512, fn: (s: string) => CryptoJS.SHA512(s).toString() },
] as const;

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [uppercase, setUppercase] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const hashes = useMemo(() =>
    ALGORITHMS.map(alg => ({
      ...alg,
      hash: input
        ? uppercase
          ? alg.fn(input).toUpperCase()
          : alg.fn(input)
        : '',
    })),
    [input, uppercase]
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
      title="Hash Generator"
      description="Compute MD5, SHA-1, SHA-256, and SHA-512 hashes simultaneously from a single input."
      outputValue={hashes.find(h => h.id === 'SHA256')?.hash}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        {/* Input */}
        <div className="shrink-0 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Input</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={e => setUppercase(e.target.checked)}
                className="w-3 h-3 accent-blue-500 rounded"
              />
              <span className="text-[10px] text-neutral-500 font-medium">Uppercase</span>
            </label>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type or paste text to hash…"
            rows={4}
            spellCheck={false}
            className="w-full resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </div>

        {/* Hash outputs */}
        <div className="flex flex-col gap-3 flex-1">
          {hashes.map(({ id, label, bits, hash }) => (
            <div
              key={id}
              className="group flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 transition-all hover:border-white/10"
            >
              <div className="shrink-0 w-20">
                <p className="text-[10px] font-semibold text-white">{label}</p>
                <p className="text-[9px] text-neutral-700 mt-0.5">{bits}-bit</p>
              </div>
              <p className="flex-1 font-mono text-xs text-neutral-400 break-all leading-relaxed min-w-0">
                {hash || <span className="text-neutral-800">—</span>}
              </p>
              <button
                type="button"
                onClick={() => hash && handleCopy(id, hash)}
                disabled={!hash}
                className={[
                  'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all border',
                  copiedId === id
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 border-white/5 text-neutral-700 opacity-0 group-hover:opacity-100 hover:border-white/10 hover:text-neutral-400',
                  !hash ? 'cursor-default' : 'cursor-pointer',
                ].join(' ')}
              >
                {copiedId === id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          ))}
        </div>

        {input && (
          <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
            <span className="text-[10px] text-neutral-700">Input size:</span>
            <span className="text-[10px] font-mono text-neutral-500">{input.length} chars</span>
            <span className="text-[10px] text-neutral-700 ml-2">UTF-8 bytes:</span>
            <span className="text-[10px] font-mono text-neutral-500">{new TextEncoder().encode(input).length}</span>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
