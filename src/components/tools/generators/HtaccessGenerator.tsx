import { useState, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { buildHtaccess, DEFAULT_HTACCESS_CONFIG } from '../../../lib/htaccess';
import type { HtaccessConfig, RedirectRule, ErrorPageRule, WwwCanonicalization } from '../../../lib/htaccess';
import ToolLayout, { Panel } from '../../layout/ToolLayout';

export default function HtaccessGenerator() {
  const [config, setConfig] = useState<HtaccessConfig>({ ...DEFAULT_HTACCESS_CONFIG });
  const [indexFilesText, setIndexFilesText] = useState('');

  const output = useMemo(
    () => buildHtaccess({ ...config, indexFiles: indexFilesText.trim().split(/\s+/).filter(Boolean) }),
    [config, indexFilesText]
  );

  const patch = (partial: Partial<HtaccessConfig>) => setConfig(prev => ({ ...prev, ...partial }));

  const addRedirect = () => patch({ redirects: [...config.redirects, { from: '', to: '', type: '301' }] });
  const updateRedirect = (i: number, r: Partial<RedirectRule>) =>
    patch({ redirects: config.redirects.map((rule, idx) => (idx === i ? { ...rule, ...r } : rule)) });
  const removeRedirect = (i: number) => patch({ redirects: config.redirects.filter((_, idx) => idx !== i) });

  const addErrorPage = () => patch({ errorPages: [...config.errorPages, { code: '404', path: '' }] });
  const updateErrorPage = (i: number, e: Partial<ErrorPageRule>) =>
    patch({ errorPages: config.errorPages.map((page, idx) => (idx === i ? { ...page, ...e } : page)) });
  const removeErrorPage = (i: number) => patch({ errorPages: config.errorPages.filter((_, idx) => idx !== i) });

  return (
    <ToolLayout
      title=".htaccess Generator"
      description="Build an Apache .htaccess file — HTTPS/www redirects, custom redirects, error pages, caching, compression, and access rules."
      outputValue={output}
      onClear={() => {
        setConfig({ ...DEFAULT_HTACCESS_CONFIG });
        setIndexFilesText('');
      }}
    >
      <div className="grid grid-cols-2 gap-4 h-full min-h-0">
        <Panel label="Options">
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.forceHttps}
                onChange={e => patch({ forceHttps: e.target.checked })}
                className="w-3 h-3 accent-blue-500 rounded"
              />
              <span className="text-xs text-neutral-400">Force HTTPS</span>
            </label>

            <div className="flex items-center gap-2">
              <label htmlFor="htaccess-www" className="text-xs text-neutral-400 shrink-0">WWW canonicalization</label>
              <select
                id="htaccess-www"
                value={config.wwwCanonicalization}
                onChange={e => patch({ wwwCanonicalization: e.target.value as WwwCanonicalization })}
                className="flex-1 bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500/40"
              >
                <option value="none">None</option>
                <option value="www">Force www</option>
                <option value="non-www">Force non-www</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.disableDirectoryListing}
                onChange={e => patch({ disableDirectoryListing: e.target.checked })}
                className="w-3 h-3 accent-blue-500 rounded"
              />
              <span className="text-xs text-neutral-400">Disable directory listing</span>
            </label>

            <div className="flex items-center gap-2">
              <label htmlFor="htaccess-index" className="text-xs text-neutral-400 shrink-0 w-28">Index files</label>
              <input
                id="htaccess-index"
                type="text"
                value={indexFilesText}
                onChange={e => setIndexFilesText(e.target.value)}
                placeholder="index.php index.html"
                className="flex-1 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
              />
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableGzip}
                onChange={e => patch({ enableGzip: e.target.checked })}
                className="w-3 h-3 accent-blue-500 rounded"
              />
              <span className="text-xs text-neutral-400">Enable gzip compression</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableBrowserCaching}
                onChange={e => patch({ enableBrowserCaching: e.target.checked })}
                className="w-3 h-3 accent-blue-500 rounded"
              />
              <span className="text-xs text-neutral-400">Enable browser caching</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.blockHiddenFiles}
                onChange={e => patch({ blockHiddenFiles: e.target.checked })}
                className="w-3 h-3 accent-blue-500 rounded"
              />
              <span className="text-xs text-neutral-400">Block access to hidden (dot) files</span>
            </label>

            <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Redirects</span>
                <button type="button" onClick={addRedirect} className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300">
                  <Plus className="w-3 h-3" />Add Redirect
                </button>
              </div>
              {config.redirects.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <select
                    value={r.type}
                    onChange={e => updateRedirect(i, { type: e.target.value as '301' | '302' })}
                    className="bg-white/5 border border-white/5 text-neutral-400 rounded-lg px-1.5 py-1 text-[10px] outline-none"
                  >
                    <option value="301">301</option>
                    <option value="302">302</option>
                  </select>
                  <input
                    type="text"
                    value={r.from}
                    onChange={e => updateRedirect(i, { from: e.target.value })}
                    placeholder="/old-path"
                    className="flex-1 min-w-0 bg-white/5 border border-white/5 rounded-lg px-2 py-1 font-mono text-[10px] text-neutral-300 placeholder-neutral-800 outline-none"
                  />
                  <input
                    type="text"
                    value={r.to}
                    onChange={e => updateRedirect(i, { to: e.target.value })}
                    placeholder="/new-path"
                    className="flex-1 min-w-0 bg-white/5 border border-white/5 rounded-lg px-2 py-1 font-mono text-[10px] text-neutral-300 placeholder-neutral-800 outline-none"
                  />
                  <button type="button" title="Remove redirect" onClick={() => removeRedirect(i)} className="text-neutral-600 hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700">Error Pages</span>
                <button type="button" onClick={addErrorPage} className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300">
                  <Plus className="w-3 h-3" />Add Error Page
                </button>
              </div>
              {config.errorPages.map((e, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={e.code}
                    onChange={ev => updateErrorPage(i, { code: ev.target.value })}
                    placeholder="404"
                    className="w-14 bg-white/5 border border-white/5 rounded-lg px-2 py-1 font-mono text-[10px] text-neutral-300 outline-none"
                  />
                  <input
                    type="text"
                    value={e.path}
                    onChange={ev => updateErrorPage(i, { path: ev.target.value })}
                    placeholder="/404.html"
                    className="flex-1 min-w-0 bg-white/5 border border-white/5 rounded-lg px-2 py-1 font-mono text-[10px] text-neutral-300 placeholder-neutral-800 outline-none"
                  />
                  <button type="button" title="Remove error page" onClick={() => removeErrorPage(i)} className="text-neutral-600 hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-3">
              <label htmlFor="htaccess-custom" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 block mb-1.5">Custom Rules</label>
              <textarea
                id="htaccess-custom"
                value={config.customRules}
                onChange={e => patch({ customRules: e.target.value })}
                rows={3}
                spellCheck={false}
                placeholder="RewriteRule ^foo$ /bar [L]"
                className="w-full resize-none bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-neutral-300 placeholder-neutral-800 outline-none focus:border-blue-500/40"
              />
            </div>
          </div>
        </Panel>

        <Panel label=".htaccess">
          {output ? (
            <pre data-testid="htaccess-output" className="flex-1 min-h-0 overflow-auto px-4 py-3 font-mono text-xs text-neutral-300 whitespace-pre-wrap break-all select-all leading-relaxed">
              {output}
            </pre>
          ) : (
            <div data-testid="htaccess-output" className="flex-1 flex items-center justify-center">
              <p className="text-sm text-neutral-700">Enable an option to generate an .htaccess file</p>
            </div>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
