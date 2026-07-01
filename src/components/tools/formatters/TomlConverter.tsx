import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { formatToml, tomlToJson, jsonToToml } from '../../../lib/toml';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'format' | 'toml-to-json' | 'json-to-toml';

const MODES: { id: Mode; label: string }[] = [
  { id: 'format', label: 'Format' },
  { id: 'toml-to-json', label: 'TOML→JSON' },
  { id: 'json-to-toml', label: 'JSON→TOML' },
];

export default function TomlConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('format');

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: null };
    if (mode === 'format') return formatToml(input);
    if (mode === 'toml-to-json') return tomlToJson(input);
    return jsonToToml(input);
  }, [input, mode]);

  const inputPlaceholder =
    mode === 'json-to-toml'
      ? '{\n  "key": "value",\n  "count": 42\n}'
      : 'name = "Alice"\nage = 30\n\n[database]\nhost = "localhost"\nport = 5432';

  return (
    <ToolLayout
      title="TOML Formatter / Converter"
      description="Format TOML or convert between TOML and JSON."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Input"
          actions={
            <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
              {MODES.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { setMode(m.id); setInput(''); }}
                  className={[
                    'px-2.5 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider transition-all',
                    mode === m.id
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-600 hover:text-neutral-400',
                  ].join(' ')}
                >
                  {m.label}
                </button>
              ))}
            </div>
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={inputPlaceholder}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="Output"
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
              {result.output || <span className="text-neutral-800">Output will appear here…</span>}
            </pre>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
