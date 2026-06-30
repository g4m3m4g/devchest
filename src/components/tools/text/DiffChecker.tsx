import { useState, useMemo } from 'react';
import { diffLines } from 'diff';
import type { Change } from 'diff';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function DiffChecker() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');

  const changes = useMemo<Change[]>(() => {
    if (!original && !modified) return [];
    return diffLines(original, modified);
  }, [original, modified]);

  const stats = useMemo(() => {
    let added = 0, removed = 0;
    for (const c of changes) {
      const lines = c.value.split('\n').filter((_, i, a) => i < a.length - 1 || c.value.endsWith('\n') || c.value !== '').length;
      if (c.added) added += lines;
      else if (c.removed) removed += lines;
    }
    return { added, removed };
  }, [changes]);

  const diffOutput = useMemo(() => {
    return changes.map((c, i) => ({
      key: i,
      value: c.value,
      added: c.added ?? false,
      removed: c.removed ?? false,
    }));
  }, [changes]);

  return (
    <ToolLayout
      title="Diff Checker"
      description="Paste two text blocks to visualize additions and deletions line by line."
      onClear={() => { setOriginal(''); setModified(''); }}
    >
      <div className="flex flex-col gap-4 h-full">
        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4 shrink-0" style={{ height: '38%' }}>
          <Panel label="Original">
            <textarea
              value={original}
              onChange={e => setOriginal(e.target.value)}
              placeholder="Paste original text here…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>
          <Panel label="Modified">
            <textarea
              value={modified}
              onChange={e => setModified(e.target.value)}
              placeholder="Paste modified text here…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>
        </div>

        {/* Diff output */}
        <Panel
          label="Diff"
          className="flex-1 min-h-0"
          actions={
            changes.length > 0 ? (
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-emerald-500">+{stats.added} added</span>
                <span className="text-red-400">−{stats.removed} removed</span>
              </div>
            ) : null
          }
        >
          <div className="flex-1 overflow-auto">
            {diffOutput.length === 0 ? (
              <p className="px-4 py-3 font-mono text-sm text-neutral-800">Diff will appear here…</p>
            ) : (
              <table className="w-full border-collapse font-mono text-sm">
                <tbody>
                  {diffOutput.map(({ key, value, added, removed }) =>
                    value.split('\n').filter((line, i, arr) => i < arr.length - 1 || line !== '').map((line, li) => (
                      <tr
                        key={`${key}-${li}`}
                        className={[
                          'group',
                          added ? 'bg-emerald-500/10' : removed ? 'bg-red-500/10' : '',
                        ].join(' ')}
                      >
                        <td className={[
                          'select-none w-6 px-2 py-0.5 text-right text-[10px] border-r',
                          added ? 'text-emerald-500 border-emerald-500/20' : removed ? 'text-red-400 border-red-500/20' : 'text-neutral-800 border-white/5',
                        ].join(' ')}>
                          {added ? '+' : removed ? '−' : ' '}
                        </td>
                        <td className={[
                          'px-4 py-0.5 whitespace-pre leading-relaxed',
                          added ? 'text-emerald-300' : removed ? 'text-red-300' : 'text-neutral-500',
                        ].join(' ')}>
                          {line || ' '}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
