import { useState, useMemo } from 'react';
import { removeDuplicateLines } from '../../../lib/duplicateLineRemover';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function DuplicateLineRemoverTool() {
  const [input, setInput] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(false);

  const lines = useMemo(
    () => removeDuplicateLines(input, { caseSensitive: !caseInsensitive, trimLines }),
    [input, caseInsensitive, trimLines]
  );
  const output = lines.join('\n');

  return (
    <ToolLayout
      title="Duplicate Line Remover"
      description="Remove duplicate lines from text, keeping the first occurrence of each."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={caseInsensitive}
              onChange={e => setCaseInsensitive(e.target.checked)}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Case-insensitive</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={trimLines}
              onChange={e => setTrimLines(e.target.checked)}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Trim lines</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label={`Input (${input === '' ? 0 : input.split(/\r?\n/).length} lines)`}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste lines of text…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label={`Output (${lines.length} lines)`}>
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
              {output || <span className="text-neutral-800">De-duplicated lines will appear here…</span>}
            </pre>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
