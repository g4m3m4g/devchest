import { useState, useMemo } from 'react';
import { format } from 'sql-formatter';
import { AlertCircle } from 'lucide-react';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const DIALECTS = [
  { value: 'sql', label: 'Generic SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'tsql', label: 'T-SQL' },
] as const;

type Dialect = (typeof DIALECTS)[number]['value'];

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [dialect, setDialect] = useState<Dialect>('sql');
  const [tabWidth, setTabWidth] = useState(2);

  const result = useMemo<{ output: string; error: string | null }>(() => {
    if (!input.trim()) return { output: '', error: null };
    try {
      const output = format(input, { language: dialect, tabWidth, keywordCase: 'upper' });
      return { output, error: null };
    } catch (e) {
      return { output: '', error: (e as Error).message };
    }
  }, [input, dialect, tabWidth]);

  return (
    <ToolLayout
      title="SQL Formatter"
      description="Transform messy SQL statements into clean, structured queries with dialect-aware formatting."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Raw SQL"
          actions={
            <div className="flex items-center gap-2">
              <select
                value={dialect}
                onChange={e => setDialect(e.target.value as Dialect)}
                className="text-[10px] bg-white/5 border border-white/5 text-neutral-400 rounded-md px-2 py-1 outline-none focus:border-blue-500/40"
              >
                {DIALECTS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                {[2, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTabWidth(n)}
                    className={[
                      'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                      tabWidth === n
                        ? 'bg-white/10 text-white'
                        : 'text-neutral-600 hover:text-neutral-400',
                    ].join(' ')}
                  >
                    {n}sp
                  </button>
                ))}
              </div>
            </div>
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'SELECT u.id, u.name\nFROM users u\nWHERE u.active = 1'}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="Formatted SQL"
          actions={
            result.error ? (
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px]">Format error</span>
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
              {result.output || <span className="text-neutral-800">Formatted SQL will appear here…</span>}
            </pre>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
