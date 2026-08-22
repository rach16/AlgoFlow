import { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { VisualizerPage } from './pages/VisualizerPage';
import { SdetPrepPage } from './pages/SdetPrepPage';
import { ComplexityPage } from './pages/ComplexityPage';
import { MethodsPage } from './pages/MethodsPage';
import { SearchPalette } from './components/common/SearchPalette';
import { categories } from './algorithms';

export type AppView = 'visualizer' | 'sdet' | 'complexity' | 'methods';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<AppView>('visualizer');
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd/Ctrl+K opens search from anywhere. Registered on the shell rather than the palette so
  // the shortcut works while the palette is closed.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="h-dvh flex flex-col">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        view={view}
        onViewChange={setView}
        onSearchClick={() => setSearchOpen(true)}
      />
      <div className="flex-1 flex min-h-0">
        <Sidebar
          categories={categories}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelect={() => setView('visualizer')}
        />
        <main className="flex-1 overflow-y-auto lg:overflow-hidden min-w-0">
          {view === 'visualizer' && <VisualizerPage />}
          {view === 'sdet' && <SdetPrepPage onOpenAlgorithm={() => setView('visualizer')} />}
          {view === 'complexity' && (
            <ComplexityPage onOpenAlgorithm={() => setView('visualizer')} />
          )}
          {view === 'methods' && <MethodsPage />}
        </main>
      </div>

      {searchOpen && (
        <SearchPalette
          onClose={() => setSearchOpen(false)}
          onPick={() => setView('visualizer')}
        />
      )}
    </div>
  );
}

export default App;
