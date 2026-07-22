import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { generateTypeScriptInterfaces } from '../../../lib/jsonToTypescript';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function JsonToTypeScriptTool() {
  const [input, setInput] = useState('');
  const [rootName, setRootName] = useState('Root');

  const result = useMemo(
    () => generateTypeScriptInterfaces(input, rootName.trim() || 'Root'),
    [input, rootName],
  );

  return (
    <ToolLayout
      title="JSON to TypeScript Interface Generator"
      description="Infer TypeScript interfaces from a JSON payload, including nested objects and arrays."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Input JSON"
          actions={
            <label className="flex items-center gap-1.5">
              <span className="text-[10px] text-neutral-500 font-medium">Root name</span>
              <input
                id="root-name"
                aria-label="Root interface name"
                type="text"
                value={rootName}
                onChange={e => setRootName(e.target.value)}
                spellCheck={false}
                className="w-20 bg-white/5 rounded px-1.5 py-0.5 text-[10px] font-mono text-neutral-300 outline-none"
              />
            </label>
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'{\n  "name": "Alice",\n  "age": 30\n}'}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="TypeScript Interfaces"
          actions={
            result.error ? (
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px]">Invalid JSON</span>
              </div>
            ) : result.output ? (
              <div className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[10px]">Generated</span>
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
              {result.output || <span className="text-neutral-800">Generated interfaces will appear here…</span>}
            </pre>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
