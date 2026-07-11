import { useState } from 'react';
import { Copy, Check, Lock, ShieldQuestion } from 'lucide-react';
import { hashPassword, verifyPassword, isValidArgon2Hash } from '../../../lib/argon2';
import type { Argon2Variant } from '../../../lib/argon2';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function Argon2Tool() {
  const [hashPw, setHashPw] = useState('');
  const [variant, setVariant] = useState<Argon2Variant>('argon2id');
  const [timeCost, setTimeCost] = useState(2);
  const [memoryCost, setMemoryCost] = useState(4096);
  const [parallelism, setParallelism] = useState(1);
  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);

  const [verifyPw, setVerifyPw] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<'match' | 'no-match' | 'invalid' | null>(null);

  const doHash = () => {
    if (!hashPw) return;
    setHash(hashPassword(hashPw, { variant, timeCost, memoryCost, parallelism }));
  };

  const doVerify = () => {
    if (!isValidArgon2Hash(verifyHash)) {
      setVerifyResult('invalid');
      return;
    }
    setVerifyResult(verifyPassword(verifyPw, verifyHash) ? 'match' : 'no-match');
  };

  const copyHash = async () => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // unavailable
    }
  };

  return (
    <ToolLayout
      title="Argon2 Hash & Verify"
      description="Hash passwords with Argon2 (RFC 9106) at configurable cost parameters, and verify a password against an existing hash."
      outputValue={hash}
      onClear={() => {
        setHashPw('');
        setHash('');
        setVerifyPw('');
        setVerifyHash('');
        setVerifyResult(null);
      }}
    >
      <div className="grid grid-cols-2 gap-4 h-full min-h-0">
        <div className="flex flex-col gap-3 min-h-0">
          <Panel label="Hash">
            <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
              <input
                type="text"
                value={hashPw}
                onChange={e => setHashPw(e.target.value)}
                placeholder="Password to hash…"
                spellCheck={false}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 font-mono text-sm text-neutral-200 placeholder-neutral-800 outline-none focus:border-blue-500/40 transition-all"
              />

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="argon2-variant" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Variant</label>
                  <select
                    id="argon2-variant"
                    value={variant}
                    onChange={e => setVariant(e.target.value as Argon2Variant)}
                    className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500/40"
                  >
                    <option value="argon2id">Argon2id</option>
                    <option value="argon2i">Argon2i</option>
                    <option value="argon2d">Argon2d</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <label htmlFor="argon2-time" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Time</label>
                  <input
                    id="argon2-time"
                    type="number"
                    min={1}
                    max={10}
                    value={timeCost}
                    onChange={e => setTimeCost(Math.max(1, Math.min(10, Number(e.target.value))))}
                    className="w-14 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40 text-center"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <label htmlFor="argon2-memory" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Memory (KiB)</label>
                  <input
                    id="argon2-memory"
                    type="number"
                    min={8}
                    max={65536}
                    value={memoryCost}
                    onChange={e => setMemoryCost(Math.max(8, Math.min(65536, Number(e.target.value))))}
                    className="w-20 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40 text-center"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <label htmlFor="argon2-parallelism" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Parallelism</label>
                  <input
                    id="argon2-parallelism"
                    type="number"
                    min={1}
                    max={8}
                    value={parallelism}
                    onChange={e => setParallelism(Math.max(1, Math.min(8, Number(e.target.value))))}
                    className="w-14 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40 text-center"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={doHash}
                disabled={!hashPw}
                className="self-start flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-neutral-700 disabled:cursor-not-allowed text-white transition-all"
              >
                <Lock className="w-3 h-3" />Hash
              </button>
            </div>

            <div className="px-4 pb-4 flex-1 min-h-0">
              {!hash ? (
                <p className="text-xs text-neutral-700 mt-2">Click Hash to produce an Argon2 hash</p>
              ) : (
                <div className="flex items-start gap-2 mt-2 bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5">
                  <p data-testid="argon2-hash" className="flex-1 font-mono text-xs text-neutral-300 break-all select-all">
                    {hash}
                  </p>
                  <button
                    type="button"
                    onClick={copyHash}
                    className={[
                      'shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all border',
                      copied
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 border-white/5 text-neutral-600 hover:text-neutral-300',
                    ].join(' ')}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-3 min-h-0">
          <Panel label="Verify">
            <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
              <input
                type="text"
                value={verifyPw}
                onChange={e => setVerifyPw(e.target.value)}
                placeholder="Password to verify…"
                spellCheck={false}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 font-mono text-sm text-neutral-200 placeholder-neutral-800 outline-none focus:border-blue-500/40 transition-all"
              />
              <input
                type="text"
                value={verifyHash}
                onChange={e => setVerifyHash(e.target.value)}
                placeholder="Argon2 hash to check against…"
                spellCheck={false}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 font-mono text-xs text-neutral-200 placeholder-neutral-800 outline-none focus:border-blue-500/40 transition-all"
              />
              <button
                type="button"
                onClick={doVerify}
                disabled={!verifyPw || !verifyHash}
                className="self-start flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-neutral-700 disabled:cursor-not-allowed text-white transition-all"
              >
                <ShieldQuestion className="w-3 h-3" />Verify
              </button>
            </div>

            <div className="px-4 pb-4">
              {verifyResult === 'match' && (
                <p className="text-sm font-medium text-emerald-400 mt-2">✓ Match — password is correct</p>
              )}
              {verifyResult === 'no-match' && (
                <p className="text-sm font-medium text-red-400 mt-2">✗ No match — password is incorrect</p>
              )}
              {verifyResult === 'invalid' && (
                <p className="text-sm font-medium text-amber-400 mt-2">Invalid Argon2 hash format</p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
