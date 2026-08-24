import { Suspense, lazy, useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { VisualizerPage } from './pages/VisualizerPage';
const SdetPrepPage = lazy(() => import('./pages/SdetPrepPage').then((m) => ({ default: m.SdetPrepPage })));
const ComplexityPage = lazy(() => import('./pages/ComplexityPage').then((m) => ({ default: m.ComplexityPage })));
const MethodsPage = lazy(() => import('./pages/MethodsPage').then((m) => ({ default: m.MethodsPage })));
const ReviewPage = lazy(() => import('./pages/ReviewPage').then((m) => ({ default: m.ReviewPage })));
const DrillPage = lazy(() => import('./pages/DrillPage').then((m) => ({ default: m.DrillPage })));
const TestDesignPage = lazy(() =>
  import('./pages/TestDesignPage').then((m) => ({ default: m.TestDesignPage }))
);
const TestabilityPage = lazy(() =>
  import('./pages/TestabilityPage').then((m) => ({ default: m.TestabilityPage }))
);
const CraftPage = lazy(() => import('./pages/CraftPage').then((m) => ({ default: m.CraftPage })));
const FlakeLabPage = lazy(() =>
  import('./pages/FlakeLabPage').then((m) => ({ default: m.FlakeLabPage }))
);
const AiTestingPage = lazy(() =>
  import('./pages/AiTestingPage').then((m) => ({ default: m.AiTestingPage }))
);
const AiFeaturesPage = lazy(() =>
  import('./pages/AiFeaturesPage').then((m) => ({ default: m.AiFeaturesPage }))
);
const SqlPage = lazy(() => import('./pages/SqlPage').then((m) => ({ default: m.SqlPage })));
const BuildPage = lazy(() => import('./pages/BuildPage').then((m) => ({ default: m.BuildPage })));
const BehavioralPage = lazy(() =>
  import('./pages/BehavioralPage').then((m) => ({ default: m.BehavioralPage }))
);
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SearchPalette } from './components/common/SearchPalette';
import { metaCategories } from './algorithms/manifest';
import { useVisualizerShortcuts } from './hooks/useVisualizerShortcuts';
import { DEFAULT_VIEW, type AppView } from './components/layout/navigation';

export type { AppView };

function PaneLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <span className="text-sm text-slate-500">Loading…</span>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<AppView>(DEFAULT_VIEW);
  const [searchOpen, setSearchOpen] = useState(false);

  // Playback keys only make sense on the visualizer, and the palette owns the keyboard
  // whenever it is open.
  useVisualizerShortcuts(view === 'visualizer' && !searchOpen);

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
          categories={metaCategories}
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
              {view === 'drill' && <DrillPage onOpenAlgorithm={() => setView('visualizer')} />}
              {view === 'testdesign' && <TestDesignPage />}
              {view === 'testability' && <TestabilityPage />}
              {view === 'craft' && <CraftPage />}
              {view === 'flake' && <FlakeLabPage />}
              {view === 'ai' && <AiTestingPage />}
              {view === 'aifeatures' && <AiFeaturesPage />}
              {view === 'sql' && <SqlPage />}
              {view === 'build' && <BuildPage />}
              {view === 'behavioral' && <BehavioralPage />}
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
