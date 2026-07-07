import { useState, useEffect, useRef } from 'react';
import { compressTextToBase64, decompressBase64ToText, type CompressionFormat } from '../../../lib/gzipDeflate';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'compress' | 'decompress';

const FORMAT_OPTIONS: [CompressionFormat, string][] = [
  ['gzip', 'Gzip'],
  ['deflate', 'Deflate'],
  ['deflate-raw', 'Deflate Raw'],
];

export default function GzipDeflateTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('compress');
  const [format, setFormat] = useState<CompressionFormat>('gzip');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;

    if (!input) {
      setOutput('');
      setError(null);
      return;
    }

    const run = mode === 'compress'
      ? compressTextToBase64(input, format)
      : decompressBase64ToText(input.trim(), format);

    run
      .then(result => {
        if (requestId.current !== id) return;
        setOutput(result);
        setError(null);
      })
      .catch((e: unknown) => {
        if (requestId.current !== id) return;
        setOutput('');
        setError(e instanceof Error ? e.message : 'Invalid input');
      });
  }, [input, mode, format]);

  return (
    <ToolLayout
      title="Gzip / Deflate Compress & Decompress"
      description="Compress text with Gzip or Deflate and view it as Base64, or decompress a Base64 payload back to text — all in the browser."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1 self-start">
            {(['compress', 'decompress'] as Mode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={[
                  'px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all',
                  mode === m
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-500 hover:text-neutral-300',
                ].join(' ')}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1">
            {FORMAT_OPTIONS.map(([f, label]) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap',
                  format === f
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-500 hover:text-neutral-300',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label={mode === 'compress' ? 'Raw Text' : 'Base64 Compressed Data'}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'compress' ? 'Enter text to compress…' : 'Paste Base64-encoded compressed data…'}
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label={mode === 'compress' ? 'Base64 Compressed Output' : 'Decompressed Text'}>
            {error ? (
              <p className="px-4 py-3 font-mono text-sm text-red-400 leading-relaxed">{error}</p>
            ) : (
              <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
                {output || <span className="text-neutral-800">Output will appear here…</span>}
              </pre>
            )}
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
