import { Suspense } from 'react';
import { Navigate, useParams } from 'react-router';
import { TOOLS } from '../config/tools';
import { TOOL_MAP } from '../config/toolComponents';
import { buildToolPageJsonLd, buildToolSeoMeta } from '../lib/seo';
import { useSEO } from '../hooks/useSEO';
import Breadcrumbs from '../components/layout/Breadcrumbs';

function ToolFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );
}

export default function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = TOOLS.find(t => t.id === toolId);
  const component = toolId ? TOOL_MAP[toolId] : undefined;

  if (!tool || !component) {
    return <Navigate to="/" replace />;
  }

  return (
    <ToolPageContent tool={tool} component={component} />
  );
}

function ToolPageContent({
  tool,
  component,
}: {
  tool: (typeof TOOLS)[number];
  component: React.ReactNode;
}) {
  useSEO(buildToolSeoMeta(tool), buildToolPageJsonLd(tool));

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs tool={tool} />
      <div className="flex-1 min-h-0">
        <Suspense fallback={<ToolFallback />}>
          {component}
        </Suspense>
      </div>
    </div>
  );
}
