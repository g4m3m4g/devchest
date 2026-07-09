import { useState, useMemo } from 'react';
import { escapeString, unescapeString } from '../../../lib/stringEscape';
import type { StringEscapeFormat } from '../../../lib/stringEscape';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'escape' | 'unescape';

const FORMAT_OPTIONS: [StringEscapeFormat, string][] = [
  ['js', 'JS'],
  ['python', 'Python'],
  ['sql', 'SQL'],
];

export default function StringEscapeTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('escape');
  const [format, setFormat] = useState<StringEscapeFormat>('js');

  const output = useMemo(() => {
    if (!input) return '';
    return mode === 'escape' ? escapeString(input, format) : unescapeString(input, format);
  }, [input, mode, format]);

  return (
    <ToolLayout
      title="String Escape / Unescape"
      description="Escape or unescape strings for JS, Python, or SQL."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1 self-start">
            {(['escape', 'unescape'] as Mode[]).map(m => (
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
                {m === 'escape' ? 'Escape' : 'Unescape'}
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
          <Panel label={mode === 'escape' ? 'Raw Text' : 'Escaped Text'}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'escape' ? 'Paste text to escape…' : 'Paste text to unescape…'}
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label={mode === 'escape' ? 'Escaped Output' : 'Unescaped Output'}>
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
              {output || <span className="text-neutral-800">Output will appear here…</span>}
            </pre>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
