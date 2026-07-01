import { useState, useMemo } from 'react';
import { parseCSV, formatCSV, detectDelimiter } from '../../../lib/csv';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type OutputMode = 'table' | 'csv';

const DELIMITERS: { label: string; value: string }[] = [
  { label: ',', value: ',' },
  { label: ';', value: ';' },
  { label: 'Tab', value: '\t' },
  { label: '|', value: '|' },
];

export default function CsvViewer() {
  const [input, setInput] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [outputMode, setOutputMode] = useState<OutputMode>('table');
  const [quoteAll, setQuoteAll] = useState(false);

  const parsed = useMemo(() => parseCSV(input, delimiter), [input, delimiter]);

  const formatted = useMemo(
    () => (parsed.headers.length > 0 ? formatCSV(parsed.headers, parsed.rows, { delimiter, quoteAll }) : ''),
    [parsed, delimiter, quoteAll],
  );

  function handleAuto() {
    if (!input.trim()) return;
    setDelimiter(detectDelimiter(input));
  }

  const outputValue = outputMode === 'csv' ? formatted : undefined;

  return (
    <ToolLayout
      title="CSV Formatter & Viewer"
      description="Parse, view, and reformat CSV data with configurable delimiters."
      outputValue={outputValue}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Source */}
        <Panel
          label="Source"
          actions={
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                {DELIMITERS.map(d => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => setDelimiter(d.value)}
                    className={[
                      'px-2 py-0.5 text-[10px] font-mono font-semibold rounded transition-all',
                      delimiter === d.value
                        ? 'bg-white/10 text-white'
                        : 'text-neutral-600 hover:text-neutral-400',
                    ].join(' ')}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAuto}
                className="px-2 py-0.5 text-[10px] font-semibold rounded bg-white/5 text-neutral-600 hover:text-neutral-400 hover:bg-white/[0.08] transition-all"
              >
                Auto
              </button>
            </div>
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'name,age,city\nAlice,30,New York\nBob,25,Los Angeles'}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        {/* Output */}
        <Panel
          label={outputMode === 'table' ? 'Table' : 'CSV'}
          actions={
            <div className="flex items-center gap-2">
              {parsed.headers.length > 0 && (
                <span className="text-[10px] text-neutral-600">
                  <span className="text-neutral-400">{parsed.rowCount}</span> rows ×{' '}
                  <span className="text-neutral-400">{parsed.colCount}</span> cols
                </span>
              )}
              <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                {(['table', 'csv'] as OutputMode[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setOutputMode(m)}
                    className={[
                      'px-2.5 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider transition-all',
                      outputMode === m ? 'bg-white/10 text-white' : 'text-neutral-600 hover:text-neutral-400',
                    ].join(' ')}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {outputMode === 'csv' && (
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quoteAll}
                    onChange={e => setQuoteAll(e.target.checked)}
                    className="w-3 h-3 accent-blue-500 rounded"
                  />
                  <span className="text-[10px] text-neutral-500 font-medium">Quote all</span>
                </label>
              )}
            </div>
          }
        >
          {outputMode === 'table' ? (
            parsed.headers.length > 0 ? (
              <div className="flex-1 min-h-0 overflow-auto">
                <table className="w-full border-collapse text-xs">
                  <thead className="sticky top-0 z-10 bg-[#1e1e20]">
                    <tr>
                      <th className="px-3 py-2 text-right text-neutral-700 font-mono border-b border-r border-white/5 w-10 select-none">
                        #
                      </th>
                      {parsed.headers.map((h, i) => (
                        <th
                          key={i}
                          className="px-3 py-2 text-left font-semibold text-neutral-300 border-b border-r border-white/5 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 1 ? 'bg-white/[0.02]' : ''}>
                        <td className="px-3 py-1.5 text-right text-neutral-700 font-mono border-r border-white/5 select-none">
                          {ri + 1}
                        </td>
                        {parsed.headers.map((_, ci) => (
                          <td
                            key={ci}
                            className="px-3 py-1.5 text-neutral-400 border-r border-white/5 whitespace-nowrap max-w-[200px] truncate"
                          >
                            {row[ci] ?? ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-neutral-800">Table will appear here…</p>
              </div>
            )
          ) : (
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {formatted || <span className="text-neutral-800">Formatted CSV will appear here…</span>}
            </pre>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
