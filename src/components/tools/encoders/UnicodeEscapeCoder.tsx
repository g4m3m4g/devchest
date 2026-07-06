import { useState, useMemo } from 'react';
import { encodeUnicode, decodeUnicode, type EscapeStyle, type EncodeScope } from '../../../lib/unicodeEscape';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'encode' | 'decode';

const STYLE_OPTIONS: [EscapeStyle, string][] = [
  ['js', 'JS \\uXXXX'],
  ['css', 'CSS \\XXXX'],
  ['python', 'Python \\u/\\U'],
  ['codepoint', 'U+XXXX'],
];

export default function UnicodeEscapeCoder() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const [style, setStyle] = useState<EscapeStyle>('js');
  const [scope, setScope] = useState<EncodeScope>('nonAscii');

  const output = useMemo(() => {
    if (!input) return '';
    return mode === 'encode' ? encodeUnicode(input, style, scope) : decodeUnicode(input);
  }, [input, mode, style, scope]);

  return (
    <ToolLayout
      title="Unicode Encoder / Decoder"
      description="Convert text to Unicode escape sequences (JS, CSS, Python, U+ notation) and back."
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
                {STYLE_OPTIONS.map(([s, label]) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={[
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap',
                      style === s
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
                  ['nonAscii', 'Non-ASCII only'],
                  ['all', 'All characters'],
                ] as [EncodeScope, string][]).map(([s, label]) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScope(s)}
                    className={[
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap',
                      scope === s
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
          <Panel label={mode === 'encode' ? 'Raw Text' : 'Escape Sequences'}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'café 😀 世界' : 'caf\\u00e9 \\u{1f600} U+4E16U+754C'}
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label={mode === 'encode' ? 'Escaped Output' : 'Decoded Text'}>
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
              {output || <span className="text-neutral-800">Output will appear here…</span>}
            </pre>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
