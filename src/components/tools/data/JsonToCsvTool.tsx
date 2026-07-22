import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { jsonToCsv } from '../../../lib/jsonToCsv';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function JsonToCsvTool() {
  const [input, setInput] = useState('');

  const result = useMemo(() => jsonToCsv(input), [input]);

  return (
    <ToolLayout
      title="JSON to CSV Converter"
      description="Convert a JSON array of objects into CSV, flattening nested fields with dot notation."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel label="Input JSON">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'[\n  { "name": "Alice", "age": 30 }\n]'}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="CSV Output"
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
              {result.output || <span className="text-neutral-800">CSV output will appear here…</span>}
            </pre>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
