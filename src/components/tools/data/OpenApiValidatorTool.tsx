import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { validateOpenApi } from '../../../lib/openApiValidator';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function OpenApiValidatorTool() {
  const [docText, setDocText] = useState('');

  const result = useMemo(() => validateOpenApi(docText), [docText]);
  const output = result.parseError ? '' : JSON.stringify(result.errors, null, 2);
  const isInvalid = !!result.parseError || result.errors.length > 0;

  return (
    <ToolLayout
      title="OpenAPI / Swagger Validator"
      description="Validate an OpenAPI 3.x or Swagger 2.0 document and list every structural violation with its path."
      outputValue={output}
      onClear={() => setDocText('')}
      onPaste={text => setDocText(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel label="OpenAPI / Swagger Document">
          <textarea
            value={docText}
            onChange={e => setDocText(e.target.value)}
            placeholder={'{\n  "openapi": "3.0.0",\n  "info": { "title": "Sample API", "version": "1.0.0" },\n  "paths": {}\n}'}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="Validation Result"
          actions={
            isInvalid ? (
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px]">Invalid</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[10px]">{result.version ? `Valid (${result.version})` : 'Valid'}</span>
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
