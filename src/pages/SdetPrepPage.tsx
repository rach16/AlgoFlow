import { useMemo, useState } from 'react';
import { metaCategories } from '../algorithms/manifest';
import { useVisualizerStore } from '../store/visualizerStore';
import { useProgressStore } from '../store/progressStore';
import {
  SDET_QUESTIONS,
  SDET_TIERS,
  SDET_NON_DSA_TOPICS,
  SDET_SOURCES,
  type SdetTier,
} from '../data/sdetPrep';
import type { AlgorithmMeta } from '../algorithms/manifestTypes';

interface SdetPrepPageProps {
  /** open a problem in the visualizer */
  onOpenAlgorithm: () => void;
}

const DIFFICULTY_BADGE: Record<string, string> = {
  Easy: 'bg-green-500/20 text-green-400',
  Medium: 'bg-yellow-500/20 text-yellow-400',
  Hard: 'bg-red-500/20 text-red-400',
};

export function SdetPrepPage({ onOpenAlgorithm }: SdetPrepPageProps) {
  const { selectAlgorithm } = useVisualizerStore();
  const { solvedProblems } = useProgressStore();
  const [showSources, setShowSources] = useState(false);

  // Resolve curated ids against the real algorithm list once.
  const { rows, unresolved } = useMemo(() => {
    const byId = new Map<string, AlgorithmMeta>();
    for (const c of metaCategories) for (const a of c.algorithms) byId.set(a.id, a);
    const rows = SDET_QUESTIONS.flatMap((entry) => {
      const algorithm = byId.get(entry.id);
      return algorithm ? [{ ...entry, algorithm }] : [];
    });
    const unresolved = SDET_QUESTIONS.filter((e) => !byId.has(e.id)).map((e) => e.id);
    return { rows, unresolved };
  }, []);

  const open = (algorithm: AlgorithmMeta) => {
    void selectAlgorithm(algorithm.id);
    onOpenAlgorithm();
  };

  const solvedCount = rows.filter((r) => solvedProblems.includes(r.id)).length;
  const byTier = (tier: SdetTier) => rows.filter((r) => r.tier === tier);

  const difficultyMix = ['Easy', 'Medium', 'Hard'].map((d) => ({
    difficulty: d,
    count: rows.filter((r) => r.algorithm.difficulty === d).length,
  }));

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        {/* Intro */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-xl font-bold mb-1">SDET interview prep</h2>
          <p className="text-sm text-slate-400 mb-4">
            {rows.length} problems from the {metaCategories.reduce((n, c) => n + c.algorithms.length, 0)} in
            AlgoFlow, filtered and ranked for Software Development Engineer in Test loops.
          </p>

          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            {difficultyMix.map(({ difficulty, count }) => (
              <span
                key={difficulty}
                className={`px-2 py-0.5 rounded font-medium ${DIFFICULTY_BADGE[difficulty]}`}
              >
                {count} {difficulty}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded font-medium bg-slate-700 text-slate-300">
              {solvedCount} / {rows.length} marked solved
            </span>
          </div>

          <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${rows.length ? (solvedCount / rows.length) * 100 : 0}%` }}
            />
          </div>

          {/* Honest framing about what this ranking is and isn't */}
          <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-3 text-xs text-slate-400 leading-relaxed">
            <p className="mb-2">
              <span className="text-slate-200 font-medium">How this is ranked.</span> No company
              publishes per-question frequency data for SDET interviews, so these tiers are not
              measured statistics. They are a synthesis of publicly reported SDET interview
              experiences, SDET-specific prep guides and company interview pages — problems that
              multiple independent sources named are ranked higher. Read the tiers as{' '}
              <em>how consistently this shows up in reports</em>.
            </p>
            <p>
              The consistent signal across those sources: SDET coding rounds skew to{' '}
              <span className="text-slate-200">Easy and lower-Medium</span>, lean on strings,
              frequency maps, two pointers and basic linked-list / tree work, and rarely touch
              advanced DP or graph algorithms. Interviewers weight edge-case reasoning, clean
              compilable code and spoken complexity analysis above finding a clever optimum.
            </p>
            <button
              onClick={() => setShowSources(!showSources)}
              className="mt-2 text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {showSources ? 'Hide sources' : `Show ${SDET_SOURCES.length} sources`}
            </button>
            {showSources && (
              <ul className="mt-2 space-y-1">
                {SDET_SOURCES.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 underline break-all"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Tiers */}
        {SDET_TIERS.map((tier) => {
          const tierRows = byTier(tier.id);
          if (tierRows.length === 0) return null;
          const tierSolved = tierRows.filter((r) => solvedProblems.includes(r.id)).length;

          return (
            <div key={tier.id} className="bg-slate-800 rounded-xl p-5">
              <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                <h3 className={`text-lg font-bold ${tier.accent}`}>{tier.label}</h3>
                <span className="text-xs text-slate-500">
                  {tierSolved} / {tierRows.length} solved
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4">{tier.blurb}</p>

              <div className="flex flex-col gap-1.5">
                {tierRows.map(({ id, why, algorithm }) => {
                  const isSolved = solvedProblems.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => open(algorithm)}
                      className="w-full text-left bg-slate-700/40 hover:bg-slate-700 rounded-lg px-3 py-2.5 transition-colors group"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        {isSolved && (
                          <svg
                            className="w-4 h-4 text-green-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                        <span className="font-medium group-hover:text-white">
                          {algorithm.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            DIFFICULTY_BADGE[algorithm.difficulty]
                          }`}
                        >
                          {algorithm.difficulty}
                        </span>
                        <span className="text-xs text-slate-500">{algorithm.category}</span>
                        <span className="ml-auto text-xs text-slate-500 group-hover:text-indigo-400 flex-shrink-0">
                          Open →
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{why}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* What this list does not cover */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h3 className="text-lg font-bold mb-1">What this list does not cover</h3>
          <p className="text-sm text-slate-400 mb-3">
            Roughly half of an SDET loop is not algorithms. AlgoFlow can not help with these, but
            do not walk in having only ground DSA:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-slate-300">
            {SDET_NON_DSA_TOPICS.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-slate-600">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Surfaces a curation/data mismatch instead of silently dropping rows */}
        {unresolved.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm">
            <p className="text-red-300 font-medium mb-1">
              {unresolved.length} curated {unresolved.length === 1 ? 'entry' : 'entries'} could not
              be matched to a problem
            </p>
            <p className="text-red-200/80 text-xs font-mono break-all">{unresolved.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
