import { useState, useCallback } from 'react';
import { RefreshCw, Copy, Check, Trash2 } from 'lucide-react';
import {
  generateUuidV1,
  generateUuidV3,
  generateUuidV5,
  generateUuidV7,
  NAMESPACE_PRESETS,
  isValidUuid,
} from '../../../lib/uuidVersions';
import ToolLayout from '../../layout/ToolLayout';

type Version = 'v1' | 'v3' | 'v5' | 'v7';

const VERSION_OPTIONS: { value: Version; label: string }[] = [
  { value: 'v1', label: 'v1 — Timestamp' },
  { value: 'v3', label: 'v3 — Name (MD5)' },
  { value: 'v5', label: 'v5 — Name (SHA-1)' },
  { value: 'v7', label: 'v7 — Unix time + random' },
];

const NAME_BASED = new Set<Version>(['v3', 'v5']);

export default function UuidVersionsGenerator() {
  const [version, setVersion] = useState<Version>('v7');
  const [quantity, setQuantity] = useState(5);
  const [name, setName] = useState('');
  const [namespace, setNamespace] = useState(NAMESPACE_PRESETS[0].value);
  const [customNamespace, setCustomNamespace] = useState('');
  const [useCustomNamespace, setUseCustomNamespace] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const isNameBased = NAME_BASED.has(version);
  const activeNamespace = useCustomNamespace ? customNamespace : namespace;

  const generate = useCallback(() => {
    setError(null);

    if (version === 'v1') {
      setUuids(Array.from({ length: Math.min(quantity, 100) }, () => generateUuidV1()));
      return;
    }
    if (version === 'v7') {
      setUuids(Array.from({ length: Math.min(quantity, 100) }, () => generateUuidV7()));
      return;
    }

    if (!isValidUuid(activeNamespace)) {
      setError('Namespace must be a valid UUID');
      return;
    }
    try {
      const uuid = version === 'v3'
        ? generateUuidV3(name, activeNamespace)
        : generateUuidV5(name, activeNamespace);
      setUuids([uuid]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate UUID');
    }
  }, [version, quantity, name, activeNamespace]);

  const copyOne = async (i: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(i);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch {
      // unavailable
    }
  };

  const copyAll = async () => {
    if (!uuids.length) return;
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      // unavailable
    }
  };

  return (
    <ToolLayout
      title="UUID v1 / v3 / v5 / v7 Generator"
      description="Generate timestamp-based, name-based, and Unix-time UUIDs beyond the standard v4."
      outputValue={uuids.join('\n')}
      onClear={() => setUuids([])}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Version</label>
            <select
              value={version}
              onChange={e => setVersion(e.target.value as Version)}
              className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500/40"
            >
              {VERSION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {isNameBased ? (
            <>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. www.example.com"
                  className="w-48 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Namespace</label>
                <select
                  value={useCustomNamespace ? 'custom' : namespace}
                  onChange={e => {
                    if (e.target.value === 'custom') {
                      setUseCustomNamespace(true);
                    } else {
                      setUseCustomNamespace(false);
                      setNamespace(e.target.value);
                    }
                  }}
                  className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500/40"
                >
                  {NAMESPACE_PRESETS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                  <option value="custom">Custom</option>
                </select>
                {useCustomNamespace && (
                  <input
                    type="text"
                    value={customNamespace}
                    onChange={e => setCustomNamespace(e.target.value)}
                    placeholder="00000000-0000-0000-0000-000000000000"
                    className="w-56 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Count</label>
              <input
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Math.min(100, Number(e.target.value))))}
                className="w-16 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40 text-center"
              />
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {uuids.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setUuids([])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/5 text-neutral-600 hover:text-neutral-400 hover:bg-white/[0.08] transition-all"
                >
                  <Trash2 className="w-3 h-3" />Clear
                </button>
                <button
                  type="button"
                  onClick={copyAll}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    copiedAll
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-white/[0.04] border-white/5 text-neutral-500 hover:bg-white/[0.08] hover:text-neutral-300',
                  ].join(' ')}
                >
                  {copiedAll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedAll ? 'Copied!' : 'Copy All'}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={generate}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all"
            >
              <RefreshCw className="w-3 h-3" />Generate
            </button>
          </div>
        </div>

        {error && (
          <p className="shrink-0 text-xs text-red-400 px-1">{error}</p>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5">
          {uuids.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-neutral-700">Click Generate to produce UUIDs</p>
                <p className="text-[10px] text-neutral-800 mt-1">v1 · v3 · v5 · v7</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {uuids.map((uuid, i) => (
                <li key={i} className="group flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.03] transition-all">
                  <span className="text-[10px] text-neutral-800 font-mono w-5 shrink-0 text-right select-none">{i + 1}</span>
                  <span className="flex-1 font-mono text-sm text-neutral-300 select-all">{uuid}</span>
                  <button
                    type="button"
                    onClick={() => copyOne(i, uuid)}
                    className={[
                      'shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all border opacity-0 group-hover:opacity-100',
                      copiedIndex === i
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 opacity-100'
                        : 'bg-white/5 border-white/5 text-neutral-600 hover:text-neutral-300',
                    ].join(' ')}
                  >
                    {copiedIndex === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
