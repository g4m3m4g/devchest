import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { csvToJson } from '../../../lib/csvToJson';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const DELIMITERS: { label: string; value: string }[] = [
  { label: ',', value: ',' },
  { label: ';', value: ';' },
  { label: 'Tab', value: '\t' },
  { label: '|', value: '|' },
];

export default function CsvToJsonTool() {
  const [input, setInput] = useState('');
  const [delimiter, setDelimiter] = useState(',');

  const result = useMemo(() => csvToJson(input, delimiter), [input, delimiter]);

  return (
    <ToolLayout
      title="CSV to JSON Converter"
      description="Convert CSV with a header row into a JSON array of objects, with type coercion for numbers and booleans."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Input CSV"
          actions={
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
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'name,age\nAlice,30\nBob,25'}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="JSON Output"
          actions={
            result.error ? (
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px]">Error</span>
              </div>
            ) : result.output ? (
              <div className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[10px]">Converted</span>
              </div>
            ) : null
          }
        >
          {result.error ? (
            <div className="flex-1 flex items-start gap-2.5 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 font-mono leading-relaxed">{result.error}</p>
            </div>
          ) : (
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {result.output || <span className="text-neutral-800">JSON output will appear here…</span>}
            </pre>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
