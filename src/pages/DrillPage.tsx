import { useEffect, useMemo, useRef, useState } from 'react';
import { metaCategories } from '../algorithms/manifest';
import { loadAlgorithm } from '../algorithms/registry';
import { useDrillStore } from '../store/drillStore';
import { useFilterStore } from '../store/filterStore';
import { useVisualizerStore } from '../store/visualizerStore';
import { filterByAudience } from '../utils/audienceFilter';
import { useNow } from '../utils/useNow';
import {
  DRILL_PRESETS,
  OUTCOME_META,
  formatClock,
  mostRecent,
  pickProblems,
  remainingMs,
  summarise,
  type DrillOutcome,
} from '../utils/drill';
import type { Algorithm } from '../types/algorithm';
import type { AlgorithmMeta } from '../algorithms/manifestTypes';

interface DrillPageProps {
  onOpenAlgorithm: () => void;
}

const DIFFICULTIES = ['Any', 'Easy', 'Medium', 'Hard'] as const;
type DifficultyChoice = (typeof DIFFICULTIES)[number];

const DIFFICULTY_BADGE: Record<string, string> = {
  Easy: 'bg-green-500/20 text-green-400',
  Medium: 'bg-yellow-500/20 text-yellow-400',
  Hard: 'bg-red-500/20 text-red-400',
};

const OUTCOME_BADGE: Record<DrillOutcome, string> = {
  solved: 'bg-green-500/20 text-green-300 border-green-500/40',
  partial: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  missed: 'bg-red-500/20 text-red-300 border-red-500/40',
};

