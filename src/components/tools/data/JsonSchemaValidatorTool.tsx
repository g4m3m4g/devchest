import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { validateJsonSchema } from '../../../lib/jsonSchemaValidator';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function JsonSchemaValidatorTool() {
  const [instance, setInstance] = useState('');
  const [schema, setSchema] = useState('');

  const result = useMemo(() => validateJsonSchema(instance, schema), [instance, schema]);
  const output = result.parseError
    ? ''
    : JSON.stringify(result.errors, null, 2);

  return (
    <ToolLayout
      title="JSON Schema Validator"
      description="Validate a JSON instance against a JSON Schema and list every violation with its path."
      outputValue={output}
      onClear={() => {
        setInstance('');
        setSchema('');
      }}
      onPaste={text => setInstance(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <div className="grid grid-rows-2 gap-4 min-h-0">
          <Panel label="Instance JSON">
            <textarea
              value={instance}
              onChange={e => setInstance(e.target.value)}
              placeholder={'{\n  "name": "Alice"\n}'}
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>
          <Panel label="JSON Schema">
            <textarea
              value={schema}
              onChange={e => setSchema(e.target.value)}
              placeholder={'{\n  "type": "object",\n  "required": ["field"]\n}'}
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>
        </div>

        <Panel
          label="Validation Result"
          actions={
            result.parseError || result.errors.length > 0 ? (
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px]">Invalid</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[10px]">Valid</span>
              </div>
            )
          }
        >
          {result.parseError ? (
            <div className="flex-1 flex items-start gap-2.5 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 font-mono leading-relaxed">{result.parseError}</p>
            </div>
          ) : result.errors.length > 0 ? (
            <ul className="flex-1 min-h-0 overflow-auto px-4 py-3 space-y-2">
              {result.errors.map((err, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    <span className="font-mono text-red-400">{err.path}</span> — {err.message}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-neutral-800">Validation results will appear here…</p>
            </div>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
