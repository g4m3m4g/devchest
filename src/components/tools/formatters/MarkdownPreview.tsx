import { useState, useEffect, useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import { renderMarkdown, formatMarkdown } from '../../../lib/markdownFormatter';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Mode = 'preview' | 'format';

export default function MarkdownPreview() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('preview');
  const [formatted, setFormatted] = useState<{ output: string; error: string | null }>({
    output: '',
    error: null,
  });

  const preview = useMemo(() => renderMarkdown(input), [input]);

  useEffect(() => {
    if (mode !== 'format' || !input.trim()) {
      setFormatted({ output: '', error: null });
      return;
    }
    let cancelled = false;
    formatMarkdown(input).then(r => { if (!cancelled) setFormatted(r); });
    return () => { cancelled = true; };
  }, [input, mode]);

  const outputValue = mode === 'format' ? formatted.output : undefined;

  return (
    <ToolLayout
      title="Markdown Preview"
      description="Preview rendered Markdown or format and normalise its syntax."
      outputValue={outputValue}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Source"
          actions={
            <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
              {(['preview', 'format'] as Mode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={[
                    'px-2.5 py-0.5 text-[10px] font-semibold rounded capitalize tracking-wider transition-all',
                    mode === m ? 'bg-white/10 text-white' : 'text-neutral-600 hover:text-neutral-400',
                  ].join(' ')}
                >
                  {m}
                </button>
              ))}
            </div>
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'# Heading\n\nWrite **bold**, _italic_, `code`, or [links](url).\n\n- List item one\n- List item two'}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label={mode === 'preview' ? 'Preview' : 'Formatted Output'}
          actions={
            mode === 'format' && formatted.output ? (
              <div className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[10px]">Valid</span>
              </div>
            ) : null
          }
        >
          {mode === 'preview' ? (
            <div
              className="flex-1 min-h-0 overflow-auto px-4 py-3 md-prose"
              dangerouslySetInnerHTML={{ __html: preview.html || '<span class="text-neutral-800 text-sm font-sans">Rendered preview will appear here…</span>' }}
            />
          ) : (
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {formatted.output || (
                <span className="text-neutral-800">Formatted output will appear here…</span>
              )}
            </pre>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
