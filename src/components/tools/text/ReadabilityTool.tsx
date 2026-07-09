import { useState, useMemo } from 'react';
import { analyzeReadability } from '../../../lib/readability';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

function gradeLabel(grade: number): string {
  if (grade <= 0) return 'Kindergarten';
  if (grade >= 16) return 'Graduate';
  return `${Math.round(grade)}th grade`;
}

export default function ReadabilityTool() {
  const [input, setInput] = useState('');

  const result = useMemo(() => analyzeReadability(input), [input]);
  const summary = `Words: ${result.words}\nSentences: ${result.sentences}\nSyllables: ${result.syllables}\nFlesch Reading Ease: ${result.readingEase.toFixed(1)}\nFlesch-Kincaid Grade Level: ${result.gradeLevel.toFixed(1)}`;

  return (
    <ToolLayout
      title="Readability Score"
      description="Flesch Reading Ease and Flesch-Kincaid Grade Level for a block of text."
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

        <div className="shrink-0 grid grid-cols-5 gap-3">
          <StatTile label="Words" value={result.words} className="stat-words" />
          <StatTile label="Sentences" value={result.sentences} className="stat-sentences" />
          <StatTile label="Syllables" value={result.syllables} className="stat-syllables" />
          <StatTile label="Reading Ease" value={result.readingEase.toFixed(1)} className="stat-ease" />
          <StatTile label="Grade Level" value={gradeLabel(result.gradeLevel)} className="stat-grade" />
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
