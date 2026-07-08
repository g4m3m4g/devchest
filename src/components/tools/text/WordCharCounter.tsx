import { useState, useMemo } from 'react';
import { computeTextStats } from '../../../lib/textStats';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

function formatReadingTime(seconds: number): string {
  if (seconds === 0) return '0 sec';
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export default function WordCharCounter() {
  const [input, setInput] = useState('');

  const stats = useMemo(() => computeTextStats(input), [input]);

  const tiles = [
    { label: 'Words', value: stats.words },
    { label: 'Characters', value: stats.characters },
    { label: 'Characters (no spaces)', value: stats.charactersNoSpaces },
    { label: 'Sentences', value: stats.sentences },
    { label: 'Paragraphs', value: stats.paragraphs },
    { label: 'Lines', value: stats.lines },
    { label: 'Reading Time', value: formatReadingTime(stats.readingTimeSeconds) },
  ];

  return (
    <ToolLayout
      title="Word & Character Counter"
      description="Count words, characters, sentences, paragraphs, and lines as you type."
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <Panel label="Input Text" className="flex-1 min-h-0">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type or paste your text here…"
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <div className="shrink-0 grid grid-cols-4 gap-3">
          {tiles.map(tile => (
            <div
              key={tile.label}
              className="flex flex-col gap-1 px-4 py-3 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5"
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">{tile.label}</span>
              <span className="font-mono text-lg text-neutral-200">{tile.value}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
