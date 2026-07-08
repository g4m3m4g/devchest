import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { generateLoremIpsum } from '../../../lib/loremIpsum';
import type { LoremUnit } from '../../../lib/loremIpsum';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const UNIT_OPTIONS: { value: LoremUnit; label: string }[] = [
  { value: 'words', label: 'Words' },
  { value: 'sentences', label: 'Sentences' },
  { value: 'paragraphs', label: 'Paragraphs' },
];

export default function LoremIpsumGenerator() {
  const [unit, setUnit] = useState<LoremUnit>('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState('');

  const generate = useCallback(() => {
    setOutput(generateLoremIpsum({ unit, count: Math.max(1, Math.min(count, 100)), startWithLorem }));
  }, [unit, count, startWithLorem]);

  return (
    <ToolLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder text by words, sentences, or paragraphs."
      outputValue={output}
      onClear={() => setOutput('')}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1">
            {UNIT_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setUnit(o.value)}
                className={[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  unit === o.value
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300',
                ].join(' ')}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Count</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={e => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-16 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40 text-center"
            />
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={e => setStartWithLorem(e.target.checked)}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Start with "Lorem ipsum…"</span>
          </label>

          <button
            type="button"
            onClick={generate}
            className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all"
          >
            <RefreshCw className="w-3 h-3" />Generate
          </button>
        </div>

        <Panel label="Output" className="flex-1 min-h-0">
          <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {output || <span className="text-neutral-800">Click Generate to produce placeholder text…</span>}
          </pre>
        </Panel>
      </div>
    </ToolLayout>
  );
}