export function DrillPage({ onOpenAlgorithm }: DrillPageProps) {
  const { active, history, start, setCode, goTo, finish, commit, abandon, clearHistory } =
    useDrillStore();
  const { audiences } = useFilterStore();
  const { selectAlgorithm, language } = useVisualizerStore();
  // One-second resolution, because this is a countdown rather than a "3 days ago" label.
  const now = useNow(1000);

  const [difficulty, setDifficulty] = useState<DifficultyChoice>('Medium');
  const [presetId, setPresetId] = useState(DRILL_PRESETS[0].id);
  const [outcomes, setOutcomes] = useState<Record<string, DrillOutcome>>({});
  const [loaded, setLoaded] = useState<Record<string, Algorithm>>({});
  const [loadFailed, setLoadFailed] = useState<string | null>(null);

  const byId = useMemo(() => {
    const m = new Map<string, AlgorithmMeta>();
    for (const c of metaCategories) for (const a of c.algorithms) m.set(a.id, a);
    return m;
  }, []);

  // The pool respects the audience filter, so "drill the staffing set" works without new controls.
  const pool = useMemo(() => {
    const scoped = filterByAudience(metaCategories, audiences).flatMap((c) => c.algorithms);
    return difficulty === 'Any' ? scoped : scoped.filter((a) => a.difficulty === difficulty);
  }, [audiences, difficulty]);

  const preset = DRILL_PRESETS.find((p) => p.id === presetId) ?? DRILL_PRESETS[0];
  const stats = summarise(history);

  // A drill needs the description, which the manifest deliberately omits — so each problem's
  // module is fetched on demand, exactly as the visualizer does it. The ref records what has
  // already been asked for, which means this effect can depend on the whole session (it changes on
  // every keystroke) without ever issuing a duplicate request.
  const requested = useRef(new Set<string>());
  useEffect(() => {
    if (!active) return;
    for (const id of active.problemIds) {
      if (requested.current.has(id)) continue;
      requested.current.add(id);
      loadAlgorithm(id)
        .then((algorithm) => setLoaded((prev) => ({ ...prev, [id]: algorithm })))
        .catch((err: unknown) =>
          setLoadFailed(err instanceof Error ? err.message : String(err))
        );
    }
  }, [active]);

  const beginSession = () => {
    const picked = pickProblems(pool, preset.problems);
    if (picked.length === 0) return;
    setOutcomes({});
    setLoadFailed(null);
    start(
      picked.map((p) => p.id),
      preset.minutes * 60_000,
      Date.now()
    );
  };

  const openInVisualizer = (id: string) => {
    void selectAlgorithm(id);
    onOpenAlgorithm();
  };

  /* ---------------------------------------------------------------- setup */

  if (!active) {
    return (
      <div className="h-full overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="bg-slate-800 rounded-xl p-5">
            <h2 className="text-xl font-bold mb-1">Timed drill</h2>
            <p className="text-sm text-slate-400 mb-4">
              The visualizer teaches you why an algorithm works. This measures whether you can
              produce one cold, on a clock, with nothing helping you — no visualization, no line
              explanations, no autocomplete. That is the thing a coding round actually tests.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Format
                </span>
                <div className="flex flex-col gap-1.5">
                  {DRILL_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPresetId(p.id)}
                      aria-pressed={p.id === presetId}
                      className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                        p.id === presetId
                          ? 'bg-indigo-500/15 border-indigo-500/50'
                          : 'bg-slate-700/40 border-transparent hover:bg-slate-700'
                      }`}
                    >
                      <span className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium">{p.label}</span>
                        <span className="text-xs font-mono text-slate-400">
                          {p.problems} × {p.minutes} min
                        </span>
                      </span>
                      <span className="block text-xs text-slate-400 mt-0.5">{p.source}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Difficulty
                </span>
                <div className="flex flex-wrap gap-1">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      aria-pressed={d === difficulty}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        d === difficulty
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Drawing from <span className="text-slate-300 font-mono">{pool.length}</span>{' '}
                  problems
                  {audiences.length > 0 && ' in the current audience filter'}. Medium is the default
                  because that is where big-tech coding rounds sit.
                </p>
              </div>

              <button
                onClick={beginSession}
                disabled={pool.length === 0}
                className="self-start px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Start {preset.problems === 1 ? 'the problem' : `${preset.problems} problems`} ·{' '}
                {preset.minutes} min
              </button>
              {pool.length === 0 && (
                <p className="text-xs text-red-300">
                  Nothing matches that difficulty inside the current audience filter. Widen either
                  one.
                </p>
              )}
            </div>
          </div>

          {/* History */}
          <div className="bg-slate-800 rounded-xl p-5">
            <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
              <h3 className="text-lg font-bold">Your record</h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear history
                </button>
              )}
            </div>

            {stats.attempted === 0 ? (
              <p className="text-sm text-slate-400">
                Nothing yet. Sit one session and the pass rate starts here — the number worth
                watching over weeks, not the result of any single attempt.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 text-xs mb-4">
                  <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                    {Math.round(stats.rate * 100)}% solved
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">
                    {stats.sessions} {stats.sessions === 1 ? 'session' : 'sessions'}
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">
                    {stats.solved} solved · {stats.partial} partial · {stats.missed} missed
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {mostRecent(history, 8).map((s) => (
                    <div
                      key={s.finishedAt}
                      className="flex items-center gap-2 flex-wrap px-3 py-2 rounded-lg bg-slate-700/40 text-sm"
                    >
                      <span className="text-xs font-mono text-slate-500 w-16 shrink-0">
                        {formatClock(s.finishedAt - s.startedAt)}
                      </span>
                      {s.attempts.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => openInVisualizer(a.id)}
                          className={`px-2 py-0.5 rounded border text-xs ${OUTCOME_BADGE[a.outcome]}`}
                          title={`${byId.get(a.id)?.name ?? a.id} — ${a.outcome}. Open in AlgoFlow.`}
                        >
                          {byId.get(a.id)?.name ?? a.id}
                        </button>
                      ))}
                      <span className="ml-auto text-xs text-slate-500 font-mono shrink-0">
                        limit {s.limitMs / 60_000}m
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- grading */

  if (active.finishedAt) {
    const graded = active.problemIds.every((id) => outcomes[id]);
    return (
      <div className="h-full overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="bg-slate-800 rounded-xl p-5">
            <h2 className="text-xl font-bold mb-1">How did it go?</h2>
            <p className="text-sm text-slate-400">
              Nothing here runs your code, so this is your own call — and the pass rate is only
              worth anything if you grade honestly. Took{' '}
              <span className="text-slate-200 font-mono">
                {formatClock(active.finishedAt - active.startedAt)}
              </span>{' '}
              of {active.limitMs / 60_000} minutes.
            </p>
          </div>

          {active.problemIds.map((id) => {
            const algorithm = loaded[id];
            const info = byId.get(id);
            return (
              <div key={id} className="bg-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <h3 className="font-bold">{info?.name ?? id}</h3>
                  {info && (
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        DIFFICULTY_BADGE[info.difficulty]
                      }`}
                    >
                      {info.difficulty}
                    </span>
                  )}
                  <button
                    onClick={() => openInVisualizer(id)}
                    className="ml-auto text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Open in AlgoFlow →
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {OUTCOME_META.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setOutcomes((prev) => ({ ...prev, [id]: o.id }))}
                      aria-pressed={outcomes[id] === o.id}
                      title={o.hint}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        outcomes[id] === o.id
                          ? OUTCOME_BADGE[o.id]
                          : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      What you wrote
                    </span>
                    <pre className="text-xs font-mono bg-slate-900/60 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto text-slate-300">
                      {active.codeById[id]?.trim() || '(nothing)'}
                    </pre>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Reference · {language}
                    </span>
                    <pre className="text-xs font-mono bg-slate-900/60 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto text-slate-300">
                      {algorithm ? algorithm.code[language].trim() : 'Loading…'}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => commit(outcomes)}
              disabled={!graded}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {graded ? 'Save session' : 'Grade every problem to save'}
            </button>
            <button
              onClick={abandon}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm transition-colors"
            >
              Discard without saving
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- running */

  const currentId = active.problemIds[active.index];
  const current = loaded[currentId];
  const info = byId.get(currentId);
  const left = remainingMs(active, now);
  const overtime = left < 0;
  const nearlyUp = !overtime && left < 5 * 60_000;

  return (
    <div className="h-full flex flex-col">
      {/* Clock bar */}
      <div className="shrink-0 flex items-center gap-3 flex-wrap px-4 py-2.5 bg-slate-800 border-b border-slate-700">
        <span
          className={`font-mono text-lg font-bold tabular-nums ${
            overtime ? 'text-red-400' : nearlyUp ? 'text-yellow-400' : 'text-slate-200'
          }`}
          aria-label={overtime ? 'time over by' : 'time remaining'}
        >
          {formatClock(left)}
        </span>
        {overtime && <span className="text-xs text-red-300">over — wrap it up</span>}

        <span className="text-xs text-slate-500 font-mono">
          {active.index + 1} / {active.problemIds.length}
        </span>

        <div className="flex gap-1 ml-auto">
          {active.problemIds.map((id, i) => (
            <button
              key={id}
              onClick={() => goTo(i)}
              aria-current={i === active.index ? 'true' : undefined}
              className={`w-7 h-7 rounded text-xs font-mono transition-colors ${
                i === active.index
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
              title={byId.get(id)?.name ?? id}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => finish(Date.now())}
            className="ml-2 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium transition-colors"
          >
            Finish
          </button>
        </div>
      </div>

      {loadFailed && (
        <div className="shrink-0 px-4 py-2 bg-red-500/10 border-b border-red-500/30 text-xs text-red-200">
          A problem failed to load: {loadFailed}
        </div>
      )}

      {/* Problem + editor */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        <div className="lg:w-2/5 shrink-0 overflow-y-auto p-4 border-b lg:border-b-0 lg:border-r border-slate-700">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h2 className="font-bold">{info?.name ?? currentId}</h2>
            {info && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  DIFFICULTY_BADGE[info.difficulty]
                }`}
              >
                {info.difficulty}
              </span>
            )}
          </div>
          {/* Deliberately just the statement — no pattern hint, no complexity, no approach tabs. */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {current ? current.description : 'Loading the problem…'}
          </p>
          <p className="mt-4 text-xs text-slate-500">
            No hints here on purpose. Say your complexity out loud as you go — that is scored too.
          </p>
        </div>

        <div className="flex-1 min-h-0 p-4">
          <label htmlFor="drill-editor" className="sr-only">
            Your solution
          </label>
          <textarea
            id="drill-editor"
            value={active.codeById[currentId] ?? ''}
            onChange={(e) => setCode(currentId, e.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder={`# ${info?.name ?? ''}\n# Plain editor. No autocomplete, no formatting, no hints.`}
            className="w-full h-full min-h-[16rem] resize-none bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60"
          />
        </div>
      </div>
    </div>
  );
}
