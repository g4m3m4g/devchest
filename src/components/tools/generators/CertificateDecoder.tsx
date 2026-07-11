import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { decodeCertificate } from '../../../lib/certificate';
import type { DecodedCertificate } from '../../../lib/certificate';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function CertificateDecoder() {
  const [pem, setPem] = useState('');
  const [cert, setCert] = useState<DecodedCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEmpty = !pem.trim();

  useEffect(() => {
    if (!pem.trim()) return;

    let cancelled = false;
    decodeCertificate(pem)
      .then(result => {
        if (!cancelled) {
          setCert(result);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCert(null);
          setError('Unable to decode certificate — invalid PEM or unsupported structure');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pem]);

  return (
    <ToolLayout
      title="Certificate Decoder"
      description="Decode a PEM-encoded X.509 certificate into human-readable subject, validity, key, and extension fields."
      onClear={() => setPem('')}
      onPaste={text => setPem(text)}
    >
      <div className="flex flex-col gap-4 h-full min-h-0">
        <Panel label="Certificate PEM" className="shrink-0">
          <textarea
            value={pem}
            onChange={e => setPem(e.target.value)}
            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
            spellCheck={false}
            rows={5}
            className="w-full resize-none bg-transparent px-4 py-3 font-mono text-xs text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        {!isEmpty && error && (
          <div className="shrink-0 flex items-center gap-2.5 px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {(isEmpty || (!cert && !error)) && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 flex items-center justify-center">
            <p className="text-sm text-neutral-700">Paste a PEM certificate to decode it</p>
          </div>
        )}

        {!isEmpty && cert && (
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
            <div className={[
              'shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm',
              cert.isExpired || cert.isNotYetValid
                ? 'bg-red-500/5 border-red-500/20 text-red-400'
                : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400',
            ].join(' ')}>
              {cert.isExpired || cert.isNotYetValid
                ? <XCircle className="w-4 h-4 shrink-0" />
                : <CheckCircle className="w-4 h-4 shrink-0" />}
              <span>
                {cert.isExpired ? 'Expired' : cert.isNotYetValid ? 'Not yet valid' : `Valid — expires in ${cert.daysUntilExpiry} days`}
              </span>
              <span className="ml-auto font-mono text-[10px] opacity-60">
                {cert.notBefore.toISOString()} → {cert.notAfter.toISOString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Panel label="Subject">
                <div className="px-4 py-3 flex flex-col gap-1.5">
                  {cert.subject.map(attr => (
                    <div key={attr.oid} className="flex items-baseline gap-2">
                      <span className="text-[10px] text-neutral-700 w-10 shrink-0">{attr.shortName}</span>
                      <span className="font-mono text-xs text-neutral-300 break-all">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel label="Issuer">
                <div className="px-4 py-3 flex flex-col gap-1.5">
                  {cert.issuer.map(attr => (
                    <div key={attr.oid} className="flex items-baseline gap-2">
                      <span className="text-[10px] text-neutral-700 w-10 shrink-0">{attr.shortName}</span>
                      <span className="font-mono text-xs text-neutral-300 break-all">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <Panel label="Certificate Details">
              <div className="px-4 py-3 flex flex-col gap-2">
                {([
                  ['Version', `v${cert.version}`],
                  ['Serial Number', cert.serialNumber],
                  ['Signature Algorithm', cert.signatureAlgorithm],
                  ['Public Key Algorithm', cert.publicKeyAlgorithm],
                  ['Public Key Size', cert.publicKeyBits ? `${cert.publicKeyBits} bits` : '—'],
                  ['Certificate Authority', cert.isCA ? 'Yes' : 'No'],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex items-baseline gap-2">
                    <span className="text-[10px] text-neutral-700 w-36 shrink-0">{label}</span>
                    <span className="font-mono text-xs text-neutral-300 break-all">{value}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {cert.subjectAltNames.length > 0 && (
              <Panel label="Subject Alternative Names">
                <div className="px-4 py-3 flex flex-col gap-1.5">
                  {cert.subjectAltNames.map((san, i) => (
                    <div key={i} className="flex items-baseline gap-2">
                      <span className="text-[10px] text-neutral-700 w-10 shrink-0">{san.type}</span>
                      <span className="font-mono text-xs text-neutral-300 break-all">{san.value}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            <Panel label="Fingerprints">
              <div className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] text-neutral-700 w-16 shrink-0">SHA-256</span>
                  <span className="font-mono text-xs text-neutral-300 break-all select-all">{cert.fingerprintSha256}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] text-neutral-700 w-16 shrink-0">SHA-1</span>
                  <span className="font-mono text-xs text-neutral-300 break-all select-all">{cert.fingerprintSha1}</span>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
