import { useState, useMemo } from 'react';
import { reverseText } from '../../../lib/textReverse';
import type { ReverseMode } from '../../../lib/textReverse';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const MODE_OPTIONS: { value: ReverseMode; label: string }[] = [
  { value: 'characters', label: 'Characters' },
  { value: 'words', label: 'Words' },
  { value: 'lines', label: 'Lines' },
];

export default function TextReverse() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ReverseMode>('characters');

  const output = useMemo(() => reverseText(input, mode), [input, mode]);

  return (
    <ToolLayout
      title="Text Reverse"
      description="Reverse text by character, word, or line order."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1 self-start shrink-0">
          {MODE_OPTIONS.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => setMode(o.value)}
              className={[
                'px-4 py-1.5 text-xs font-medium rounded-lg transition-all',
                mode === o.value
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300',
              ].join(' ')}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label="Input Text">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type or paste your text here…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label="Reversed Output">
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
              {output || <span className="text-neutral-800">Output will appear here…</span>}
            </pre>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
