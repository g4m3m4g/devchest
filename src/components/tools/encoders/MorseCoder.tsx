import { useState, useMemo } from 'react';
import { encodeMorse, decodeMorse } from '../../../lib/morse';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'encode' | 'decode';

export default function MorseCoder() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: null };
    try {
      if (mode === 'encode') {
        return { output: encodeMorse(input), error: null };
      }
      return { output: decodeMorse(input), error: null };
    } catch (e) {
      return {
        output: '',
        error: e instanceof Error ? e.message : 'Invalid input',
      };
    }
  }, [input, mode]);

  return (
    <ToolLayout
      title="Morse Code Encoder / Decoder"
      description="Convert text to Morse code and back. Words are separated by a slash."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1 self-start shrink-0">
          {(['encode', 'decode'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={[
                'px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all',
                mode === m
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-500 hover:text-neutral-300',
              ].join(' ')}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label={mode === 'encode' ? 'Text' : 'Morse Code'}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode…' : '.... .. / - .... . .-. .'}
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label={mode === 'encode' ? 'Morse Output' : 'Decoded Text'}>
            {error ? (
              <p className="px-4 py-3 font-mono text-sm text-red-400 leading-relaxed">{error}</p>
            ) : (
              <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
                {output || <span className="text-neutral-800">Output will appear here…</span>}
              </pre>
            )}
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
