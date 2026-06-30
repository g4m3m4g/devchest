import { useState, useMemo } from 'react';
import { encodeUrl, decodeUrl } from '../../../lib/url';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'encode' | 'decode';

export default function UrlEncoder() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');

  const output = useMemo(() => {
    if (!input) return '';
    return mode === 'encode' ? encodeUrl(input) : decodeUrl(input);
  }, [input, mode]);

  return (
    <ToolLayout
      title="URL Encoder / Decoder"
      description="Safely encode or decode URL components — handles special characters, spaces, and Unicode."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1 self-start shrink-0">
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

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label={mode === 'encode' ? 'Raw URL / Text' : 'Encoded URL'}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                mode === 'encode'
                  ? 'https://example.com/search?q=hello world&lang=en'
                  : 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world'
              }
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label={mode === 'encode' ? 'Encoded Output' : 'Decoded URL'}>
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
              {output || <span className="text-neutral-800">Output will appear here…</span>}
            </pre>
          </Panel>
        </div>

        <div className="shrink-0 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 mb-3">Common Encodings</p>
          <div className="grid grid-cols-4 gap-x-6 gap-y-1.5">
            {[
              [' ', '%20'], ['!', '%21'], ['"', '%22'], ['#', '%23'],
              ['$', '%24'], ['&', '%26'], ["'", '%27'], ['(', '%28'],
              [')', '%29'], ['*', '%2A'], ['+', '%2B'], [',', '%2C'],
              ['/', '%2F'], [':', '%3A'], [';', '%3B'], ['=', '%3D'],
              ['?', '%3F'], ['@', '%40'], ['[', '%5B'], [']', '%5D'],
            ].map(([char, code]) => (
              <div key={char} className="flex items-center gap-1.5">
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
