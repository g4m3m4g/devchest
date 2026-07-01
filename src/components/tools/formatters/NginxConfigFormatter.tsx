import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { formatNginxConfig } from '../../../lib/nginxConfig';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type IndentSize = 2 | 4;

const PLACEHOLDER = `worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include mime.types;

    server {
        listen 80;
        server_name example.com;

        location / {
            root /var/www/html;
            index index.html;
        }
    }
}`;

export default function NginxConfigFormatter() {
  const [input, setInput] = useState('');
  const [indentSize, setIndentSize] = useState<IndentSize>(4);

  const result = useMemo(
    () => formatNginxConfig(input, { indentSize }),
    [input, indentSize],
  );

  return (
    <ToolLayout
      title="Nginx Config Formatter"
      description="Format and normalize Nginx configuration files with consistent indentation."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel
          label="Source"
          actions={
            <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
              {([2, 4] as IndentSize[]).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setIndentSize(n)}
                  className={[
                    'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                    indentSize === n
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-600 hover:text-neutral-400',
                  ].join(' ')}
                >
                  {n} spaces
                </button>
              ))}
            </div>
          }
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="Formatted Output"
          actions={
            input.trim() ? (
              result.error ? (
                <div className="flex items-center gap-1.5 text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-[10px]">Invalid</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-[10px]">Valid</span>
                </div>
              )
            ) : null
          }
        >
          {result.error ? (
            <div className="flex-1 flex items-start gap-2.5 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 font-mono leading-relaxed break-all">
                {result.error}
              </p>
            </div>
          ) : (
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {result.output || (
                <span className="text-neutral-800">Formatted output will appear here…</span>
              )}
            </pre>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
