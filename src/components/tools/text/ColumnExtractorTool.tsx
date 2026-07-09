import { useState, useMemo } from 'react';
import { extractColumns } from '../../../lib/columnExtractor';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function ColumnExtractorTool() {
  const [input, setInput] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [columns, setColumns] = useState('1');
  const [outputDelimiter, setOutputDelimiter] = useState(',');

  const result = useMemo(
    () => extractColumns(input, { delimiter, columns, outputDelimiter }),
    [input, delimiter, columns, outputDelimiter]
  );

  return (
    <ToolLayout
      title="Column Extractor"
      description="Split delimited text and extract selected columns by index."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-3 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          <input
            type="text"
            value={delimiter}
            onChange={e => setDelimiter(e.target.value)}
            placeholder="Delimiter"
            spellCheck={false}
            className="w-24 bg-white/[0.04] border border-white/5 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-300 placeholder-neutral-700 outline-none focus:border-blue-500/40"
          />
          <input
            type="text"
            value={columns}
            onChange={e => setColumns(e.target.value)}
            placeholder="Columns (e.g. 1,3-4)"
            spellCheck={false}
            className="flex-1 min-w-[160px] bg-white/[0.04] border border-white/5 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-300 placeholder-neutral-700 outline-none focus:border-blue-500/40"
          />
          <input
            type="text"
            value={outputDelimiter}
            onChange={e => setOutputDelimiter(e.target.value)}
            placeholder="Output delimiter"
            spellCheck={false}
            className="w-32 bg-white/[0.04] border border-white/5 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-300 placeholder-neutral-700 outline-none focus:border-blue-500/40"
          />

          {result.error && (
            <span className="text-[10px] text-red-400 font-medium">{result.error}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label="Input">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste delimited text (CSV, TSV, etc.)…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label="Output">
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
              {result.output || <span className="text-neutral-800">Extracted columns will appear here…</span>}
            </pre>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
