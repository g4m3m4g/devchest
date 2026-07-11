import { useState } from 'react';
import { Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import { generateRsaKeyPair } from '../../../lib/rsaKeyPair';
import type { RsaAlgorithm, RsaHash, RsaModulusLength } from '../../../lib/rsaKeyPair';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function RsaKeyPairGenerator() {
  const [modulusLength, setModulusLength] = useState<RsaModulusLength>(2048);
  const [algorithm, setAlgorithm] = useState<RsaAlgorithm>('RSA-OAEP');
  const [hash, setHash] = useState<RsaHash>('SHA-256');
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<'public' | 'private' | null>(null);

  const generate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateRsaKeyPair({ modulusLength, algorithm, hash });
      setKeyPair(result);
    } finally {
      setIsGenerating(false);
    }
  };

  const copy = async (which: 'public' | 'private', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(which);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // unavailable
    }
  };

  return (
    <ToolLayout
      title="RSA Key Pair Generator"
      description="Generate an RSA public/private key pair in the browser using the WebCrypto API, exported as PEM."
      onClear={() => setKeyPair(null)}
    >
      <div className="flex flex-col gap-4 h-full min-h-0">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor="rsa-modulus" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Key Size</label>
            <select
              id="rsa-modulus"
              value={modulusLength}
              onChange={e => setModulusLength(Number(e.target.value) as RsaModulusLength)}
              className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500/40"
            >
              <option value={2048}>2048-bit</option>
              <option value={3072}>3072-bit</option>
              <option value={4096}>4096-bit</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="rsa-algorithm" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Usage</label>
            <select
              id="rsa-algorithm"
              value={algorithm}
              onChange={e => setAlgorithm(e.target.value as RsaAlgorithm)}
              className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500/40"
            >
              <option value="RSA-OAEP">RSA-OAEP (encrypt)</option>
              <option value="RSASSA-PKCS1-v1_5">RSASSA-PKCS1-v1_5 (sign)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="rsa-hash" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Hash</label>
            <select
              id="rsa-hash"
              value={hash}
              onChange={e => setHash(e.target.value as RsaHash)}
              className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500/40"
            >
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-384">SHA-384</option>
              <option value="SHA-512">SHA-512</option>
            </select>
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={isGenerating}
            className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-neutral-500 disabled:cursor-not-allowed text-white transition-all"
          >
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {isGenerating ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {!keyPair ? (
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-neutral-700">Click Generate to produce an RSA key pair</p>
              <p className="text-[10px] text-neutral-800 mt-1">WebCrypto · exported as PEM</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <Panel
              label="Public Key"
              actions={
                <button
                  type="button"
                  title="Copy public key"
                  onClick={() => copy('public', keyPair.publicKey)}
                  className={[
                    'w-6 h-6 rounded-lg flex items-center justify-center transition-all border',
                    copiedKey === 'public'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 border-white/5 text-neutral-600 hover:text-neutral-300',
                  ].join(' ')}
                >
                  {copiedKey === 'public' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              }
            >
              <pre data-testid="public-key" className="flex-1 min-h-0 overflow-auto px-4 py-3 font-mono text-[11px] text-neutral-300 whitespace-pre-wrap break-all select-all leading-relaxed">
                {keyPair.publicKey}
              </pre>
            </Panel>

            <Panel
              label="Private Key"
              actions={
                <button
                  type="button"
                  title="Copy private key"
                  onClick={() => copy('private', keyPair.privateKey)}
                  className={[
                    'w-6 h-6 rounded-lg flex items-center justify-center transition-all border',
                    copiedKey === 'private'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 border-white/5 text-neutral-600 hover:text-neutral-300',
                  ].join(' ')}
                >
                  {copiedKey === 'private' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              }
            >
              <pre data-testid="private-key" className="flex-1 min-h-0 overflow-auto px-4 py-3 font-mono text-[11px] text-neutral-300 whitespace-pre-wrap break-all select-all leading-relaxed">
                {keyPair.privateKey}
              </pre>
            </Panel>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
