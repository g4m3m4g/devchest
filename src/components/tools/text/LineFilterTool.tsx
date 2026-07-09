import { useState, useMemo } from 'react';
import { filterLines } from '../../../lib/lineFilter';
import type { LineFilterMode } from '../../../lib/lineFilter';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function LineFilterTool() {
  const [input, setInput] = useState('');
  const [pattern, setPattern] = useState('');
  const [mode, setMode] = useState<LineFilterMode>('keep');
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);

  const result = useMemo(
    () => filterLines(input, { pattern, mode, useRegex, caseSensitive }),
    [input, pattern, mode, useRegex, caseSensitive]
  );
  const output = result.lines.join('\n');

  return (
    <ToolLayout
      title="Line Filter"
      description="Keep or remove lines matching a plain-text or regex pattern, like grep."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="Pattern…"
            spellCheck={false}
            className="flex-1 min-w-[160px] bg-white/[0.04] border border-white/5 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-300 placeholder-neutral-700 outline-none focus:border-blue-500/40"
          />

          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1">
            {(['keep', 'remove'] as LineFilterMode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={[
                  'px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all',
                  mode === m
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-500 hover:text-neutral-300',
                ].join(' ')}
              >
                {m === 'keep' ? 'Keep' : 'Remove'}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={e => setUseRegex(e.target.checked)}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Use regex</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={e => setCaseSensitive(e.target.checked)}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Case-sensitive</span>
          </label>

          {result.error && (
            <span className="text-[10px] text-red-400 font-medium">Invalid regular expression: {result.error}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label={`Input (${input === '' ? 0 : input.split(/\r?\n/).length} lines)`}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste lines of text to filter…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label={`Output (${result.lines.length} lines)`}>
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
              {output || <span className="text-neutral-800">Filtered lines will appear here…</span>}
            </pre>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
