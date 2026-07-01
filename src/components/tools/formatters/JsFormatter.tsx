import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { formatJs } from '../../../lib/jsFormatter';
import type { JsFormatOptions } from '../../../lib/jsFormatter';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Parser = 'babel' | 'typescript';
type TabWidth = 2 | 4;
type TrailingComma = 'all' | 'es5' | 'none';

export default function JsFormatter() {
  const [input, setInput] = useState('');
  const [parser, setParser] = useState<Parser>('babel');
  const [tabWidth, setTabWidth] = useState<TabWidth>(2);
  const [semi, setSemi] = useState(true);
  const [singleQuote, setSingleQuote] = useState(false);
  const [trailingComma, setTrailingComma] = useState<TrailingComma>('all');
  const [result, setResult] = useState<{ output: string; error: string | null }>({
    output: '',
    error: null,
  });

  useEffect(() => {
    if (!input.trim()) {
      setResult({ output: '', error: null });
      return;
    }
    const opts: JsFormatOptions = { parser, tabWidth, semi, singleQuote, trailingComma };
    let cancelled = false;
    formatJs(input, opts).then(r => { if (!cancelled) setResult(r); });
    return () => { cancelled = true; };
  }, [input, parser, tabWidth, semi, singleQuote, trailingComma]);

  return (
    <ToolLayout
      title="JS / TS Formatter"
      description="Format JavaScript and TypeScript using Prettier rules."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Source"
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              {/* Parser */}
              <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                {(['babel', 'typescript'] as Parser[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setParser(p)}
                    className={[
                      'px-2.5 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider transition-all',
                      parser === p ? 'bg-white/10 text-white' : 'text-neutral-600 hover:text-neutral-400',
                    ].join(' ')}
                  >
                    {p === 'babel' ? 'JS' : 'TS'}
                  </button>
                ))}
              </div>

              {/* Tab width */}
              <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                {([2, 4] as TabWidth[]).map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTabWidth(n)}
                    className={[
                      'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                      tabWidth === n ? 'bg-white/10 text-white' : 'text-neutral-600 hover:text-neutral-400',
                    ].join(' ')}
                  >
                    {n}sp
                  </button>
                ))}
              </div>

              {/* Trailing comma */}
              <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                {(['all', 'es5', 'none'] as TrailingComma[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTrailingComma(t)}
                    className={[
                      'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                      trailingComma === t ? 'bg-white/10 text-white' : 'text-neutral-600 hover:text-neutral-400',
                    ].join(' ')}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Toggles */}
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={semi}
                  onChange={e => setSemi(e.target.checked)}
                  className="w-3 h-3 accent-blue-500 rounded"
                />
                <span className="text-[10px] text-neutral-500 font-medium">Semi</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={singleQuote}
                  onChange={e => setSingleQuote(e.target.checked)}
                  className="w-3 h-3 accent-blue-500 rounded"
                />
                <span className="text-[10px] text-neutral-500 font-medium">Single quotes</span>
              </label>
            </div>
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              parser === 'typescript'
                ? 'const greet = (name: string): string => {\n  return `Hello, ${name}`\n}'
                : 'const greet = (name) => {\n  return `Hello, ${name}`\n}'
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
              <p className="text-sm text-red-400 font-mono leading-relaxed">{result.error}</p>
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
