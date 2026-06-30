import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type IndentSize = 2 | 4;

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState<IndentSize>(2);
  const [minify, setMinify] = useState(false);

  const result = useMemo<{ output: string; error: string | null }>(() => {
    if (!input.trim()) return { output: '', error: null };
    try {
      const parsed = JSON.parse(input);
      const output = minify
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, indent);
      return { output, error: null };
    } catch (e) {
      return { output: '', error: (e as Error).message };
    }
  }, [input, indent, minify]);

  const handleClear = () => setInput('');
  const handlePaste = (text: string) => setInput(text);

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format and validate JSON with configurable indentation or minify for compact output."
      outputValue={result.output}
      onClear={handleClear}
      onPaste={handlePaste}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Input */}
        <Panel
          label="Input JSON"
          actions={
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={minify}
                  onChange={e => setMinify(e.target.checked)}
                  className="w-3 h-3 accent-blue-500 rounded"
                />
                <span className="text-[10px] text-neutral-500 font-medium">Minify</span>
              </label>
              {!minify && (
                <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                  {([2, 4] as IndentSize[]).map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setIndent(n)}
                      className={[
                        'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                        indent === n
                          ? 'bg-white/10 text-white'
                          : 'text-neutral-600 hover:text-neutral-400',
                      ].join(' ')}
                    >
                      {n}sp
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'{\n  "key": "value"\n}'}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        {/* Output */}
        <Panel
          label="Formatted Output"
          actions={
            result.error ? (
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px]">Invalid JSON</span>
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
              <p className="text-sm text-red-400 font-mono leading-relaxed">{result.error}</p>
            </div>
          ) : (
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {result.output || <span className="text-neutral-800">Formatted output will appear here…</span>}
            </pre>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
