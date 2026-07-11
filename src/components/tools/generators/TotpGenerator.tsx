import { useState, useEffect, useMemo } from 'react';
import { Shuffle } from 'lucide-react';
import { generateTotp, getRemainingSeconds, generateSecret } from '../../../lib/totp';
import type { TotpAlgorithm } from '../../../lib/totp';
import ToolLayout from '../../layout/ToolLayout';

export default function TotpGenerator() {
  const [secret, setSecret] = useState('');
  const [digits, setDigits] = useState(6);
  const [period, setPeriod] = useState(30);
  const [algorithm, setAlgorithm] = useState<TotpAlgorithm>('SHA1');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const result = useMemo(() => {
    if (!secret.trim()) return null;
    try {
      return { code: generateTotp(secret, { digits, period, algorithm, timestamp: now }), error: null };
    } catch {
      return { code: null, error: 'Invalid secret — must be a Base32 string' };
    }
  }, [secret, digits, period, algorithm, now]);

  const remaining = getRemainingSeconds(period, now);
  const groupedCode = result?.code ? result.code.match(/.{1,3}/g)?.join(' ') : null;

  return (
    <ToolLayout
      title="TOTP / 2FA Code Generator"
      description="Generate time-based one-time passcodes (RFC 6238) from a Base32 secret, with a live countdown."
      outputValue={result?.code ?? ''}
      onClear={() => setSecret('')}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          <input
            type="text"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="Base32 secret…"
            spellCheck={false}
            className="flex-1 min-w-[12rem] bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 font-mono text-xs text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
          />

          <div className="flex items-center gap-2">
            <label htmlFor="totp-digits" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Digits</label>
            <select
              id="totp-digits"
              value={digits}
              onChange={e => setDigits(Number(e.target.value))}
              className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500/40"
            >
              <option value={6}>6</option>
              <option value={8}>8</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="totp-period" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Period</label>
            <input
              id="totp-period"
              type="number"
              min={15}
              max={120}
              value={period}
              onChange={e => setPeriod(Math.max(15, Math.min(120, Number(e.target.value))))}
              className="w-16 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40 text-center"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="totp-algorithm" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Algorithm</label>
            <select
              id="totp-algorithm"
              value={algorithm}
              onChange={e => setAlgorithm(e.target.value as TotpAlgorithm)}
              className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500/40"
            >
              <option value="SHA1">SHA-1</option>
              <option value="SHA256">SHA-256</option>
              <option value="SHA512">SHA-512</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSecret(generateSecret())}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/10 border border-blue-600/20 text-blue-400 hover:bg-blue-600/20 transition-all"
          >
            <Shuffle className="w-3 h-3" />Generate Secret
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5">
          {!result ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-neutral-700">Enter a secret to generate a code</p>
                <p className="text-[10px] text-neutral-800 mt-1">RFC 6238 · TOTP</p>
              </div>
            </div>
          ) : result.error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-red-400">{result.error}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-6 py-8">
              <span data-testid="totp-code" className="font-mono text-4xl tracking-widest text-neutral-100 select-all">
                {groupedCode}
              </span>

              <div className="w-full max-w-sm flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-medium">
                  <span className="text-neutral-500">Refreshes in</span>
                  <span className="text-blue-400">{remaining}s</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${(remaining / period) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
