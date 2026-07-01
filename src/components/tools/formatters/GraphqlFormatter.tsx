import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { formatGraphql } from '../../../lib/graphqlFormatter';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type PrintWidth = 80 | 120;

export default function GraphqlFormatter() {
  const [input, setInput] = useState('');
  const [printWidth, setPrintWidth] = useState<PrintWidth>(80);
  const [result, setResult] = useState<{ output: string; error: string | null }>({
    output: '',
    error: null,
  });

  useEffect(() => {
    if (!input.trim()) {
      setResult({ output: '', error: null });
      return;
    }
    let cancelled = false;
    formatGraphql(input, printWidth).then(r => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [input, printWidth]);

  return (
    <ToolLayout
      title="GraphQL Formatter"
      description="Format GraphQL schemas, queries, mutations, and fragments."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Source"
          actions={
            <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
              {([80, 120] as PrintWidth[]).map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setPrintWidth(w)}
                  className={[
                    'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                    printWidth === w
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-600 hover:text-neutral-400',
                  ].join(' ')}
                >
                  {w}
                </button>
              ))}
            </div>
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              'type Query {\n  user(id: ID!): User\n  users: [User!]!\n}\n\ntype User {\n  id: ID!\n  name: String!\n  email: String\n}'
            }
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="Formatted Output"
          actions={
            result.error ? (
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px]">Invalid</span>
              </div>
            ) : result.output ? (
              <div className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[10px]">Valid</span>
              </div>
            ) : null
          }
        >
          {result.error ? (
            <div className="flex-1 flex items-start gap-2.5 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 font-mono leading-relaxed break-all">
                {result.error}
              </p>
            </div>
          ) : (
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {result.output || (
                <span className="text-neutral-800">Formatted output will appear here…</span>
              )}
            </pre>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
