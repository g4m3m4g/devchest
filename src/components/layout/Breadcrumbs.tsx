import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import type { Tool } from '../../config/tools';
import { getCategoryForTool } from '../../lib/seo';

export default function Breadcrumbs({ tool }: { tool: Tool }) {
  const category = getCategoryForTool(tool);

  return (
    <nav aria-label="Breadcrumb" className="mb-4 shrink-0">
      <ol className="flex items-center gap-1.5 text-xs text-neutral-600">
        <li>
          <Link to="/" className="hover:text-neutral-300 transition-colors">
            Home
          </Link>
        </li>
        <li className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3" />
          <Link to={`/#${category.id}`} className="hover:text-neutral-300 transition-colors">
            {category.name}
          </Link>
        </li>
        <li className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-400">{tool.name}</span>
        </li>
      </ol>
    </nav>
  );
}
