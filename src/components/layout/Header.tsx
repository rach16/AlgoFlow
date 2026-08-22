import { useState } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useProgressStore, selectDue } from '../../store/progressStore';
import { useNow } from '../../utils/useNow';
import { metaCategories } from '../../algorithms/manifest';
import { getPatternName, getAllPatterns } from '../../utils/patterns';

type View = 'visualizer' | 'sdet' | 'complexity' | 'methods' | 'review';

interface HeaderProps {
  onMenuClick: () => void;
  view: View;
  onViewChange: (view: View) => void;
  onSearchClick: () => void;
}

const TABS: { id: View; label: string }[] = [
  { id: 'visualizer', label: 'Visualizer' },
  { id: 'sdet', label: 'SDET Prep' },
  { id: 'complexity', label: 'Complexity' },
  { id: 'methods', label: 'Methods' },
  { id: 'review', label: 'Review' },
];

export function Header({ onMenuClick, view, onViewChange, onSearchClick }: HeaderProps) {
  const { currentAlgorithm } = useVisualizerStore();
  const { solvedProblems, reviews } = useProgressStore();
  const now = useNow();
  const dueCount = selectDue(reviews, now).length;
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center px-3 sm:px-4 gap-2 sm:gap-4 overflow-hidden">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">AF</span>
        </div>
        <h1 className="hidden sm:block text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          AlgoFlow
        </h1>
      </div>

      {/* View tabs */}
      <div className="flex bg-slate-700 rounded-lg p-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0 ${
              view === tab.id ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.id === 'review' && dueCount > 0 && (
              <span className="ml-1.5 px-1 py-0.5 rounded bg-indigo-500 text-white text-[9px] font-bold">
                {dueCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search trigger — the shortcut is useless if nobody knows it exists */}
      <button
        onClick={onSearchClick}
        title="Search problems"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline text-xs">Search</span>
        <kbd className="hidden md:inline text-[10px] border border-slate-600 rounded px-1">⌘K</kbd>
      </button>

      {/* Current algorithm — hidden on mobile (info bar shows it) */}
      {currentAlgorithm && view === 'visualizer' && (
        <div className="hidden lg:flex flex-1 items-center gap-3 ml-4">
          <span className="text-slate-400">/</span>
          <span className="text-slate-300 truncate max-w-[150px]">{currentAlgorithm.category}</span>
          <span className="text-slate-400">/</span>
          <span className="font-medium truncate max-w-[200px]">{currentAlgorithm.name}</span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
              currentAlgorithm.difficulty === 'Easy'
                ? 'bg-green-500/20 text-green-400'
                : currentAlgorithm.difficulty === 'Medium'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {currentAlgorithm.difficulty}
          </span>

          {/* Info button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 rounded hover:bg-slate-700 transition-colors flex-shrink-0"
            title="Problem info"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      )}

      {/* Mobile info button (when algo selected) */}
      {currentAlgorithm && view === 'visualizer' && (
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="lg:hidden ml-auto p-2 rounded-lg hover:bg-slate-700 transition-colors"
          title="Problem info"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}

      {/* Info modal */}
      {showInfo && currentAlgorithm && view === 'visualizer' && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-slate-800 rounded-xl p-6 max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">{currentAlgorithm.name}</h2>
            <p className="text-slate-300 mb-4">{currentAlgorithm.description}</p>

            {/* Pattern context */}
            {(() => {
              const patternName = getPatternName(currentAlgorithm);
              const allPatterns = getAllPatterns(metaCategories);
              const patternAlgos = allPatterns.get(patternName) || [];
              const solvedCount = patternAlgos.filter((a) => solvedProblems.includes(a.id)).length;

              return (
                <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pattern</div>
                  <div className="text-indigo-400 font-medium">{patternName}</div>
                  <div className="text-sm text-slate-400 mt-1">
                    {solvedCount}/{patternAlgos.length} problems solved with this pattern
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {patternAlgos.map((a) => (
                      <span
                        key={a.id}
                        className={`px-2 py-0.5 text-xs rounded ${
                          solvedProblems.includes(a.id)
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-600 text-slate-400'
                        }`}
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {currentAlgorithm.problemUrl && (
              <a
                href={currentAlgorithm.problemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View on LeetCode →
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
