import { useState, useMemo } from 'react';
import { renderMarkdown } from '../../../lib/markdownFormatter';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function MarkdownToHtmlTool() {
  const [input, setInput] = useState('');

  const result = useMemo(() => renderMarkdown(input), [input]);

  return (
    <ToolLayout
      title="Markdown to HTML Converter"
      description="Convert Markdown source into sanitized HTML, with a live preview."
      outputValue={result.html}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-3 gap-4 h-full">
        <Panel label="Markdown Source">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'Write markdown here…\n\n# Heading\n\n**bold** and _italic_'}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel label="HTML Output">
          <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
            {result.html || <span className="text-neutral-800">HTML output will appear here…</span>}
          </pre>
        </Panel>

        <Panel label="Preview">
          <div
            className="flex-1 min-h-0 overflow-auto px-4 py-3 md-prose"
            dangerouslySetInnerHTML={{
              __html: result.html || '<span class="text-neutral-800 text-sm font-sans">Rendered preview will appear here…</span>',
            }}
          />
        </Panel>
      </div>
    </ToolLayout>
  );
}
