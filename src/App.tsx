import { Suspense, lazy, useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { VisualizerPage } from './pages/VisualizerPage';
const SdetPrepPage = lazy(() => import('./pages/SdetPrepPage').then((m) => ({ default: m.SdetPrepPage })));
const ComplexityPage = lazy(() => import('./pages/ComplexityPage').then((m) => ({ default: m.ComplexityPage })));
const MethodsPage = lazy(() => import('./pages/MethodsPage').then((m) => ({ default: m.MethodsPage })));
const ReviewPage = lazy(() => import('./pages/ReviewPage').then((m) => ({ default: m.ReviewPage })));
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SearchPalette } from './components/common/SearchPalette';
import { categories } from './algorithms';

export type AppView = 'visualizer' | 'sdet' | 'complexity' | 'methods' | 'review';

function PaneLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <span className="text-sm text-slate-500">Loading…</span>
    </div>
  );
}

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
    <div className="h-dvh flex flex-col overflow-x-hidden">
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
          <ErrorBoundary area={`the ${view} view`} resetKey={view}>
            <Suspense fallback={<PaneLoading />}>
              {view === 'visualizer' && <VisualizerPage />}
              {view === 'sdet' && <SdetPrepPage onOpenAlgorithm={() => setView('visualizer')} />}
              {view === 'complexity' && (
                <ComplexityPage onOpenAlgorithm={() => setView('visualizer')} />
              )}
              {view === 'methods' && <MethodsPage />}
              {view === 'review' && <ReviewPage onOpenAlgorithm={() => setView('visualizer')} />}
            </Suspense>
          </ErrorBoundary>
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
