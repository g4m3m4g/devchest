import { useState, useMemo } from 'react';
import { convertHtmlToMarkdown } from '../../../lib/htmlToMarkdown';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function HtmlToMarkdownTool() {
  const [input, setInput] = useState('');

  const output = useMemo(() => convertHtmlToMarkdown(input), [input]);

  return (
    <ToolLayout
      title="HTML to Markdown Converter"
      description="Convert HTML markup into clean Markdown syntax."
      outputValue={output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel label="HTML Source">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'Paste HTML here…\n\n<h1>Title</h1>\n<p><strong>bold</strong> text</p>'}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel label="Markdown Output">
          <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-all">
            {output || <span className="text-neutral-800">Markdown output will appear here…</span>}
          </pre>
        </Panel>
      </div>
    </ToolLayout>
  );
}
