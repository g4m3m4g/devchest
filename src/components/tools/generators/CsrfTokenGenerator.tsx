import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { generateCsrfToken, calculateEntropyBits, buildHiddenInputSnippet, buildHeaderSnippet } from '../../../lib/csrfToken';
import type { CsrfEncoding } from '../../../lib/csrfToken';
import ToolLayout from '../../layout/ToolLayout';

const ENCODING_OPTIONS: { value: CsrfEncoding; label: string }[] = [
  { value: 'base64url', label: 'Base64url' },
  { value: 'base64', label: 'Base64' },
  { value: 'hex', label: 'Hex' },
  { value: 'alphanumeric', label: 'Alphanumeric' },
];

export default function CsrfTokenGenerator() {
  const [byteLength, setByteLength] = useState(32);
  const [encoding, setEncoding] = useState<CsrfEncoding>('base64url');
  const [token, setToken] = useState('');

  const generate = useCallback(() => {
    setToken(generateCsrfToken({ byteLength, encoding }));
  }, [byteLength, encoding]);

  const entropyBits = token ? calculateEntropyBits(byteLength) : 0;

  return (
    <ToolLayout
      title="CSRF Token Generator"
      description="Generate a cryptographically random CSRF token with configurable length and encoding."
      outputValue={token}
      onClear={() => setToken('')}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Bytes</label>
            <input
              type="number"
              min={16}
              max={128}
              value={byteLength}
              onChange={e => setByteLength(Math.max(16, Math.min(128, Number(e.target.value))))}
              className="w-16 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40 text-center"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Encoding</label>
            <select
              value={encoding}
              onChange={e => setEncoding(e.target.value as CsrfEncoding)}
              className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500/40"
            >
              {ENCODING_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
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
          {!token ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-neutral-700">Click Generate to produce a CSRF token</p>
                <p className="text-[10px] text-neutral-800 mt-1">cryptographically random</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 px-6 py-8">
              <div className="flex flex-col items-center gap-3">
                <span data-testid="csrf-token" className="font-mono text-lg text-neutral-200 select-all break-all text-center">
                  {token}
                </span>
                <span className="text-[10px] text-neutral-600">{entropyBits} bits of entropy</span>
              </div>

              <div className="flex flex-col gap-3 max-w-xl mx-auto w-full">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 mb-1.5">Hidden Form Field</p>
                  <p className="font-mono text-xs text-neutral-400 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 break-all select-all">
                    {buildHiddenInputSnippet(token)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 mb-1.5">HTTP Header</p>
                  <p className="font-mono text-xs text-neutral-400 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 break-all select-all">
                    {buildHeaderSnippet(token)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
