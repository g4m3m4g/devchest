import { useState, useMemo } from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { decodeJwt, getExpStatus } from '../../../lib/jwt';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function JwtDecoder() {
  const [token, setToken] = useState('');

  const result = useMemo(() => {
    if (!token.trim()) return null;
    return decodeJwt(token);
  }, [token]);

  const nowTs = Math.floor(Date.now() / 1000);
  const expStatus = useMemo(
    () => result?.payloadObj ? getExpStatus(result.payloadObj, nowTs) : null,
    [result, nowTs]
  );

  const alg = result?.payloadObj
    ? (JSON.parse(result.header || '{}') as Record<string, string>).alg ?? ''
    : '';

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode a JSON Web Token client-side — inspect the header, payload, and expiration status."
      outputValue={result?.payload}
      onClear={() => setToken('')}
      onPaste={text => setToken(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <Panel label="JWT Token" className="shrink-0">
          <textarea
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
            spellCheck={false}
            rows={3}
            className="w-full resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        {result?.error && (
          <div className="shrink-0 flex items-center gap-2.5 px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{result.error}</p>
          </div>
        )}

        {expStatus && (
          <div className={[
            'shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm',
            expStatus.expired
              ? 'bg-red-500/5 border-red-500/20 text-red-400'
              : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400',
          ].join(' ')}>
            {expStatus.expired
              ? <XCircle className="w-4 h-4 shrink-0" />
              : <CheckCircle className="w-4 h-4 shrink-0" />}
            <span>{expStatus.label}</span>
            <span className="ml-auto font-mono text-[10px] opacity-60">{expStatus.isoExpiry}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
          <Panel label="Header" actions={alg ? <span className="text-[10px] text-blue-400 font-mono">{alg}</span> : null}>
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {result?.header || <span className="text-neutral-800">Header…</span>}
            </pre>
          </Panel>

          <Panel
            label="Payload"
            actions={
              result?.payloadObj?.iat
                ? <div className="flex items-center gap-1 text-[10px] text-neutral-600">
                    <Clock className="w-3 h-3" />
                    {new Date((result.payloadObj.iat as number) * 1000).toLocaleDateString()}
                  </div>
                : null
            }
          >
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {result?.payload || <span className="text-neutral-800">Payload…</span>}
            </pre>
          </Panel>

          <Panel
            label="Signature"
            actions={<div className="flex items-center gap-1 text-[10px] text-neutral-600"><ShieldCheck className="w-3 h-3" />Not verified</div>}
          >
            <div className="flex-1 px-4 py-3 overflow-auto">
              <p className="font-mono text-sm text-neutral-500 break-all leading-relaxed">
                {result?.signature || <span className="text-neutral-800">Signature…</span>}
              </p>
              {result?.signature && (
                <p className="mt-3 text-[10px] text-neutral-700 leading-relaxed">
                  Verification requires the secret key and cannot be done client-side.
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
