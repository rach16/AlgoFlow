import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { VisualizerPage } from './pages/VisualizerPage';
import { SdetPrepPage } from './pages/SdetPrepPage';
import { ComplexityPage } from './pages/ComplexityPage';
import { categories } from './algorithms';

export type AppView = 'visualizer' | 'sdet' | 'complexity';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<AppView>('visualizer');

  return (
    <div className="h-dvh flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} view={view} onViewChange={setView} />
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
        </main>
      </div>
    </div>
  );
}

export default App;
