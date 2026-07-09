import { useState, useMemo } from 'react';
import { cleanWhitespace } from '../../../lib/whitespaceLineCleaner';
import type { WhitespaceCleanOptions } from '../../../lib/whitespaceLineCleaner';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const OPTION_TOGGLES: { key: keyof WhitespaceCleanOptions; label: string }[] = [
  { key: 'trimLines', label: 'Trim lines' },
  { key: 'collapseSpaces', label: 'Collapse spaces' },
  { key: 'collapseBlankLines', label: 'Collapse blank lines' },
  { key: 'stripBlankLines', label: 'Strip blank lines' },
  { key: 'trimDocument', label: 'Trim document' },
];

export default function WhitespaceLineCleaner() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<Required<WhitespaceCleanOptions>>({
    trimLines: false,
    collapseSpaces: false,
    collapseBlankLines: false,
    stripBlankLines: false,
    trimDocument: false,
  });

  const toggleOption = (key: keyof WhitespaceCleanOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const cleanedLines = useMemo(() => cleanWhitespace(input, options), [input, options]);
  const output = cleanedLines.join('\n');

  return (
    <ToolLayout
      title="Whitespace / Line Cleaner"
      description="Trim, collapse, and strip whitespace and blank lines from text."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          {OPTION_TOGGLES.map(o => (
            <label key={o.key} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options[o.key]}
                onChange={() => toggleOption(o.key)}
                className="w-3 h-3 accent-blue-500 rounded"
              />
              <span className="text-[10px] text-neutral-500 font-medium">{o.label}</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label={`Input (${input === '' ? 0 : input.split(/\r?\n/).length} lines)`}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste text to clean…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label={`Output (${cleanedLines.length} lines)`}>
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
              {output || <span className="text-neutral-800">Cleaned text will appear here…</span>}
            </pre>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
