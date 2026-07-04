import { useState, useMemo } from 'react';
import { encodeHtmlEntities, decodeHtmlEntities, type EncodeMode } from '../../../lib/htmlEntities';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'encode' | 'decode';

export default function HtmlEntityCoder() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const [encodeMode, setEncodeMode] = useState<EncodeMode>('named');

  const output = useMemo(() => {
    if (!input) return '';
    return mode === 'encode' ? encodeHtmlEntities(input, encodeMode) : decodeHtmlEntities(input);
  }, [input, mode, encodeMode]);

  return (
    <ToolLayout
      title="HTML Entity Encoder / Decoder"
      description="Escape reserved HTML characters or decode named and numeric entities back to text."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between shrink-0">
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
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1">
              {([
                ['named', 'Reserved only'],
                ['all', 'All non-ASCII'],
              ] as [EncodeMode, string][]).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setEncodeMode(m)}
                  className={[
                    'px-4 py-1.5 text-xs font-medium rounded-lg transition-all',
                    encodeMode === m
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-500 hover:text-neutral-300',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label={mode === 'encode' ? 'Raw Text / HTML' : 'Encoded Entities'}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                mode === 'encode'
                  ? '<div class="a">A & B\'s café</div>'
                  : '&lt;div class=&quot;a&quot;&gt;A &amp; B&#39;s caf&#233;&lt;/div&gt;'
              }
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label={mode === 'encode' ? 'Encoded Output' : 'Decoded Text'}>
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
              {output || <span className="text-neutral-800">Output will appear here…</span>}
            </pre>
          </Panel>
        </div>

        <div className="shrink-0 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 mb-3">Common Entities</p>
          <div className="grid grid-cols-4 gap-x-6 gap-y-1.5">
            {[
              ['&', '&amp;'], ['<', '&lt;'], ['>', '&gt;'], ['"', '&quot;'],
              ["'", '&#39;'], ['©', '&copy;'], ['®', '&reg;'], ['™', '&trade;'],
              ['—', '&mdash;'], ['€', '&euro;'], ['£', '&pound;'], ['…', '&hellip;'],
            ].map(([char, code]) => (
              <div key={code} className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-neutral-400 w-4 text-center">{char}</span>
                <span className="text-neutral-700 text-[10px]">→</span>
                <span className="font-mono text-[10px] text-blue-400">{code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
