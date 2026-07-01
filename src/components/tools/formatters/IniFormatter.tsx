import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { formatIni } from '../../../lib/ini';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Separator = '=' | ':';

const PLACEHOLDER = `[server]
host = 0.0.0.0
port = 8080

[database]
; Primary connection
url = postgres://localhost/app
pool = 5

[logging]
level = info
file = /var/log/app.log`;

export default function IniFormatter() {
  const [input, setInput] = useState('');
  const [separator, setSeparator] = useState<Separator>('=');
  const [sortSections, setSortSections] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);

  const result = useMemo(
    () => formatIni(input, { separator, sortSections, sortKeys }),
    [input, separator, sortSections, sortKeys],
  );

  return (
    <ToolLayout
      title="INI Formatter"
      description="Format and normalize INI and config files. Sort sections and keys, normalize separators."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Source"
          actions={
            <div className="flex items-center gap-2">
              {/* Separator toggle */}
              <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                {(['=', ':'] as Separator[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeparator(s)}
                    className={[
                      'px-2 py-0.5 text-[10px] font-mono font-medium rounded transition-all',
                      separator === s
                        ? 'bg-white/10 text-white'
                        : 'text-neutral-600 hover:text-neutral-400',
                    ].join(' ')}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Sort toggles */}
              <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                <button
                  type="button"
                  onClick={() => setSortSections(v => !v)}
                  className={[
                    'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                    sortSections
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-600 hover:text-neutral-400',
                  ].join(' ')}
                >
                  Sort Sections
                </button>
                <button
                  type="button"
                  onClick={() => setSortKeys(v => !v)}
                  className={[
                    'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                    sortKeys
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-600 hover:text-neutral-400',
                  ].join(' ')}
                >
                  Sort Keys
                </button>
              </div>
            </div>
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="Formatted Output"
          actions={
            input.trim() ? (
              result.error ? (
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
