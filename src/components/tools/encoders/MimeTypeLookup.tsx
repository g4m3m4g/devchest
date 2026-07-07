import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { searchMimeTypes, lookupByExtension, lookupByMimeType } from '../../../lib/mimeTypes';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function MimeTypeLookup() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchMimeTypes(query), [query]);

  const exactMatch = useMemo(() => {
    if (!query.trim()) return null;
    return query.includes('/') ? lookupByMimeType(query) : lookupByExtension(query);
  }, [query]);

  return (
    <ToolLayout
      title="MIME Type Lookup"
      description="Look up a MIME type by file extension or filename, or find extensions for a MIME type."
      outputValue={exactMatch?.mimeType}
      onClear={() => setQuery('')}
      onPaste={text => setQuery(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-2.5 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-4 py-3">
          <Search className="w-4 h-4 text-neutral-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="png, image/png, or report.pdf…"
            spellCheck={false}
            className="flex-1 bg-transparent font-mono text-sm text-neutral-200 placeholder-neutral-800 outline-none"
          />
        </div>

        {exactMatch && (
          <div className="shrink-0 flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <span className="font-mono text-sm text-emerald-400">{exactMatch.mimeType}</span>
            <span className="text-xs text-neutral-500">
              {exactMatch.extensions.map(ext => `.${ext}`).join(', ')} · {exactMatch.category}
            </span>
          </div>
        )}

        <Panel label={`Results (${results.length})`} className="flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-auto divide-y divide-white/5">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-neutral-600">No matching MIME types found.</p>
            ) : (
              results.map(entry => (
                <div key={entry.mimeType} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <span className="font-mono text-sm text-neutral-300">{entry.mimeType}</span>
                  <span className="text-xs text-neutral-600 whitespace-nowrap">
                    {entry.extensions.length > 0 ? entry.extensions.map(ext => `.${ext}`).join(', ') : '—'} · {entry.category}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
