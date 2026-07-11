import { useState, useEffect } from 'react';
import { AlertCircle, Copy, Check } from 'lucide-react';
import { getSshFingerprint } from '../../../lib/sshFingerprint';
import type { SshFingerprint } from '../../../lib/sshFingerprint';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function SshFingerprintTool() {
  const [key, setKey] = useState('');
  const [result, setResult] = useState<SshFingerprint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'md5' | 'sha256' | null>(null);

  const isEmpty = !key.trim();

  useEffect(() => {
    if (!key.trim()) return;

    let cancelled = false;
    getSshFingerprint(key)
      .then(fingerprint => {
        if (!cancelled) {
          setResult(fingerprint);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult(null);
          setError('Invalid SSH public key — unable to parse key data');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const copy = async (which: 'md5' | 'sha256', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // unavailable
    }
  };

  return (
    <ToolLayout
      title="SSH Key Fingerprint"
      description="Compute the MD5 and SHA256 fingerprints of an OpenSSH public key, client-side."
      onClear={() => setKey('')}
      onPaste={text => setKey(text)}
    >
      <div className="flex flex-col gap-4 h-full min-h-0">
        <Panel label="SSH Public Key" className="shrink-0">
          <textarea
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQAB... user@host"
            spellCheck={false}
            rows={4}
            className="w-full resize-none bg-transparent px-4 py-3 font-mono text-xs text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        {!isEmpty && error && (
          <div className="shrink-0 flex items-center gap-2.5 px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {(isEmpty || (!result && !error)) && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 flex items-center justify-center">
            <p className="text-sm text-neutral-700">Paste an SSH public key to compute its fingerprint</p>
          </div>
        )}

        {!isEmpty && result && (
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
            <Panel label="Key Details">
              <div className="px-4 py-3 flex flex-col gap-2">
                {([
                  ['Type', result.keyType],
                  ['Bit Length', result.bits ? `${result.bits} bits` : '—'],
                  ['Comment', result.comment || '—'],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex items-baseline gap-2">
                    <span className="text-[10px] text-neutral-700 w-24 shrink-0">{label}</span>
                    <span className="font-mono text-xs text-neutral-300 break-all">{value}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel label="Fingerprints">
              <div className="px-4 py-3 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-neutral-700">SHA256</span>
                    <p className="font-mono text-sm text-neutral-200 break-all select-all">{result.sha256}</p>
                  </div>
                  <button
                    type="button"
                    title="Copy SHA256 fingerprint"
                    onClick={() => copy('sha256', result.sha256)}
                    className={[
                      'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all border',
                      copied === 'sha256'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 border-white/5 text-neutral-600 hover:text-neutral-300',
                    ].join(' ')}
                  >
                    {copied === 'sha256' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-neutral-700">MD5</span>
                    <p className="font-mono text-sm text-neutral-200 break-all select-all">{result.md5}</p>
                  </div>
                  <button
                    type="button"
                    title="Copy MD5 fingerprint"
                    onClick={() => copy('md5', result.md5)}
                    className={[
                      'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all border',
                      copied === 'md5'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 border-white/5 text-neutral-600 hover:text-neutral-300',
                    ].join(' ')}
                  >
                    {copied === 'md5' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
