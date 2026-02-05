import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { VisualizerPage } from './pages/VisualizerPage';
import { categories } from './algorithms';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          categories={categories}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 flex overflow-hidden">
          <VisualizerPage />
        </main>
      </div>
    </div>
  );
}

export default App;
