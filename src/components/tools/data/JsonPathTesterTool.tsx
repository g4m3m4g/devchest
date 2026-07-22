import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { evaluateJsonPath } from '../../../lib/jsonPath';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function JsonPathTesterTool() {
  const [input, setInput] = useState('');
  const [path, setPath] = useState('$');

  const result = useMemo(() => evaluateJsonPath(input, path), [input, path]);
  const output = result.error ? '' : JSON.stringify(result.matches, null, 2);

  return (
    <ToolLayout
      title="JSON Path Tester"
      description="Evaluate a JSONPath query against a JSON document and inspect the matched values."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Input JSON"
          actions={
            <input
              type="text"
              value={path}
              onChange={e => setPath(e.target.value)}
              placeholder="$.store.book[0].title"
              spellCheck={false}
              className="w-56 bg-white/5 rounded px-2 py-0.5 text-[11px] font-mono text-neutral-300 outline-none"
            />
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'{\n  "store": {\n    "book": [{ "title": "Book A" }]\n  }\n}'}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="Matches"
          actions={
            result.error ? (
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px]">Error</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[10px]">{result.matches.length} matches</span>
              </div>
            )
          }
        >
          {result.error ? (
            <div className="flex-1 flex items-start gap-2.5 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 font-mono leading-relaxed">{result.error}</p>
            </div>
          ) : (
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {output || <span className="text-neutral-800">Matched values will appear here…</span>}
            </pre>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
