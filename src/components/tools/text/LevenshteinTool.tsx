import { useState, useMemo } from 'react';
import { levenshteinDistance, similarityPercent } from '../../../lib/levenshtein';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function LevenshteinTool() {
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');

  const distance = useMemo(() => levenshteinDistance(first, second), [first, second]);
  const similarity = useMemo(() => similarityPercent(first, second), [first, second]);
  const summary = `Levenshtein distance: ${distance}\nSimilarity: ${similarity}%`;

  return (
    <ToolLayout
      title="Levenshtein Distance Calculator"
      description="Compute the edit distance and similarity percentage between two strings."
      outputValue={summary}
      onClear={() => { setFirst(''); setSecond(''); }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label="First String">
            <textarea
              value={first}
              onChange={e => setFirst(e.target.value)}
              placeholder="First string…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label="Second String">
            <textarea
              value={second}
              onChange={e => setSecond(e.target.value)}
              placeholder="Second string…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>
        </div>

        <div className="shrink-0 flex items-center gap-6 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tabular-nums">{distance}</span>
            <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest">Edit distance</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-emerald-400 tabular-nums">{similarity}%</span>
            <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest">Similarity</span>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
