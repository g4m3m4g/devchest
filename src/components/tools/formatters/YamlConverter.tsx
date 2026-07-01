import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { formatYaml, yamlToJson, jsonToYaml } from '../../../lib/yaml';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'format' | 'yaml-to-json' | 'json-to-yaml';

const MODES: { id: Mode; label: string }[] = [
  { id: 'format', label: 'Format' },
  { id: 'yaml-to-json', label: 'YAML→JSON' },
  { id: 'json-to-yaml', label: 'JSON→YAML' },
];

export default function YamlConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('format');

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: null };
    if (mode === 'format') return formatYaml(input);
    if (mode === 'yaml-to-json') return yamlToJson(input);
    return jsonToYaml(input);
  }, [input, mode]);

  const inputPlaceholder =
    mode === 'json-to-yaml'
      ? '{\n  "key": "value",\n  "count": 42\n}'
      : 'name: Alice\nage: 30\nroles:\n  - admin\n  - editor';

  return (
    <ToolLayout
      title="YAML Formatter / Converter"
      description="Format YAML or convert between YAML and JSON."
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
