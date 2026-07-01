import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { formatXml } from '../../../lib/xml';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type IndentSize = 2 | 4;

export default function XmlFormatter() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState<IndentSize>(2);

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: null };
    return formatXml(input, indent);
  }, [input, indent]);

  return (
    <ToolLayout
      title="XML Formatter"
      description="Pretty-print and validate XML with configurable indentation."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Input XML"
          actions={
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
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'<root>\n  <item id="1">value</item>\n</root>'}
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
                <span className="text-[10px]">Invalid XML</span>
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
