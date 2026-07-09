import { useState, useMemo } from 'react';
import { renderAsciiArt } from '../../../lib/asciiArt';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function AsciiArtTool() {
  const [input, setInput] = useState('');

  const rows = useMemo(() => renderAsciiArt(input), [input]);
  const output = rows.join('\n');

  return (
    <ToolLayout
      title="Text to ASCII Art"
      description="Render short text as blocky ASCII art letters."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type text to convert…"
            spellCheck={false}
            className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3 text-sm font-mono text-neutral-300 placeholder-neutral-700 outline-none focus:border-blue-500/40"
          />
        </div>

        <div className="flex-1 min-h-0">
          <Panel label="ASCII Art">
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {output || <span className="text-neutral-800">ASCII art will appear here…</span>}
            </pre>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
