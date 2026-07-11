import { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { CSP_DIRECTIVES, buildCsp, getCspWarnings, buildMetaTag, buildHeaderLine } from '../../../lib/csp';
import type { CspDirective, CspPolicy } from '../../../lib/csp';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

type OutputFormat = 'header' | 'meta';

const EMPTY_SOURCES = Object.fromEntries(CSP_DIRECTIVES.map(d => [d, ''])) as Record<CspDirective, string>;

export default function CspBuilder() {
  const [sources, setSources] = useState<Record<CspDirective, string>>(EMPTY_SOURCES);
  const [upgradeInsecureRequests, setUpgradeInsecureRequests] = useState(false);
  const [format, setFormat] = useState<OutputFormat>('header');

  const policy: CspPolicy = useMemo(() => {
    const result: CspPolicy = {};
    for (const directive of CSP_DIRECTIVES) {
      const tokens = sources[directive].trim().split(/\s+/).filter(Boolean);
      if (tokens.length > 0) result[directive] = tokens;
    }
    return result;
  }, [sources]);

  const policyString = useMemo(() => buildCsp(policy, { upgradeInsecureRequests }), [policy, upgradeInsecureRequests]);
  const warnings = useMemo(() => getCspWarnings(policy), [policy]);
  const output = policyString ? (format === 'header' ? buildHeaderLine(policyString) : buildMetaTag(policyString)) : '';

  const setSource = (directive: CspDirective, value: string) => {
    setSources(prev => ({ ...prev, [directive]: value }));
  };

  return (
    <ToolLayout
      title="Content Security Policy Builder"
      description="Build a Content-Security-Policy header or meta tag by filling in sources for each directive."
      outputValue={output}
      onClear={() => {
        setSources(EMPTY_SOURCES);
        setUpgradeInsecureRequests(false);
      }}
    >
      <div className="grid grid-cols-2 gap-4 h-full min-h-0">
        <Panel label="Directives" className="min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
            {CSP_DIRECTIVES.map(directive => (
              <div key={directive} className="flex items-center gap-2">
                <label htmlFor={`csp-${directive}`} className="w-32 shrink-0 text-[10px] font-mono text-neutral-500">
                  {directive}
                </label>
                <input
                  id={`csp-${directive}`}
                  type="text"
                  value={sources[directive]}
                  onChange={e => setSource(directive, e.target.value)}
                  placeholder="'self' https://example.com"
                  spellCheck={false}
                  className="flex-1 min-w-0 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
                />
              </div>
            ))}

            <label className="flex items-center gap-1.5 cursor-pointer pt-1.5 border-t border-white/5 mt-1">
              <input
                type="checkbox"
                checked={upgradeInsecureRequests}
                onChange={e => setUpgradeInsecureRequests(e.target.checked)}
                className="w-3 h-3 accent-blue-500 rounded"
              />
              <span className="text-[10px] text-neutral-500 font-medium">Upgrade Insecure Requests</span>
            </label>
          </div>
        </Panel>

        <div className="flex flex-col gap-4 min-h-0">
          <Panel
            label="Generated Policy"
            actions={
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFormat('header')}
                  className={[
                    'px-2 py-1 rounded-md text-[10px] font-medium transition-all',
                    format === 'header' ? 'bg-blue-500/20 text-blue-400' : 'text-neutral-600 hover:text-neutral-400',
                  ].join(' ')}
                >
                  Header
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('meta')}
                  className={[
                    'px-2 py-1 rounded-md text-[10px] font-medium transition-all',
                    format === 'meta' ? 'bg-blue-500/20 text-blue-400' : 'text-neutral-600 hover:text-neutral-400',
                  ].join(' ')}
                >
                  Meta Tag
                </button>
              </div>
            }
          >
            <div className="flex-1 min-h-0 overflow-auto px-4 py-3">
              {output ? (
                <p data-testid="csp-output" className="font-mono text-xs text-neutral-300 break-all whitespace-pre-wrap select-all leading-relaxed">
                  {output}
                </p>
              ) : (
                <p data-testid="csp-output" className="text-sm text-neutral-700">Add sources to a directive to generate a policy</p>
              )}
            </div>
          </Panel>

          <Panel label="Warnings" className="flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-2">
              {warnings.length === 0 ? (
                <p className="text-xs text-neutral-700">No warnings</p>
              ) : (
                warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{w.message}</span>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
