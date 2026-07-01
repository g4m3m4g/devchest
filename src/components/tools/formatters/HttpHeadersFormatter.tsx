import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { formatHttpHeaders } from '../../../lib/httpHeaders';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Tab = 'formatted' | 'table';

const PLACEHOLDER = `HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
cache-control: no-cache, no-store, must-revalidate
x-request-id: req_abc123def456
server: nginx/1.24.0
content-length: 1024`;

export default function HttpHeadersFormatter() {
  const [input, setInput] = useState('');
  const [tab, setTab] = useState<Tab>('formatted');
  const [sortHeaders, setSortHeaders] = useState(false);
  const [canonicalCase, setCanonicalCase] = useState(false);

  const result = useMemo(
    () => formatHttpHeaders(input, { sortHeaders, canonicalCase }),
    [input, sortHeaders, canonicalCase],
  );

  const headerCount = result.headers.length;

  return (
    <ToolLayout
      title="HTTP Headers Formatter"
      description="Parse and format HTTP request and response headers — sort, normalize casing, and view as a structured table."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Source"
          actions={
            <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setSortHeaders(v => !v)}
                className={[
                  'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                  sortHeaders
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-600 hover:text-neutral-400',
                ].join(' ')}
              >
                Sort Headers
              </button>
              <button
                type="button"
                onClick={() => setCanonicalCase(v => !v)}
                className={[
                  'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                  canonicalCase
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-600 hover:text-neutral-400',
                ].join(' ')}
              >
                Canonical Case
              </button>
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
            <div className="flex items-center gap-3">
              {input.trim() && (
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
              )}
              <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                {(['formatted', 'table'] as Tab[]).map(t => {
                  const label =
                    t === 'table' && headerCount > 0
                      ? `Table (${headerCount})`
                      : t === 'table'
                        ? 'Table'
                        : 'Formatted';
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={[
                        'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                        tab === t
                          ? 'bg-white/10 text-white'
                          : 'text-neutral-600 hover:text-neutral-400',
                      ].join(' ')}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          }
        >
          {result.error ? (
            <div className="flex-1 flex items-start gap-2.5 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 font-mono leading-relaxed break-all">
                {result.error}
              </p>
            </div>
          ) : tab === 'formatted' ? (
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {result.output || (
                <span className="text-neutral-800">Formatted output will appear here…</span>
              )}
            </pre>
          ) : (
            <div className="flex-1 min-h-0 overflow-auto px-4 py-3">
              {result.statusLine && (
                <div className="mb-3 pb-3 border-b border-white/5">
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs">
                    {result.statusLine}
                  </span>
                </div>
              )}
              {result.headers.length === 0 ? (
                <p className="text-sm text-neutral-800">Table view will appear here…</p>
              ) : (
                <div className="space-y-px">
                  {result.headers.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="w-44 shrink-0 font-mono text-xs text-blue-400/80 truncate pt-px">
                        {h.name}
                      </span>
                      <span className="flex-1 font-mono text-xs text-neutral-300 break-all leading-snug">
                        {h.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
