import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { computeHmac, HMAC_ALGORITHMS } from '../../../lib/hmac';
import type { OutputEncoding } from '../../../lib/hmac';
import ToolLayout from '../../layout/ToolLayout';

export default function HmacGenerator() {
  const [key, setKey] = useState('');
  const [message, setMessage] = useState('');
  const [encoding, setEncoding] = useState<OutputEncoding>('hex');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const hmacs = useMemo(() =>
    HMAC_ALGORITHMS.map(alg => ({
      ...alg,
      hash: key ? computeHmac(message, key, alg.id, encoding) : '',
    })),
    [key, message, encoding]
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
      title="HMAC Generator"
      description="Compute HMAC-SHA256 and HMAC-SHA512 for a message using a secret key."
      outputValue={hmacs.find(h => h.id === 'SHA256')?.hash}
      onClear={() => {
        setKey('');
        setMessage('');
      }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 shrink-0">Key</span>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Secret key…"
              spellCheck={false}
              className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 font-mono text-xs text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
            />
            <select
              value={encoding}
              onChange={e => setEncoding(e.target.value as OutputEncoding)}
              className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500/40"
            >
              <option value="hex">Hex</option>
              <option value="base64">Base64</option>
            </select>
          </div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type or paste the message to sign…"
            rows={4}
            spellCheck={false}
            className="w-full resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {hmacs.map(({ id, label, bits, hash }) => (
            <div
              key={id}
              className="group flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 transition-all hover:border-white/10"
            >
              <div className="shrink-0 w-28">
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
      </div>
    </ToolLayout>
  );
}
