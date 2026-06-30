import { useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { getRegexSegments } from '../../../lib/regex';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [testString, setTestString] = useState('');

  const { segments, matchCount, error } = useMemo(
    () => getRegexSegments(pattern, flags, testString),
    [pattern, flags, testString]
  );

  const toggleFlag = (f: 'i' | 'm') => setFlags(prev => ({ ...prev, [f]: !prev[f] }));

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test regular expressions against text in real time with inline match highlighting."
      outputValue={`${matchCount} match${matchCount !== 1 ? 'es' : ''} found`}
      onClear={() => { setPattern(''); setTestString(''); }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="shrink-0 flex items-center gap-2 bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl border border-white/5 px-4 py-3">
          <span className="text-neutral-700 font-mono text-lg select-none">/</span>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="Enter regex pattern…"
            spellCheck={false}
            className="flex-1 bg-transparent font-mono text-sm text-neutral-200 placeholder-neutral-800 outline-none"
          />
          <span className="text-neutral-700 font-mono text-lg select-none">/</span>

          <div className="flex items-center gap-1 ml-2">
            {(['g', 'i', 'm'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => { if (f !== 'g') toggleFlag(f); }}
                disabled={f === 'g'}
                title={f === 'g' ? 'global (always on)' : f === 'i' ? 'case insensitive' : 'multiline'}
                className={[
                  'w-6 h-6 rounded font-mono text-xs transition-all',
                  flags[f] || f === 'g'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'bg-white/5 text-neutral-600 border border-white/5 hover:border-white/10',
                  f === 'g' ? 'opacity-50 cursor-default' : 'cursor-pointer',
                ].join(' ')}
              >
                {f}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-red-400 ml-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[10px]">Invalid regex</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label="Test String">
            <textarea
              value={testString}
              onChange={e => setTestString(e.target.value)}
              placeholder="Enter text to test against the pattern…"
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel
            label="Match Results"
            actions={
              matchCount > 0
                ? <span className="text-[10px] text-blue-400 font-semibold">{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
                : pattern && testString && !error
                  ? <span className="text-[10px] text-neutral-600">No matches</span>
                  : null
            }
          >
            <div className="flex-1 overflow-auto px-4 py-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
              {error ? (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400">{error}</p>
                </div>
              ) : segments.length > 0 ? (
                segments.map((seg, i) =>
                  seg.isMatch ? (
                    <mark key={i} className="bg-blue-500/25 text-blue-300 rounded px-0.5 not-italic">
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={i} className="text-neutral-400">{seg.text}</span>
                  )
                )
              ) : (
                <span className="text-neutral-800">Matches will be highlighted here…</span>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
