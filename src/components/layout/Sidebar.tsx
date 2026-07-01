import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CATEGORIES, TOOLS } from '../../config/tools';
import { useTool } from '../../context/ToolContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onClose }: SidebarProps) {
  const { activeToolId, setActiveToolId, searchQuery, setSearchQuery, searchInputRef } = useTool();

  const filteredTools = searchQuery.trim()
    ? TOOLS.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : TOOLS;

  function handleToolSelect(id: string) {
    setActiveToolId(id);
    onClose();
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'h-full flex flex-col bg-[#161618] border-r border-white/5 shrink-0',
          'transition-[width,transform] duration-300 ease-in-out',
          collapsed ? 'w-14' : 'w-64',
          // Mobile: fixed overlay; Desktop: static in flow
          'fixed inset-y-0 left-0 z-50 md:relative md:inset-auto md:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Brand */}
        <div className={[
          'border-b border-white/5 shrink-0',
          collapsed ? 'px-0 py-4 flex justify-center' : 'px-5 py-4 flex items-center justify-between',
        ].join(' ')}>
          <div className="flex items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}DEVCHEST-LOGO.png`}
              alt="DevChest"
              className="w-7 h-7 rounded-lg shrink-0 object-cover"
            />
            {!collapsed && (
              <div>
                <div className="text-sm font-semibold text-white tracking-tight leading-none">DevChest</div>
                <div className="text-[10px] text-neutral-600 mt-0.5">Developer Utility Hub</div>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          {!collapsed && (
            <button
              type="button"
              onClick={onClose}
              className="md:hidden text-neutral-600 hover:text-neutral-300 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-2 shrink-0">
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
        )}

        {/* Tool list */}
        <nav className={['flex-1 overflow-y-auto py-2', collapsed ? 'px-1' : 'px-2'].join(' ')}>
          {collapsed ? (
            filteredTools.map(tool => {
              const Icon = tool.icon;
              const isActive = activeToolId === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  title={tool.name}
                  onClick={() => handleToolSelect(tool.id)}
                  className={[
                    'w-full flex items-center justify-center p-2.5 rounded-lg mb-0.5 transition-all',
                    isActive
                      ? 'bg-white/[0.09] text-blue-400'
                      : 'text-neutral-700 hover:bg-white/[0.04] hover:text-neutral-400',
                  ].join(' ')}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </button>
              );
            })
          ) : (
            <>
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
                              onClick={() => handleToolSelect(tool.id)}
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
                  <p className="text-xs text-neutral-700">No tools match &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Bottom bar: footer + desktop collapse toggle */}
        <div className="border-t border-white/5 shrink-0">
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Expand sidebar"
              className="hidden md:flex w-full items-center justify-center py-3 text-neutral-700 hover:text-neutral-400 hover:bg-white/[0.04] transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="hidden md:flex items-center justify-between px-5 py-3">
              <p className="text-[10px] text-neutral-700">{TOOLS.length} tools · 100% client-side</p>
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                className="flex items-center gap-1 text-neutral-700 hover:text-neutral-400 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {/* Mobile footer (no collapse toggle on mobile) */}
          {!collapsed && (
            <div className="md:hidden px-5 py-3">
              <p className="text-[10px] text-neutral-700">{TOOLS.length} tools · 100% client-side</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
