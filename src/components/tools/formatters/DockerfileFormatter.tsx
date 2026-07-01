import { useState, useMemo } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { processDockerfile } from '../../../lib/dockerfile';
import type { DockerfileIssue } from '../../../lib/dockerfile';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type Tab = 'formatted' | 'issues';

const SEVERITY_ICON: Record<DockerfileIssue['severity'], React.ReactNode> = {
  error: <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
  info: <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />,
};

const SEVERITY_LABEL: Record<DockerfileIssue['severity'], string> = {
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const SEVERITY_COLOR: Record<DockerfileIssue['severity'], string> = {
  error: 'text-red-400 bg-red-400/10 border-red-400/20',
  warning: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

const PLACEHOLDER = `# Example Dockerfile
FROM ubuntu
MAINTAINER dev@example.com

WORKDIR app

ADD . /app

RUN apt-get install nodejs

CMD node server.js`;

export default function DockerfileFormatter() {
  const [input, setInput] = useState('');
  const [tab, setTab] = useState<Tab>('formatted');

  const result = useMemo(() => processDockerfile(input), [input]);

  const issueCount = result.issues.length;
  const errorCount = result.issues.filter(i => i.severity === 'error').length;
  const warnCount = result.issues.filter(i => i.severity === 'warning').length;

  return (
    <ToolLayout
      title="Dockerfile Formatter"
      description="Format Dockerfiles and detect common mistakes — deprecated instructions, missing tags, apt-get hygiene."
      outputValue={result.output}
      onClear={() => setInput('')}
      onPaste={text => setInput(text)}
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        <Panel label="Source">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className="flex-1 w-full min-h-0 resize-none bg-transparent px-4 py-3 font-mono text-sm text-neutral-300 placeholder-neutral-800 outline-none leading-relaxed"
          />
        </Panel>

        <Panel
          label="Output"
          actions={
            <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
              {(['formatted', 'issues'] as Tab[]).map(t => {
                const label =
                  t === 'issues'
                    ? issueCount > 0
                      ? `Issues (${issueCount})`
                      : 'Issues'
                    : 'Formatted';
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={[
                      'px-2 py-0.5 text-[10px] font-medium rounded transition-all',
                      tab === t
                        ? 'bg-white/10 text-white'
                        : 'text-neutral-600 hover:text-neutral-400',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          }
        >
          {tab === 'formatted' ? (
            <pre className="flex-1 w-full min-h-0 overflow-auto px-4 py-3 font-mono text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {result.output || (
                <span className="text-neutral-800">Formatted output will appear here…</span>
              )}
            </pre>
          ) : (
            <div className="flex-1 min-h-0 overflow-auto px-4 py-3 space-y-2">
              {issueCount === 0 ? (
                <div className="flex items-center gap-2 text-emerald-500 mt-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">No issues found</span>
                </div>
              ) : (
                <>
                  {(errorCount > 0 || warnCount > 0) && (
                    <p className="text-[10px] text-neutral-700 mb-3">
                      {[
                        errorCount > 0 && `${errorCount} error${errorCount > 1 ? 's' : ''}`,
                        warnCount > 0 && `${warnCount} warning${warnCount > 1 ? 's' : ''}`,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {result.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 py-2 px-3 rounded-xl bg-white/[0.03] border border-white/5"
                    >
                      {SEVERITY_ICON[issue.severity]}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] text-neutral-600">
                            Line {issue.line}
                          </span>
                          <span
                            className={[
                              'text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border',
                              SEVERITY_COLOR[issue.severity],
                            ].join(' ')}
                          >
                            {SEVERITY_LABEL[issue.severity]}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-600">
                            {issue.code}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-snug">{issue.message}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
