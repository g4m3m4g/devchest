import { useState, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { signJwtHs256 } from '../../../lib/jwtBuilder';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const DEFAULT_PAYLOAD = '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}';
const DEFAULT_HEADER = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}';

export default function JwtBuilder() {
  const [header, setHeader] = useState(DEFAULT_HEADER);
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [showSecret, setShowSecret] = useState(false);

  const { token, error } = useMemo(() => {
    if (!payload.trim() || !secret) return { token: '', error: null };
    try {
      return { token: signJwtHs256(payload, secret, header), error: null };
    } catch (e) {
      return { token: '', error: e instanceof Error ? e.message : 'Failed to sign token' };
    }
  }, [header, payload, secret]);

  return (
    <ToolLayout
      title="JWT Builder"
      description="Build and sign a JSON Web Token with HMAC-SHA256, entirely in the browser."
      outputValue={token}
      onClear={() => {
        setHeader(DEFAULT_HEADER);
        setPayload(DEFAULT_PAYLOAD);
        setSecret('');
      }}
      onPaste={text => setPayload(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-3">
          <label className="flex-1 flex items-center gap-2 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 shrink-0">Secret</span>
            <input
              type={showSecret ? 'text' : 'password'}
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="your-256-bit-secret"
              spellCheck={false}
              className="flex-1 bg-transparent text-sm text-neutral-300 placeholder-neutral-800 outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => setShowSecret(s => !s)}
              title={showSecret ? 'Hide secret' : 'Show secret'}
              className="text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="flex flex-col gap-4 min-h-0">
            <Panel label="Header" className="shrink-0" >
              <textarea
                value={header}
                onChange={e => setHeader(e.target.value)}
                spellCheck={false}
                rows={4}
                className="w-full resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
              />
            </Panel>
            <Panel label="Payload" className="flex-1 min-h-0">
              <textarea
                value={payload}
                onChange={e => setPayload(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
              />
            </Panel>
          </div>

          <Panel label="Signed Token">
            {error ? (
              <p className="px-4 py-3 font-mono text-sm text-red-400 leading-relaxed">{error}</p>
            ) : (
              <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
                {token || <span className="text-neutral-800">Token will appear here…</span>}
              </pre>
            )}
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
