import { Search, Package } from 'lucide-react';
import { CATEGORIES, TOOLS } from '../../config/tools';
import { useTool } from '../../context/ToolContext';

export default function Sidebar() {
  const { activeToolId, setActiveToolId, searchQuery, setSearchQuery, searchInputRef } = useTool();

  const filteredTools = searchQuery.trim()
    ? TOOLS.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : TOOLS;

  return (
    <aside className="w-64 h-full flex flex-col bg-[#161618] border-r border-white/5 shrink-0">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white tracking-tight leading-none">DevChest</div>
            <div className="text-[10px] text-neutral-600 mt-0.5">Developer Utility Hub</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tools…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-10 py-1.5 text-xs bg-white/[0.04] border border-white/5 rounded-lg text-neutral-300 placeholder-neutral-600 outline-none focus:border-blue-500/40 focus:bg-white/[0.07] transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-neutral-700 font-mono pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Tool list */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {CATEGORIES.map(category => {
          const tools = filteredTools.filter(t => t.categoryId === category.id);
          if (tools.length === 0) return null;
          return (
            <div key={category.id} className="mb-4">
              <h3 className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-700 select-none">
                {category.name}
              </h3>
              <ul className="space-y-0.5">
                {tools.map(tool => {
                  const Icon = tool.icon;
                  const isActive = activeToolId === tool.id;
                  return (
                    <li key={tool.id}>
                      <button
                        type="button"
                        onClick={() => setActiveToolId(tool.id)}
                        className={[
                          'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all group',
                          isActive
                            ? 'bg-white/[0.09] text-white'
                            : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300',
                        ].join(' ')}
                      >
                        <Icon
                          className={[
                            'w-3.5 h-3.5 shrink-0 transition-colors',
                            isActive ? 'text-blue-400' : 'text-neutral-700 group-hover:text-neutral-500',
                          ].join(' ')}
                        />
                        <span className="text-xs font-medium truncate">{tool.name}</span>
                        {isActive && (
                          <span className="ml-auto w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {filteredTools.length === 0 && (
          <div className="px-2 py-8 text-center">
            <p className="text-xs text-neutral-700">No tools match "{searchQuery}"</p>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/5">
        <p className="text-[10px] text-neutral-700">{TOOLS.length} tools · 100% client-side</p>
      </div>
    </aside>
  );
}
