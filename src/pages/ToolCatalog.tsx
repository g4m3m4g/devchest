import { Link } from 'react-router';
import { CATEGORIES, TOOLS } from '../config/tools';
import { buildCatalogJsonLd, buildCatalogSeoMeta } from '../lib/seo';
import { useSEO } from '../hooks/useSEO';

export default function ToolCatalog() {
  useSEO(buildCatalogSeoMeta(), buildCatalogJsonLd());

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8 shrink-0">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome to DevChest</h1>
        <p className="text-sm text-neutral-600 mt-1.5">Pick a tool from the sidebar, or browse the full catalog below.</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {CATEGORIES.map(category => {
          const tools = TOOLS.filter(t => t.categoryId === category.id);
          return (
            <div key={category.id} id={category.id} className="mb-8 scroll-mt-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 mb-3">
                {category.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      to={`/tools/${tool.id}/`}
                      className="group flex items-start gap-3.5 p-4 rounded-2xl bg-[#2c2c2e]/60 backdrop-blur-xl border border-white/5 text-left hover:bg-white/[0.07] hover:border-white/10 transition-all"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-blue-600/10 group-hover:border-blue-600/20 transition-all">
                        <Icon className="w-4 h-4 text-neutral-600 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors leading-snug">
                          {tool.name}
                        </p>
                        <p className="text-[10px] text-neutral-700 mt-0.5 leading-relaxed line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
