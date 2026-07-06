import { useState, useMemo } from 'react';
import { encodeHex, decodeHex, type HexDelimiter } from '../../../lib/hex';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'encode' | 'decode';

const DELIMITER_OPTIONS: [HexDelimiter, string][] = [
  ['none', 'No delimiter'],
  ['space', 'Space'],
  ['colon', 'Colon'],
];

export default function HexCoder() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const [delimiter, setDelimiter] = useState<HexDelimiter>('space');
  const [uppercase, setUppercase] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: null };
    if (mode === 'encode') {
      return { output: encodeHex(input, { delimiter, uppercase }), error: null };
    }
    try {
      return { output: decodeHex(input), error: null };
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : 'Invalid hex string' };
    }
  }, [input, mode, delimiter, uppercase]);

  return (
    <ToolLayout
      title="Hex Encoder / Decoder"
      description="Convert text to its UTF-8 hexadecimal byte representation and back."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1 self-start">
            {(['encode', 'decode'] as Mode[]).map(m => (
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

          {mode === 'encode' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1">
                {DELIMITER_OPTIONS.map(([d, label]) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDelimiter(d)}
                    className={[
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap',
                      delimiter === d
                        ? 'bg-white/10 text-white'
                        : 'text-neutral-500 hover:text-neutral-300',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1">
                {([
                  [false, 'lowercase'],
                  [true, 'UPPERCASE'],
                ] as [boolean, string][]).map(([u, label]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setUppercase(u)}
                    className={[
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap',
                      uppercase === u
                        ? 'bg-white/10 text-white'
                        : 'text-neutral-500 hover:text-neutral-300',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label={mode === 'encode' ? 'Raw Text' : 'Hex String'}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode…' : '48 65 6c 6c 6f'}
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label={mode === 'encode' ? 'Hex Output' : 'Decoded Text'}>
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
