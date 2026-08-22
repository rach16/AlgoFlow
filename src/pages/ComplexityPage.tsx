import { useMemo, useState } from 'react';
import { metaCategories } from '../algorithms/manifest';
import { useVisualizerStore } from '../store/visualizerStore';
import { COMPLEXITY_METHOD, COMPLEXITY_NOTES } from '../data/complexity';
import { noteKey } from '../data/complexityTypes';
import { DerivationBody } from '../components/common/DerivationBody';
import type { AlgorithmMeta } from '../algorithms/manifestTypes';

interface ComplexityPageProps {
  onOpenAlgorithm: () => void;
}

const DIFFICULTY_BADGE: Record<string, string> = {
  Easy: 'bg-green-500/20 text-green-400',
  Medium: 'bg-yellow-500/20 text-yellow-400',
  Hard: 'bg-red-500/20 text-red-400',
};

export function ComplexityPage({ onOpenAlgorithm }: ComplexityPageProps) {
  const { selectAlgorithm } = useVisualizerStore();
  const [openMethod, setOpenMethod] = useState<string | null>(COMPLEXITY_METHOD[0]?.id ?? null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [onlyWithNotes, setOnlyWithNotes] = useState(true);
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const all = metaCategories.flatMap((c) =>
      c.algorithms.map((algorithm) => {
        const approaches = algorithm.approaches;
        const withNotes = approaches.filter((a) => COMPLEXITY_NOTES[noteKey(algorithm.id, a.id)]);
        return { algorithm, approaches, noteCount: withNotes.length, category: c.name };
      })
    );
    return all;
  }, []);

  const covered = rows.reduce((n, r) => n + r.noteCount, 0);
  const totalApproaches = rows.reduce((n, r) => n + r.approaches.length, 0);

  const visible = rows.filter((r) => {
    if (onlyWithNotes && r.noteCount === 0) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return r.algorithm.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
  });

  const open = (algorithm: AlgorithmMeta) => {
    void selectAlgorithm(algorithm.id);
    onOpenAlgorithm();
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        {/* Method — the transferable part */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-xl font-bold mb-1">How to work out complexity</h2>
          <p className="text-sm text-slate-400 mb-4">
            Most resources state the bound and move on. This is the derivation: how to get from
            code to O(something) yourself, and the traps that produce wrong answers.
          </p>

          <div className="flex flex-col gap-2">
            {COMPLEXITY_METHOD.map((section) => {
              const isOpen = openMethod === section.id;
              return (
                <div key={section.id} className="bg-slate-700/40 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenMethod(isOpen ? null : section.id)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-700 transition-colors"
                  >
                    <span className="font-medium flex-1">{section.title}</span>
                    <svg
                      className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1">
                      <p className="text-sm text-slate-300 mb-3">{section.intro}</p>

                      {section.rows && (
                        <div className="overflow-x-auto mb-3">
                          <table className="w-full text-sm border-collapse">
                            <tbody>
                              {section.rows.map((row, i) => (
                                <tr key={i} className="border-t border-slate-700/60">
                                  <td className="py-2 pr-4 align-top font-mono text-xs text-indigo-300 whitespace-nowrap">
                                    {row.left}
                                  </td>
                                  <td className="py-2 text-slate-300">{row.right}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {section.notes?.map((para, i) => (
                        <p key={i} className="text-sm text-slate-400 mb-2 leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-problem derivations */}
        <div className="bg-slate-800 rounded-xl p-5">
          <div className="flex items-baseline gap-3 flex-wrap mb-1">
            <h2 className="text-xl font-bold">Per-problem derivations</h2>
            <span className="text-xs text-slate-500">
              {covered} of {totalApproaches} approaches have a written derivation
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Worked derivations for individual problems. Where one is not written yet the stated
            bound is still shown — use the method above to derive it, then check yourself against
            the animation.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by problem or category…"
              className="flex-1 min-w-[200px] bg-slate-700/60 rounded-lg px-3 py-1.5 text-sm placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              onClick={() => setOnlyWithNotes(!onlyWithNotes)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                onlyWithNotes ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {onlyWithNotes ? 'With derivations only' : 'Showing all problems'}
            </button>
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No problems match that filter.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {visible.map(({ algorithm, approaches, noteCount, category }) => {
                const isOpen = expanded === algorithm.id;
                return (
                  <div key={algorithm.id} className="bg-slate-700/40 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpanded(isOpen ? null : algorithm.id)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-700 transition-colors flex-wrap"
                    >
                      <span className="font-medium">{algorithm.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          DIFFICULTY_BADGE[algorithm.difficulty]
                        }`}
                      >
                        {algorithm.difficulty}
                      </span>
                      <span className="text-xs text-slate-500">{category}</span>
                      {noteCount === 0 && (
                        <span className="text-xs text-slate-600 italic">derivation pending</span>
                      )}
                      <span className="ml-auto flex items-center gap-3 flex-shrink-0">
                        <span className="font-mono text-xs text-slate-400">
                          {algorithm.timeComplexity} / {algorithm.spaceComplexity}
                        </span>
                        <svg
                          className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-3 pb-3 flex flex-col gap-3">
                        {approaches.map((approach) => {
                          const note = COMPLEXITY_NOTES[noteKey(algorithm.id, approach.id)];
                          return (
                            <div key={approach.id} className="bg-slate-800/60 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="text-sm font-medium text-indigo-300">
                                  {approach.name}
                                </span>
                                <span className="font-mono text-xs text-slate-400">
                                  {approach.timeComplexity} time · {approach.spaceComplexity} space
                                </span>
                              </div>
                              {note ? (
                                <DerivationBody note={note} />
                              ) : (
                                <p className="text-sm text-slate-500 italic">
                                  Derivation not written yet — the bound above is still accurate.
                                </p>
                              )}
                            </div>
                          );
                        })}
                        <button
                          onClick={() => open(algorithm)}
                          className="self-start text-xs font-medium text-indigo-400 hover:text-indigo-300"
                        >
                          Open in visualizer →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
