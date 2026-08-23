import { useState } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useProgressStore } from '../../store/progressStore';
import { getPatternStats } from '../../utils/patterns';
import { getTopicStats, type TopicId } from '../../utils/topics';
import { useFilterStore } from '../../store/filterStore';
import { AUDIENCES } from '../../data/audiences';
import { filterByAudience, countByAudience } from '../../utils/audienceFilter';
import type { AlgorithmMeta, CategoryMeta } from '../../algorithms/manifestTypes';

interface SidebarProps {
  categories: CategoryMeta[];
  isOpen: boolean;
  onClose: () => void;
  /** fired after an algorithm is picked, so the shell can switch back to the visualizer */
  onSelect?: () => void;
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

export function Sidebar({ categories, isOpen, onClose, onSelect }: SidebarProps) {
  const { currentAlgorithm, selectAlgorithm } = useVisualizerStore();
  const { solvedProblems } = useProgressStore();
  const { audiences, toggleAudience, clearAudiences } = useFilterStore();

  // Filter once, here, because Categories / Patterns / Topics all derive their grouping from the
  // same list — so one insertion point covers every browse axis.
  const visible = filterByAudience(categories, audiences);
  const visibleCount = visible.reduce((n, c) => n + c.algorithms.length, 0);

  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map((c) => c.id)
  );
  const [viewMode, setViewMode] = useState<'categories' | 'patterns' | 'topics'>('categories');
  const [expandedPatterns, setExpandedPatterns] = useState<string[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<TopicId[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleTopic = (id: TopicId) =>
    setExpandedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );

  const togglePattern = (name: string) =>
    setExpandedPatterns((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );

  const pick = (algorithm: AlgorithmMeta) => {
    void selectAlgorithm(algorithm.id);
    onSelect?.();
    onClose();
  };

  /** One problem in a grouped list. `showCategory` is for the Patterns and Topics views,
   *  where the grouping cuts across categories and the category is the useful context. */
  const AlgorithmRow = ({
    algorithm,
    showCategory,
  }: {
    algorithm: AlgorithmMeta;
    showCategory?: boolean;
  }) => (
    <button
      onClick={() => pick(algorithm)}
      title={`${algorithm.name} — ${algorithm.category} — ${algorithm.difficulty}`}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors ${
        currentAlgorithm?.id === algorithm.id
          ? 'bg-indigo-600 text-white'
          : 'text-slate-300 hover:bg-slate-600/70'
      }`}
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
      <span className="flex-1 min-w-0">
        <span className="block truncate leading-tight">{algorithm.name}</span>
        {showCategory && (
          <span className="block truncate text-[10px] text-slate-500 leading-tight">
            {algorithm.category}
          </span>
        )}
      </span>
      {solvedProblems.includes(algorithm.id) && (
        <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );

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
            NeetCode 250
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
            <button
              onClick={() => setViewMode('topics')}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                viewMode === 'topics' ? 'bg-slate-600 text-white' : 'text-slate-400'
              }`}
            >
              Topics
            </button>
          </div>

          {/* Audience filter — cuts across all three views above */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Who asks it
              </span>
              {audiences.length > 0 && (
                <button
                  onClick={clearAudiences}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {AUDIENCES.map((audience) => {
                const active = audiences.includes(audience.id);
                return (
                  <button
                    key={audience.id}
                    onClick={() => toggleAudience(audience.id)}
                    title={audience.blurb}
                    aria-pressed={active}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
                      active
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {audience.label}
                    <span className="ml-1 text-slate-500 tabular-nums">
                      {countByAudience(categories, [audience.id])}
                    </span>
                  </button>
                );
              })}
            </div>
            {audiences.length > 0 && (
              <p className="mt-1.5 text-[10px] text-slate-500">
                Showing {visibleCount} of {totalAlgorithms} problems
              </p>
            )}
          </div>

          {/* Categories view */}
          {viewMode === 'categories' && visible.map((category) => {
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
                        onClick={() => pick(algorithm)}
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
            const stats = getPatternStats(visible, solvedProblems);
            return (
              <div className="space-y-2">
                {stats.map(({ name, total, solved, algorithms }) => {
                  const isExpanded = expandedPatterns.includes(name);
                  return (
                    <div key={name} className="rounded-lg bg-slate-700/50 overflow-hidden">
                      <button
                        onClick={() => togglePattern(name)}
                        className="w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium flex-1 truncate">{name}</span>
                          <span
                            className={`text-xs flex-shrink-0 ${
                              solved === total && total > 0 ? 'text-green-400' : 'text-slate-500'
                            }`}
                          >
                            {solved}/{total}
                          </span>
                          <svg
                            className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              solved === total && total > 0
                                ? 'bg-green-500'
                                : solved > 0
                                ? 'bg-indigo-500'
                                : 'bg-slate-600'
                            }`}
                            style={{ width: `${total > 0 ? (solved / total) * 100 : 0}%` }}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-1.5 pb-1.5 space-y-0.5">
                          {algorithms.map((algorithm) => (
                            <AlgorithmRow key={algorithm.id} algorithm={algorithm} showCategory />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
          {/* Topics view — grouped by what the input IS, which cuts across categories */}
          {viewMode === 'topics' && (() => {
            const stats = getTopicStats(visible, solvedProblems);
            return (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 leading-snug px-1 mb-1">
                  Grouped by what the input is, not where it sits in the curriculum. A problem can
                  appear in more than one topic.
                </p>
                {stats.map(({ id, name, icon, blurb, total, solved, algorithms }) => {
                  const isExpanded = expandedTopics.includes(id);
                  return (
                    <div key={id} className="rounded-lg bg-slate-700/50 overflow-hidden">
                      <button
                        onClick={() => toggleTopic(id)}
                        title={blurb}
                        className="w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex-shrink-0">{icon}</span>
                          <span className="text-sm font-medium flex-1 truncate">{name}</span>
                          <span
                            className={`text-xs flex-shrink-0 ${
                              solved === total && total > 0 ? 'text-green-400' : 'text-slate-500'
                            }`}
                          >
                            {solved}/{total}
                          </span>
                          <svg
                            className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              solved === total && total > 0
                                ? 'bg-green-500'
                                : solved > 0
                                ? 'bg-indigo-500'
                                : 'bg-slate-600'
                            }`}
                            style={{ width: `${total > 0 ? (solved / total) * 100 : 0}%` }}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-1.5 pb-1.5 space-y-0.5">
                          {algorithms.map((algorithm) => (
                            <AlgorithmRow key={algorithm.id} algorithm={algorithm} showCategory />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
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
