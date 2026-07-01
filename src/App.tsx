import { lazy, Suspense, useState } from 'react';
import { Menu, Package } from 'lucide-react';
import { ToolProvider, useTool } from './context/ToolContext';
import { TOOLS, CATEGORIES } from './config/tools';
import Sidebar from './components/layout/Sidebar';

const JsonFormatter    = lazy(() => import('./components/tools/formatters/JsonFormatter'));
const SqlFormatter     = lazy(() => import('./components/tools/formatters/SqlFormatter'));
const HtmlCssMinifier  = lazy(() => import('./components/tools/formatters/HtmlCssMinifier'));
const XmlFormatter     = lazy(() => import('./components/tools/formatters/XmlFormatter'));
const YamlConverter    = lazy(() => import('./components/tools/formatters/YamlConverter'));
const TomlConverter    = lazy(() => import('./components/tools/formatters/TomlConverter'));
const JsFormatter      = lazy(() => import('./components/tools/formatters/JsFormatter'));
const MarkdownPreview  = lazy(() => import('./components/tools/formatters/MarkdownPreview'));
const CsvViewer        = lazy(() => import('./components/tools/formatters/CsvViewer'));
const GraphqlFormatter = lazy(() => import('./components/tools/formatters/GraphqlFormatter'));
const IniFormatter         = lazy(() => import('./components/tools/formatters/IniFormatter'));
const DockerfileFormatter  = lazy(() => import('./components/tools/formatters/DockerfileFormatter'));
const NginxConfigFormatter  = lazy(() => import('./components/tools/formatters/NginxConfigFormatter'));
const HttpHeadersFormatter  = lazy(() => import('./components/tools/formatters/HttpHeadersFormatter'));
const Base64Tool       = lazy(() => import('./components/tools/encoders/Base64Tool'));
const UrlEncoder       = lazy(() => import('./components/tools/encoders/UrlEncoder'));
const JwtDecoder       = lazy(() => import('./components/tools/encoders/JwtDecoder'));
const RegexTester      = lazy(() => import('./components/tools/text/RegexTester'));
const CaseConverter    = lazy(() => import('./components/tools/text/CaseConverter'));
const DiffChecker      = lazy(() => import('./components/tools/text/DiffChecker'));
const HashGenerator    = lazy(() => import('./components/tools/generators/HashGenerator'));
const UuidGenerator    = lazy(() => import('./components/tools/generators/UuidGenerator'));
const TimestampConverter = lazy(() => import('./components/tools/generators/TimestampConverter'));

const TOOL_MAP: Record<string, React.ReactNode> = {
  'json-formatter':      <JsonFormatter />,
  'sql-formatter':       <SqlFormatter />,
  'html-css-minifier':   <HtmlCssMinifier />,
  'xml-formatter':       <XmlFormatter />,
  'yaml-converter':      <YamlConverter />,
  'toml-converter':      <TomlConverter />,
  'js-formatter':        <JsFormatter />,
  'csv-viewer':          <CsvViewer />,
  'markdown-preview':    <MarkdownPreview />,
  'graphql-formatter':   <GraphqlFormatter />,
  'ini-formatter':        <IniFormatter />,
  'dockerfile-formatter':  <DockerfileFormatter />,
  'nginx-formatter':       <NginxConfigFormatter />,
  'http-headers':          <HttpHeadersFormatter />,
  'base64':              <Base64Tool />,
  'url-encoder':         <UrlEncoder />,
  'jwt-decoder':         <JwtDecoder />,
  'regex-tester':        <RegexTester />,
  'case-converter':      <CaseConverter />,
  'diff-checker':        <DiffChecker />,
  'hash-generator':      <HashGenerator />,
  'uuid-generator':      <UuidGenerator />,
  'timestamp-converter': <TimestampConverter />,
};

function ToolFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );
}

function ActiveTool() {
  const { activeToolId, setActiveToolId } = useTool();
  const component = TOOL_MAP[activeToolId];

  if (component) {
    return (
      <Suspense fallback={<ToolFallback />}>
        {component}
      </Suspense>
    );
  }

  return <Welcome onSelect={setActiveToolId} />;
}

function Welcome({ onSelect }: { onSelect: (id: string) => void }) {
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
            <div key={category.id} className="mb-8">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-700 mb-3">
                {category.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => onSelect(tool.id)}
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
                    </button>
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

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToolProvider>
      <div className="flex h-full overflow-hidden bg-[#1c1c1e] font-sans">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 shrink-0 bg-[#161618]">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="text-neutral-500 hover:text-neutral-300 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
                <Package className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">DevChest</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="h-full p-6">
              <ActiveTool />
            </div>
          </div>
        </main>
      </div>
    </ToolProvider>
  );
}
