import { useState } from 'react';
import { Menu, Package } from 'lucide-react';
import { Route, Routes } from 'react-router';
import { ToolProvider } from './context/ToolContext';
import Sidebar from './components/layout/Sidebar';
import ToolCatalog from './pages/ToolCatalog';
import ToolPage from './pages/ToolPage';
import NotFound from './pages/NotFound';

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
              <Routes>
                <Route index element={<ToolCatalog />} />
                <Route path="tools/:toolId" element={<ToolPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </ToolProvider>
  );
}
