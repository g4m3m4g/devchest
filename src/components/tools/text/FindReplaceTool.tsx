import { useState, useMemo } from 'react';
import { findAndReplace } from '../../../lib/findReplace';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function FindReplaceTool() {
  const [input, setInput] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [global, setGlobal] = useState(true);

  const result = useMemo(
    () => findAndReplace(input, { find, replace, useRegex, caseSensitive, global }),
    [input, find, replace, useRegex, caseSensitive, global]
  );

  return (
    <ToolLayout
      title="Find & Replace"
      description="Find and replace text with plain matching or regex, including capture group substitution."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex flex-col gap-3 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={find}
              onChange={e => setFind(e.target.value)}
              placeholder="Find…"
              spellCheck={false}
              className="flex-1 min-w-[160px] bg-white/[0.04] border border-white/5 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-300 placeholder-neutral-700 outline-none focus:border-blue-500/40"
            />
            <input
              type="text"
              value={replace}
              onChange={e => setReplace(e.target.value)}
              placeholder="Replace…"
              spellCheck={false}
              className="flex-1 min-w-[160px] bg-white/[0.04] border border-white/5 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-300 placeholder-neutral-700 outline-none focus:border-blue-500/40"
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
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

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={global}
                onChange={e => setGlobal(e.target.checked)}
                className="w-3 h-3 accent-blue-500 rounded"
              />
              <span className="text-[10px] text-neutral-500 font-medium">Replace all</span>
            </label>

            {result.error ? (
              <span className="text-[10px] text-red-400 font-medium">Invalid regular expression: {result.error}</span>
            ) : (
              <span className="text-[10px] text-neutral-600 font-medium">{result.matchCount} matches</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label="Input">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste text to search…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label="Output">
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
              {result.output || <span className="text-neutral-800">Result will appear here…</span>}
            </pre>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
