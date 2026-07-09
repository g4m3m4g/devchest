import { useState, useMemo } from 'react';
import { analyzeSentences } from '../../../lib/sentenceCounter';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function SentenceCounterTool() {
  const [input, setInput] = useState('');

  const result = useMemo(() => analyzeSentences(input), [input]);
  const summary = `Sentences: ${result.sentences}\nWords: ${result.words}\nCharacters: ${result.characters}\nAverage words per sentence: ${result.averageWordsPerSentence.toFixed(1)}`;

  return (
    <ToolLayout
      title="Sentence Counter"
      description="Count sentences and words, and see the average sentence length."
      outputValue={summary}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex-1 min-h-0">
          <Panel label="Text">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste text to analyze…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>
        </div>

        <div className="shrink-0 grid grid-cols-4 gap-3">
          <StatTile label="Sentences" value={result.sentences} className="stat-sentences" />
          <StatTile label="Words" value={result.words} className="stat-words" />
          <StatTile label="Characters" value={result.characters} className="stat-characters" />
          <StatTile label="Avg. words/sentence" value={result.averageWordsPerSentence.toFixed(1)} className="stat-average" />
        </div>
      </div>
    </ToolLayout>
  );
}

function StatTile({ label, value, className }: { label: string; value: string | number; className: string }) {
  return (
    <div className="bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-4 py-3 flex flex-col gap-1">
      <span className={`text-lg font-semibold text-white tabular-nums ${className}`}>{value}</span>
      <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest">{label}</span>
    </div>
  );
}
