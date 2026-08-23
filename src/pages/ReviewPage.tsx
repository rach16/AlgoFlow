import { useMemo } from 'react';
import { metaCategories } from '../algorithms/manifest';
import { useVisualizerStore } from '../store/visualizerStore';
import { useProgressStore, selectDue, selectUpcoming } from '../store/progressStore';
import { dueLabel, INTERVALS_DAYS, type ReviewRecord } from '../utils/review';
import { useNow } from '../utils/useNow';
import type { AlgorithmMeta } from '../algorithms/manifestTypes';
import { useFilterStore } from '../store/filterStore';
import { matchesAudience } from '../utils/audienceFilter';
import { AUDIENCES } from '../data/audiences';
import { useStoryStore } from '../store/storyStore';
import { isStoryReviewId, storyIdFromReviewId, storyTitleFor } from '../utils/stories';

interface ReviewPageProps {
  onOpenAlgorithm: () => void;
}

const DIFFICULTY_DOT: Record<string, string> = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-red-500',
};

const LAST_BADGE: Record<string, string> = {
  again: 'bg-red-500/20 text-red-300',
  hard: 'bg-orange-500/20 text-orange-300',
  good: 'bg-green-500/20 text-green-300',
  easy: 'bg-indigo-500/20 text-indigo-300',
};

export function ReviewPage({ onOpenAlgorithm }: ReviewPageProps) {
  const { selectAlgorithm } = useVisualizerStore();
  const { reviews, solvedProblems, clearReview } = useProgressStore();
  const { audiences } = useFilterStore();
  const { stories } = useStoryStore();
  const now = useNow();

  const byId = useMemo(() => {
    const m = new Map<string, AlgorithmMeta>();
    for (const c of metaCategories) for (const a of c.algorithms) m.set(a.id, a);
    return m;
  }, []);

  // The sidebar's audience filter applies here too, so "revise the staffing set" narrows the
  // queue rather than only the catalogue. A queued problem whose metadata has since disappeared
  // stays visible — dropping it silently would hide a real data problem.
  const inScope = (id: string) => {
    // Stories are behavioral prep, so no audience tag applies — the filter is about problems.
    if (isStoryReviewId(id)) return true;
    const algorithm = byId.get(id);
    return !algorithm || matchesAudience(algorithm.audiences, audiences);
  };
  const due = selectDue(reviews, now).filter(({ id }) => inScope(id));
  const upcoming = selectUpcoming(reviews, now).filter(({ id }) => inScope(id));
  const rated = Object.keys(reviews).length;
  const hiddenByFilter =
    audiences.length === 0
      ? 0
      : selectDue(reviews, now).length + selectUpcoming(reviews, now).length - due.length - upcoming.length;

  const open = (algorithm: AlgorithmMeta) => {
    void selectAlgorithm(algorithm.id);
    onOpenAlgorithm();
  };

  const Row = ({ id, record }: { id: string; record: ReviewRecord }) => {
    // The queue holds two kinds of thing: problems, and behavioral stories under a `story:` id.
    if (isStoryReviewId(id)) {
      return (
        <div className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/40 text-left">
          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-purple-400" />
          <span className="flex-1 min-w-0">
            <span className="block text-sm truncate">
              {storyTitleFor(stories, storyIdFromReviewId(id))}
            </span>
            <span className="block text-xs text-slate-500">
              Behavioral story — retell it out loud
            </span>
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${
              LAST_BADGE[record.last]
            }`}
          >
            {record.last}
          </span>
          <span className="text-xs text-slate-400 flex-shrink-0 w-28 text-right">
            {dueLabel(record, now)}
          </span>
        </div>
      );
    }

    const algorithm = byId.get(id);
    if (!algorithm) return null; // a problem that no longer exists
    return (
      <button
        onClick={() => open(algorithm)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/40 hover:bg-slate-700 transition-colors text-left"
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DIFFICULTY_DOT[algorithm.difficulty]}`} />
        <span className="flex-1 min-w-0">
          <span className="block truncate text-sm leading-tight">{algorithm.name}</span>
          <span className="block truncate text-[10px] text-slate-500 leading-tight">
            {algorithm.category} · box {record.streak} · {record.reviews} review
            {record.reviews === 1 ? '' : 's'}
          </span>
        </span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${LAST_BADGE[record.last]}`}>
          {record.last}
        </span>
        <span className="text-xs text-slate-400 flex-shrink-0 w-28 text-right">
          {dueLabel(record, now)}
        </span>
      </button>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-xl font-bold mb-1">Review queue</h2>
          <p className="text-sm text-slate-400 mb-4">
            Rate a problem after solving it and it comes back on a schedule — sooner if you
            struggled, much later if it was easy. Everything is stored locally in this browser.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-medium">
              {due.length} due now
            </span>
            <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">
              {upcoming.length} scheduled
            </span>
            <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">
              {rated} rated of {solvedProblems.length} solved
            </span>
            {audiences.length > 0 && (
              <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                {audiences
                  .map((a) => AUDIENCES.find((x) => x.id === a)?.label ?? a)
                  .join(' + ')}
                {hiddenByFilter > 0 && ` · ${hiddenByFilter} hidden`}
              </span>
            )}
          </div>
        </div>

        {rated === 0 ? (
          <div className="bg-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-400">
              Nothing rated yet. Open any problem and use the{' '}
              <span className="text-slate-200">How did that go?</span> buttons under the info bar —
              the first rating schedules it, and it will show up here when it is due.
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Intervals climb {INTERVALS_DAYS.join(', ')} days as you keep rating a problem
              “Good”. “Again” sends it back to the start.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-slate-800 rounded-xl p-5">
              <h3 className="text-lg font-bold text-indigo-400 mb-1">Due now</h3>
              <p className="text-sm text-slate-400 mb-3">
                {due.length === 0
                  ? 'Nothing due — come back when the next one ripens.'
                  : 'Most overdue first. Re-solve, then rate again.'}
              </p>
              <div className="flex flex-col gap-1.5">
                {due.map(({ id, record }) => (
                  <Row key={id} id={id} record={record} />
                ))}
              </div>
            </div>

            {upcoming.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-bold mb-1">Scheduled</h3>
                <p className="text-sm text-slate-400 mb-3">Soonest first.</p>
                <div className="flex flex-col gap-1.5">
                  {upcoming.map(({ id, record }) => (
                    <Row key={id} id={id} record={record} />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500">
                Rated a problem by mistake? Open it and rate it again — or{' '}
                <button
                  onClick={() => due.concat(upcoming).forEach(({ id }) => clearReview(id))}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  clear the whole schedule
                </button>
                . Solved marks are kept either way.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
