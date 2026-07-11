import { useState, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { buildRobotsTxt, COMMON_USER_AGENTS } from '../../../lib/robotsTxt';
import type { RobotsConfig } from '../../../lib/robotsTxt';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

interface RuleDraft {
  userAgent: string;
  disallow: string;
  allow: string;
  crawlDelay: string;
}

const DEFAULT_RULE: RuleDraft = { userAgent: '*', disallow: '', allow: '', crawlDelay: '' };

function toLines(text: string): string[] {
  return text.split('\n').map(l => l.trim()).filter(Boolean);
}

export default function RobotsTxtGenerator() {
  const [rules, setRules] = useState<RuleDraft[]>([{ ...DEFAULT_RULE }]);
  const [sitemaps, setSitemaps] = useState('');

  const config: RobotsConfig = useMemo(() => ({
    rules: rules.map(r => ({
      userAgent: r.userAgent || '*',
      disallow: toLines(r.disallow),
      allow: toLines(r.allow),
      ...(r.crawlDelay.trim() ? { crawlDelay: Number(r.crawlDelay) } : {}),
    })),
    sitemaps: toLines(sitemaps),
  }), [rules, sitemaps]);

  const output = useMemo(() => buildRobotsTxt(config), [config]);

  const updateRule = (index: number, patch: Partial<RuleDraft>) => {
    setRules(prev => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addRule = () => setRules(prev => [...prev, { ...DEFAULT_RULE, userAgent: '' }]);
  const removeRule = (index: number) => setRules(prev => prev.filter((_, i) => i !== index));

  return (
    <ToolLayout
      title="robots.txt Generator"
      description="Build a robots.txt file with per-user-agent allow/disallow rules and sitemap references."
      outputValue={output}
      onClear={() => {
        setRules([{ ...DEFAULT_RULE }]);
        setSitemaps('');
      }}
    >
      <div className="grid grid-cols-2 gap-4 h-full min-h-0">
        <div className="flex flex-col gap-4 min-h-0">
          <Panel label="Rules" className="flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-4">
              {rules.map((rule, i) => (
                <div key={i} className="flex flex-col gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <label htmlFor={`ua-${i}`} className="w-24 shrink-0 text-[10px] font-mono text-neutral-500">User-agent</label>
                    <input
                      id={`ua-${i}`}
                      type="text"
                      list="robots-common-agents"
                      value={rule.userAgent}
                      onChange={e => updateRule(i, { userAgent: e.target.value })}
                      placeholder="*"
                      className="flex-1 min-w-0 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
                    />
                    {rules.length > 1 && (
                      <button
                        type="button"
                        title="Remove rule"
                        onClick={() => removeRule(i)}
                        className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <label htmlFor={`disallow-${i}`} className="w-24 shrink-0 pt-1.5 text-[10px] font-mono text-neutral-500">Disallow</label>
                    <textarea
                      id={`disallow-${i}`}
                      value={rule.disallow}
                      onChange={e => updateRule(i, { disallow: e.target.value })}
                      placeholder={'/admin/\n/private/'}
                      rows={2}
                      spellCheck={false}
                      className="flex-1 min-w-0 resize-none bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <label htmlFor={`allow-${i}`} className="w-24 shrink-0 pt-1.5 text-[10px] font-mono text-neutral-500">Allow</label>
                    <textarea
                      id={`allow-${i}`}
                      value={rule.allow}
                      onChange={e => updateRule(i, { allow: e.target.value })}
                      placeholder="/admin/public/"
                      rows={2}
                      spellCheck={false}
                      className="flex-1 min-w-0 resize-none bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor={`delay-${i}`} className="w-24 shrink-0 text-[10px] font-mono text-neutral-500">Crawl-delay</label>
                    <input
                      id={`delay-${i}`}
                      type="number"
                      min={0}
                      value={rule.crawlDelay}
                      onChange={e => updateRule(i, { crawlDelay: e.target.value })}
                      placeholder="—"
                      className="w-20 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
                    />
                  </div>
                </div>
              ))}

              <datalist id="robots-common-agents">
                {COMMON_USER_AGENTS.map(ua => <option key={ua} value={ua} />)}
              </datalist>

              <button
                type="button"
                onClick={addRule}
                className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/10 border border-blue-600/20 text-blue-400 hover:bg-blue-600/20 transition-all"
              >
                <Plus className="w-3 h-3" />Add User-agent
              </button>
            </div>
          </Panel>

          <Panel label="Sitemaps" className="shrink-0">
            <div className="px-4 py-3">
              <label htmlFor="robots-sitemaps" className="sr-only">Sitemaps</label>
              <textarea
                id="robots-sitemaps"
                value={sitemaps}
                onChange={e => setSitemaps(e.target.value)}
                placeholder={'https://example.com/sitemap.xml'}
                rows={2}
                spellCheck={false}
                className="w-full resize-none bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
              />
            </div>
          </Panel>
        </div>

        <Panel label="robots.txt">
          <pre data-testid="robots-output" className="flex-1 min-h-0 overflow-auto px-4 py-3 font-mono text-xs text-neutral-300 whitespace-pre-wrap break-all select-all leading-relaxed">
            {output}
          </pre>
        </Panel>
      </div>
    </ToolLayout>
  );
}
