import { useState, useMemo } from 'react';
import { minifyHtml, minifyCss, calcSavings } from '../../../lib/minifiers';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'html' | 'css';

export default function HtmlCssMinifier() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('html');

  const { output, savings } = useMemo(() => {
    if (!input.trim()) return { output: '', savings: null };
    const minified = mode === 'html' ? minifyHtml(input) : minifyCss(input);
    return { output: minified, savings: calcSavings(input, minified) };
  }, [input, mode]);

  return (
    <ToolLayout
      title="HTML / CSS Minifier"
      description="Strip whitespace, newlines, and comments to compress HTML and CSS payloads."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Source"
          actions={
            <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
              {(['html', 'css'] as Mode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={[
                    'px-2.5 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider transition-all',
                    mode === m
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-600 hover:text-neutral-400',
                  ].join(' ')}
                >
                  {m}
                </button>
              ))}
            </div>
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              mode === 'html'
                ? '<div class="container">\n  <!-- header -->\n  <h1>Hello</h1>\n</div>'
                : '.container {\n  display: flex;\n  /* layout */\n  align-items: center;\n}'
            }
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="Minified Output"
          actions={
            savings && (
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-neutral-600">{savings.original.toLocaleString()}B</span>
                <span className="text-neutral-700">→</span>
                <span className="text-neutral-400">{savings.compressed.toLocaleString()}B</span>
                <span className="text-emerald-500 font-semibold">−{savings.pct}%</span>
              </div>
            )
          }
        >
          <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
            {output || <span className="text-neutral-800">Minified output will appear here…</span>}
          </pre>
        </Panel>
      </div>
    </ToolLayout>
  );
}
