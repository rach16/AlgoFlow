import { useEffect, useMemo, useRef, useState } from 'react';
import { metaCategories } from '../../algorithms/manifest';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useProgressStore } from '../../store/progressStore';
import { TOPICS } from '../../utils/topics';
import type { AlgorithmMeta } from '../../algorithms/manifestTypes';
import { REFERENCE_ENTRIES, type ReferenceEntry } from '../../utils/searchIndex';
import type { AppView } from '../layout/navigation';

interface SearchPaletteProps {
  onClose: () => void;
  /** Called with the view the picked result lives in, so the shell can switch to it. */
  onPick: (view: AppView) => void;
}

/**
 * Two kinds of result. A problem opens in the visualizer and carries its own metadata; a reference
 * entry just switches the view. They share a `title` and a `haystack` so one scorer ranks both,
 * which is what lets "flaky" surface a problem, a flake scenario and a CI rule in one list.
 */
type Entry =
  | {
      type: 'problem';
      id: string;
      title: string;
      haystack: string;
      algorithm: AlgorithmMeta;
      category: string;
      pattern: string;
    }
  | { type: 'reference'; id: string; title: string; haystack: string; reference: ReferenceEntry };

const DIFFICULTY_BADGE: Record<string, string> = {
  Easy: 'bg-green-500/20 text-green-400',
  Medium: 'bg-yellow-500/20 text-yellow-400',
  Hard: 'bg-red-500/20 text-red-400',
};

const MAX_RESULTS = 50;

/**
 * Ranks a candidate against the query. Higher is better, 0 means no match.
 *
 * Every whitespace-separated token must appear somewhere, so "islands graph" and
 * "graph islands" both work. Where the token appears decides the rank: a match on the
 * problem name beats one on its category or pattern, and a prefix beats a mid-word hit.
 */
function score(entry: Entry, tokens: string[]): number {
  const name = entry.title.toLowerCase();
  let total = 0;
  for (const t of tokens) {
    if (name.startsWith(t)) total += 100;
    else if (name.includes(` ${t}`)) total += 60; // start of a later word
    else if (name.includes(t)) total += 40;
    else if (entry.haystack.includes(t)) total += 10;
    else return 0; // every token has to land somewhere
  }
  // Nudge shorter names up, so "Two Sum" outranks "Two Sum II" for the query "two sum".
  // Problems win ties: with 254 of them against ~120 reference entries, an unqualified query is
  // far more often someone looking for a problem.
  return total * 1000 - name.length + (entry.type === 'problem' ? 1 : 0);
}

export function SearchPalette({ onClose, onPick }: SearchPaletteProps) {
  const { selectAlgorithm } = useVisualizerStore();
  const { solvedProblems } = useProgressStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const entries = useMemo<Entry[]>(() => {
    const topicName = new Map(TOPICS.map((t) => [t.id, t.name]));
    const problems: Entry[] = metaCategories.flatMap((c) =>
      c.algorithms.map((algorithm) => {
        const pattern = algorithm.patternName;
        const topics = algorithm.topics.map((id) => topicName.get(id) ?? id).join(' ');
        return {
          type: 'problem' as const,
          id: algorithm.id,
          title: algorithm.name,
          algorithm,
          category: c.name,
          pattern,
          haystack: [algorithm.name, c.name, pattern, topics, algorithm.difficulty]
            .join(' ')
            .toLowerCase(),
        };
      })
    );
    const references: Entry[] = REFERENCE_ENTRIES.map((reference) => ({
      type: 'reference' as const,
      id: reference.id,
      title: reference.title,
      haystack: reference.haystack,
      reference,
    }));
    return [...problems, ...references];
  }, []);

  const results = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return entries.slice(0, MAX_RESULTS);
    return entries
      .map((e) => ({ e, s: score(e, tokens) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, MAX_RESULTS)
      .map((x) => x.e);
  }, [entries, query]);

  // Focus on mount. The parent only mounts this while open, so query and selection reset
  // on close for free — no state-resetting effects needed.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the highlighted row visible while arrowing through a long list.
  useEffect(() => {
    listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selected, results]);

  const pick = (entry: Entry) => {
    if (entry.type === 'problem') {
      void selectAlgorithm(entry.algorithm.id);
      onPick('visualizer');
    } else {
      onPick(entry.reference.view);
    }
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = results[selected];
      if (hit) pick(hit);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search problems and reference"
      >
        <div className="flex items-center gap-2 px-4 border-b border-slate-700">
          <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search problems, exercises and reference…"
            aria-label="Search problems and reference"
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-500"
          />
          <kbd className="text-[10px] text-slate-500 border border-slate-600 rounded px-1.5 py-0.5 flex-shrink-0">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <p className="text-sm text-slate-500 italic px-3 py-6 text-center">
              Nothing matches “{query}”.
            </p>
          ) : (
            results.map((entry, i) => {
              const isSelected = i === selected;
              const row = `w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                isSelected ? 'bg-indigo-600/90 text-white' : 'text-slate-300'
              }`;
              const sub = `block truncate text-[10px] leading-tight ${
                isSelected ? 'text-indigo-200' : 'text-slate-500'
              }`;

              if (entry.type === 'reference') {
                const { reference } = entry;
                return (
                  <button
                    key={entry.id}
                    data-selected={isSelected}
                    onMouseEnter={() => setSelected(i)}
                    onClick={() => pick(entry)}
                    className={row}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0 bg-slate-600" />
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-sm leading-tight">{entry.title}</span>
                      <span className={sub}>{reference.subtitle}</span>
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${
                        isSelected ? 'bg-white/15 text-white' : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {reference.section}
                    </span>
                  </button>
                );
              }

              const { algorithm } = entry;
              return (
                <button
                  key={entry.id}
                  data-selected={isSelected}
                  onMouseEnter={() => setSelected(i)}
                  onClick={() => pick(entry)}
                  className={row}
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
                    <span className="block truncate text-sm leading-tight">{algorithm.name}</span>
                    <span className={sub}>
                      {entry.category} · {entry.pattern}
                    </span>
                  </span>
                  {solvedProblems.includes(algorithm.id) && (
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${
                      isSelected ? 'bg-white/15 text-white' : DIFFICULTY_BADGE[algorithm.difficulty]
                    }`}
                  >
                    {algorithm.difficulty}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-3 px-4 py-2 border-t border-slate-700 text-[10px] text-slate-500">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span className="ml-auto">
            {results.length}
            {results.length === MAX_RESULTS ? '+' : ''} result{results.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </div>
  );
}
