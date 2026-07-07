import { useState, useMemo } from 'react';
import { caesarEncode, caesarDecode } from '../../../lib/caesarCipher';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'encode' | 'decode';

export default function CaesarCipherTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const [shift, setShift] = useState(13);

  const output = useMemo(() => {
    if (!input) return '';
    return mode === 'encode' ? caesarEncode(input, shift) : caesarDecode(input, shift);
  }, [input, mode, shift]);

  return (
    <ToolLayout
      title="Caesar Cipher / ROT-13"
      description="Shift letters by a configurable amount. ROT-13 is a Caesar cipher with a fixed shift of 13."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-xl p-1 self-start">
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShift(13)}
              className={[
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap border border-white/5',
                shift === 13
                  ? 'bg-white/10 text-white'
                  : 'bg-white/[0.04] text-neutral-500 hover:text-neutral-300',
              ].join(' ')}
            >
              ROT-13
            </button>
            <label className="flex items-center gap-2 text-xs text-neutral-500">
              Shift
              <input
                type="number"
                min={0}
                max={25}
                value={shift}
                onChange={e => setShift(Number(e.target.value))}
                className="w-16 bg-white/[0.04] border border-white/5 rounded-lg px-2 py-1.5 text-sm text-neutral-300 outline-none"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Panel label={mode === 'encode' ? 'Plain Text' : 'Cipher Text'}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Enter text to decode…'}
              spellCheck={false}
              className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
            />
          </Panel>

          <Panel label={mode === 'encode' ? 'Cipher Text' : 'Plain Text'}>
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
              {output || <span className="text-neutral-800">Output will appear here…</span>}
            </pre>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
