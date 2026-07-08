import { useState, useMemo } from 'react';
import { slugify } from '../../../lib/slugGenerator';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

const SEPARATOR_OPTIONS = [
  { value: '-', label: 'Hyphen (-)' },
  { value: '_', label: 'Underscore (_)' },
];

export default function SlugGenerator() {
  const [input, setInput] = useState('');
  const [separator, setSeparator] = useState('-');
  const [lowercase, setLowercase] = useState(true);
  const [maxLength, setMaxLength] = useState('');

  const output = useMemo(() => {
    const parsedMaxLength = maxLength.trim() ? Math.max(1, Number(maxLength)) : undefined;
    return slugify(input, { separator, lowercase, maxLength: parsedMaxLength });
  }, [input, separator, lowercase, maxLength]);

  return (
    <ToolLayout
      title="Slug Generator"
      description="Turn a title into a clean, URL-safe slug."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-4 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-5 py-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Separator</label>
            <select
              value={separator}
              onChange={e => setSeparator(e.target.value)}
              className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500/40"
            >
              {SEPARATOR_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Max Length</label>
            <input
              type="number"
              min={1}
              value={maxLength}
              onChange={e => setMaxLength(e.target.value)}
              placeholder="none"
              className="w-20 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500/40 text-center placeholder-neutral-700"
            />
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={e => setLowercase(e.target.checked)}
              className="w-3 h-3 accent-blue-500 rounded"
            />
            <span className="text-[10px] text-neutral-500 font-medium">Lowercase</span>
          </label>
        </div>

        <Panel label="Title" className="shrink-0">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter a title to slugify…"
            spellCheck={false}
            className="w-full bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none"
          />
        </Panel>

        <Panel label="Slug" className="flex-1 min-h-0">
          <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-emerald-400 leading-relaxed whitespace-pre-wrap break-all">
            {output || <span className="text-neutral-800">Slug will appear here…</span>}
          </pre>
        </Panel>
      </div>
    </ToolLayout>
  );
}
