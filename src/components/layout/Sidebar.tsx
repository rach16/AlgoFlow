import { useState } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useProgressStore } from '../../store/progressStore';
import { getPatternStats } from '../../utils/patterns';
import type { Category, Algorithm } from '../../types/algorithm';

interface SidebarProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'arrays-hashing': '📊',
  'two-pointers': '👆',
  'sliding-window': '🪟',
  'stack': '📚',
  'binary-search': '🔍',
  'linked-list': '🔗',
  'trees': '🌳',
  'tries': '🔤',
  'heap': '⛰️',
  'backtracking': '🔙',
  'graphs': '🕸️',
  'advanced-graphs': '🗺️',
  'dp-1d': '📈',
  'dp-2d': '📊',
  'greedy': '💰',
  'intervals': '📏',
  'math-geometry': '📐',
  'bit-manipulation': '🔢',
};

export function Sidebar({ categories, isOpen, onClose }: SidebarProps) {
  const { currentAlgorithm, setCurrentAlgorithm } = useVisualizerStore();
  const { solvedProblems } = useProgressStore();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map((c) => c.id)
  );
  const [viewMode, setViewMode] = useState<'categories' | 'patterns'>('categories');

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAlgorithm = (algorithm: Algorithm) => {
    setCurrentAlgorithm(algorithm);
    onClose();
  };

  const totalAlgorithms = categories.reduce((sum, c) => sum + c.algorithms.length, 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-slate-800 border-r border-slate-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Mobile close button */}
        <div className="lg:hidden p-4 flex justify-end">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category list */}
        <nav className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            NeetCode 150
          </h2>

          {/* View mode toggle */}
          <div className="flex bg-slate-700 rounded-lg p-1 mb-4">
            <button
              onClick={() => setViewMode('categories')}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                viewMode === 'categories' ? 'bg-slate-600 text-white' : 'text-slate-400'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setViewMode('patterns')}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                viewMode === 'patterns' ? 'bg-slate-600 text-white' : 'text-slate-400'
              }`}
            >
              Patterns
            </button>
          </div>

          {/* Categories view */}
          {viewMode === 'categories' && categories.map((category) => {
            const solvedInCategory = category.algorithms.filter((a) =>
              solvedProblems.includes(a.id)
            ).length;

            return (
              <div key={category.id} className="mb-2">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-left"
                >
                  <span>{CATEGORY_ICONS[category.id] || '📁'}</span>
                  <span className="flex-1 font-medium">{category.name}</span>
                  <span className={`text-xs ${solvedInCategory === category.algorithms.length && solvedInCategory > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                    {solvedInCategory}/{category.algorithms.length}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      expandedCategories.includes(category.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Algorithm list */}
                {expandedCategories.includes(category.id) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {category.algorithms.map((algorithm) => (
                      <button
                        key={algorithm.id}
                        onClick={() => selectAlgorithm(algorithm)}
                        className={`
                          w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm
                          transition-colors
                          ${
                            currentAlgorithm?.id === algorithm.id
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-300 hover:bg-slate-700'
                          }
                        `}
                      >
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            algorithm.difficulty === 'Easy'
                              ? 'bg-green-500'
                              : algorithm.difficulty === 'Medium'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span className="flex-1 truncate">{algorithm.name}</span>
                        {solvedProblems.includes(algorithm.id) && (
                          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Patterns view */}
          {viewMode === 'patterns' && (() => {
            const stats = getPatternStats(categories, solvedProblems);
            return (
              <div className="space-y-2">
                {stats.map(({ name, total, solved }) => (
                  <div key={name} className="px-3 py-2 rounded-lg bg-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{name}</span>
                      <span className={`text-xs ${solved === total && total > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                        {solved}/{total}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          solved === total && total > 0 ? 'bg-green-500' : solved > 0 ? 'bg-indigo-500' : 'bg-slate-600'
                        }`}
                        style={{ width: `${total > 0 ? (solved / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </nav>

        {/* Footer — progress bar */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Progress</span>
            <span>{solvedProblems.length} / {totalAlgorithms}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(solvedProblems.length / totalAlgorithms) * 100}%` }}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
