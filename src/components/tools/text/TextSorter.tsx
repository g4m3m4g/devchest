import { useState, useMemo } from 'react';
import { sortTextLines } from '../../../lib/textSorter';
import type { SortMode, SortDirection } from '../../../lib/textSorter';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const MODE_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'length', label: 'Length' },
];

export default function TextSorter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<SortMode>('alphabetical');
  const [direction, setDirection] = useState<SortDirection>('asc');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [dedupe, setDedupe] = useState(false);
  const [trimLines, setTrimLines] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);

  const sortedLines = useMemo(
    () => sortTextLines(input, { mode, direction, caseSensitive, dedupe, trimLines, removeEmpty }),
    [input, mode, direction, caseSensitive, dedupe, trimLines, removeEmpty]
  );
  const output = sortedLines.join('\n');

  return (
    <ToolLayout
      title="Text Sorter"
      description="Sort lines alphabetically, numerically, or by length — with dedup and cleanup options."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1">
            {MODE_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setMode(o.value)}
                className={[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  mode === o.value
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300',
                ].join(' ')}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1">
            {(['asc', 'desc'] as SortDirection[]).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                className={[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  direction === d
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300',
                ].join(' ')}
              >
                {d === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={e => setCaseSensitive(e.target.checked)}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Case-sensitive</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={dedupe}
              onChange={e => setDedupe(e.target.checked)}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Remove duplicates</span>
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

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={removeEmpty}
              onChange={e => setRemoveEmpty(e.target.checked)}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Remove empty lines</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label={`Input (${input === '' ? 0 : input.split(/\r?\n/).length} lines)`}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste lines of text to sort…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label={`Sorted Output (${sortedLines.length} lines)`}>
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
              {output || <span className="text-neutral-800">Sorted lines will appear here…</span>}
            </pre>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
