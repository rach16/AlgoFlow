import { useState } from 'react';
import {
  CATEGORIES,
  DIMENSIONS,
  EXERCISES,
  METHOD_STEPS,
  type DesignExercise,
  type ExerciseCategory,
  type ExpectedCase,
  type FollowUp,
} from '../data/testDesign';
import { useTestDesignStore } from '../store/testDesignStore';
import { useProgressStore } from '../store/progressStore';
import {
  blindSpots,
  countCases,
  designReviewId,
  latestByExercise,
  scoreAttempt,
  summarise,
  type ActiveDesignAttempt,
  type AttemptScore,
} from '../utils/testDesign';
import { formatClock } from '../utils/drill';
import { CONFIDENCE_META, dueLabel } from '../utils/review';
import { useNow } from '../utils/useNow';

/**
 * "How would you test X?" — enumerate first, compare second.
 *
 * The reveal is one-way and the scoring is yours to do, for the same reason the drill grades
 * itself: nothing here can read your prose, so the only thing that makes the number worth having
 * is that you were honest. The mechanism that matters is the reveal ordering — a reference list
 * read first gets copied, and copying teaches nothing about whether you would have got there.
 *
 * Every component in this file is at module scope. Defining one inside the page gives it a new
 * identity per render, which remounts it on every keystroke and throws away focus — the bug that
 * bit StoryEditor on the behavioral page.
 */

const CARD = 'bg-slate-800 rounded-xl';
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase tracking-wider';

/**
 * A short list of missed dimensions.
 *
 * Unbounded, this is a wall of text exactly when recall is worst — eleven dimension names in one
 * sentence is unreadable, and the first few are the only ones you are going to act on anyway.
 */
function missedLabel(missed: { label: string }[], show = 3): string {
  const names = missed.slice(0, show).map((d) => d.label).join(', ');
  const rest = missed.length - show;
  return rest > 0 ? `${names} +${rest} more` : names;
}

/** Isolated so the per-second tick re-renders a clock and not the textarea beside it. */
function Elapsed({ from }: { from: number }) {
  const now = useNow(1000);
  return <span className="font-mono">{formatClock(Math.max(0, now - from))}</span>;
}

function RecallBar({ score }: { score: AttemptScore }) {
  const pct = Math.round(score.recall * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-24 text-right">
        {score.hit} / {score.total} · {pct}%
      </span>
    </div>
  );
}

function CaseRow({
  expected,
  checked,
  onToggle,
}: {
  expected: ExpectedCase;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex gap-2.5 items-start px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        checked ? 'bg-green-500/10' : 'bg-slate-900/40 hover:bg-slate-700/40'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 accent-green-500 flex-shrink-0"
      />
      <span className="flex-1 text-xs text-slate-300 leading-relaxed">{expected.text}</span>
      {expected.tier === 'credit' && (
        <span className="text-[9px] font-semibold uppercase tracking-wider text-indigo-400/70 flex-shrink-0 mt-0.5">
          Credit
        </span>
      )}
    </label>
  );
}

/**
 * The worked answer, collapsed.
 *
 * A checklist on its own produces a candidate with forty cases and no way to deliver them, so this
 * shows what the answer sounds like out loud — the clarifiers as spoken, the narration over the
 * enumeration, the three you would automate first and where, and the close. Collapsed for the same
 * reason the behavioral examples are: read first it gets recited, read after it calibrates.
 */
const ANSWER_PARTS = [
  { key: 'open', label: 'Open by asking' },
  { key: 'walk', label: 'Then walk it out loud' },
  { key: 'prioritise', label: 'Then prioritise — the part most answers skip' },
  { key: 'close', label: 'And close on how you would know in production' },
] as const;

function WorkedAnswer({ exercise }: { exercise: DesignExercise }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${CARD} p-5`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
      >
        {open ? 'Hide the worked answer' : 'See a worked answer — now that yours is marked'}
      </button>
      {open && (
        <div className="mt-4 flex flex-col gap-3">
          {ANSWER_PARTS.map((part) => (
            <div key={part.key}>
              <span className={LABEL}>{part.label}</span>
              <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                {exercise.modelAnswer[part.key]}
              </p>
            </div>
          ))}
          <p className="text-[11px] text-slate-500">
            Somebody else’s answer, and the content is not the point — the shape is. Notice that it
            names the dimension before listing under it, that it says which cases it would automate
            and at which layer, and that it never delivers forty cases as forty cases.
          </p>
        </div>
      )}
    </div>
  );
}

/** One follow-up, with its answer behind a click so you can try yours first. */
function FollowUpRow({ followUp }: { followUp: FollowUp }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-900/40 border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-3 py-2.5 hover:bg-slate-700/40 transition-colors flex gap-2"
      >
        <span className="text-slate-600 flex-shrink-0">→</span>
        <span className="text-xs text-slate-300 flex-1">{followUp.question}</span>
        <span className="text-[10px] text-indigo-400 flex-shrink-0 font-medium">
          {open ? 'Hide' : 'Answer'}
        </span>
      </button>
      {open && (
        <p className="px-3 pb-3 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-700">
          {followUp.answer}
        </p>
      )}
    </div>
  );
}

/** The enumeration half: your list, a clock, and nothing else unless you ask for the scaffold. */
function Enumerating({ exercise, active }: { exercise: DesignExercise; active: ActiveDesignAttempt }) {
  const { setNotes, reveal, abandon } = useTestDesignStore();
  const [scaffold, setScaffold] = useState(false);
  const written = countCases(active.notes);

  return (
    <>
      <div className={`${CARD} p-5`}>
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold mb-1">{exercise.title}</h2>
            <p className="text-sm text-slate-300">{exercise.prompt}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg text-slate-200">
              <Elapsed from={active.startedAt} />
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
              {written} case{written === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        <div className="mt-4 bg-slate-900/40 border border-slate-700 rounded-lg p-3">
          <span className={`${LABEL} mb-1.5`}>Ask these first</span>
          <ul className="flex flex-col gap-1">
            {exercise.clarifiers.map((q) => (
              <li key={q} className="text-xs text-slate-400 flex gap-2">
                <span className="text-slate-600">?</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-500 mt-2">
            Answer them however you like — then say your assumption out loud in the room rather
            than leaving it silent.
          </p>
        </div>
      </div>

      <div className={`${CARD} p-5`}>
        <label htmlFor="design-notes" className={`${LABEL} mb-1.5`}>
          Your cases — one per line
        </label>
        <textarea
          id="design-notes"
          value={active.notes}
          onChange={(e) => setNotes(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          rows={16}
          placeholder={'Boundaries: password at the minimum length\nBoundaries: one character under\n…'}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:border-indigo-500/60"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => reveal(Date.now())}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors"
          >
            Done — show the reference list
          </button>
          <button
            onClick={() => setScaffold((v) => !v)}
            aria-expanded={scaffold}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs transition-colors"
          >
            {scaffold ? 'Hide the scaffold' : 'Stuck? Show the dimension scaffold'}
          </button>
          <button
            onClick={abandon}
            className="ml-auto text-xs text-slate-500 hover:text-red-300"
          >
            Abandon
          </button>
        </div>

        {/* Deliberately not shown by default: in the room the scaffold is in your head. */}
        {scaffold && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {DIMENSIONS.map((d) => (
              <div key={d.id} className="bg-slate-900/40 border border-slate-700 rounded-lg p-2.5">
                <span className="text-xs font-medium text-slate-200">{d.label}</span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{d.question}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-slate-500 mt-3">
          The reveal is one-way. Once the reference list is up the enumeration is over — which is
          the only thing that makes the score afterwards mean anything.
        </p>
      </div>
    </>
  );
}

/** The comparison half: your list beside the reference, scored by you, dimension by dimension. */
function Comparing({ exercise, active }: { exercise: DesignExercise; active: ActiveDesignAttempt }) {
  const { toggleChecked, commit, abandon } = useTestDesignStore();
  const score = scoreAttempt(exercise, active.checked);
  const written = countCases(active.notes);

  return (
    <>
      <div className={`${CARD} p-5`}>
        <div className="flex items-start gap-3 flex-wrap mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold mb-1">{exercise.title}</h2>
            <p className="text-sm text-slate-400">
              Tick what you actually had. Nothing here reads your list, so an inflated tick only
              costs you the measurement.
            </p>
          </div>
          <span className="text-xs text-slate-500 flex-shrink-0">
            {written} written · {formatClock((active.revealedAt ?? 0) - active.startedAt)} taken
          </span>
        </div>

        <RecallBar score={score} />
        <div className="flex flex-wrap gap-2 text-xs mt-3">
          <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-medium">
            {score.mustHit} / {score.mustTotal} of the floor
          </span>
          <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">
            {score.creditHit} / {score.creditTotal} credit
          </span>
          {/* Before anything is ticked every dimension is trivially missed, which says nothing. */}
          {score.hit > 0 && score.missed.length > 0 && (
            <span className="px-2 py-1 rounded bg-red-500/20 text-red-300 font-medium">
              Nothing at all in: {missedLabel(score.missed)}
            </span>
          )}
        </div>
      </div>

      {active.notes.trim() !== '' && (
        <div className={`${CARD} p-5`}>
          <span className={`${LABEL} mb-1.5`}>What you wrote</span>
          <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
            {active.notes}
          </pre>
        </div>
      )}

      {score.byDimension.map(({ dimension, hit, total }) => (
        <div key={dimension.id} className={`${CARD} p-5`}>
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <h3 className="font-bold">{dimension.label}</h3>
            <span
              className={`text-xs font-mono ml-auto ${
                hit === total ? 'text-green-400' : hit > 0 ? 'text-yellow-400' : 'text-red-400'
              }`}
            >
              {hit} / {total}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">{dimension.miss}</p>
          <div className="flex flex-col gap-1.5">
            {exercise.expected
              .filter((c) => c.dimension === dimension.id)
              .map((expected) => (
                <CaseRow
                  key={expected.id}
                  expected={expected}
                  checked={active.checked.includes(expected.id)}
                  onToggle={() => toggleChecked(expected.id)}
                />
              ))}
          </div>
        </div>
      ))}

      <WorkedAnswer exercise={exercise} />

      <div className={`${CARD} p-5`}>
        <span className={`${LABEL} mb-1.5`}>Where the interviewer goes next</span>
        <p className="text-xs text-slate-500 mb-3">
          Answer each one yourself before opening it. These are where the round is actually won —
          the list gets you to competent, the follow-ups are what separate answers.
        </p>
        <div className="flex flex-col gap-1.5 mb-4">
          {exercise.followUps.map((followUp) => (
            <FollowUpRow key={followUp.question} followUp={followUp} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-700">
          <button
            onClick={() => commit(Date.now())}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors"
          >
            Save this attempt
          </button>
          <button onClick={abandon} className="ml-auto text-xs text-slate-500 hover:text-red-300">
            Discard
          </button>
        </div>
      </div>
    </>
  );
}

/** One row of the exercise list, with the score of your last attempt at it. */
function ExerciseRow({
  exercise,
  onStart,
}: {
  exercise: DesignExercise;
  onStart: () => void;
}) {
  const { attempts } = useTestDesignStore();
  const { reviews, rateOther } = useProgressStore();
  const now = useNow();
  const latest = latestByExercise(attempts).get(exercise.id);
  const score = latest ? scoreAttempt(exercise, latest.checked) : null;
  const record = reviews[designReviewId(exercise.id)];
  const tries = attempts.filter((a) => a.exerciseId === exercise.id).length;

  return (
    <div className={`${CARD} p-4 flex flex-col gap-3`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-bold">{exercise.title}</span>
        <span className="text-xs text-slate-500">{exercise.expected.length} reference cases</span>
        <button
          onClick={onStart}
          className="ml-auto px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium transition-colors"
        >
          {score ? 'Attempt again' : 'Attempt'}
        </button>
      </div>

      {score ? (
        <>
          <RecallBar score={score} />
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">
              {tries} attempt{tries === 1 ? '' : 's'}
            </span>
            {score.missed.length > 0 && (
              <span className="text-red-300/80">missed entirely: {missedLabel(score.missed)}</span>
            )}
            {/* The buttons stay after a rating, so a re-attempt can be re-rated rather than
                leaving the schedule stuck on how the first one went. */}
            <span className="ml-auto flex items-center gap-1.5">
              <span className="text-slate-500">
                {record ? dueLabel(record, now) : 'Schedule a re-run:'}
              </span>
              {CONFIDENCE_META.map((c) => (
                <button
                  key={c.id}
                  onClick={() => rateOther(designReviewId(exercise.id), c.id)}
                  title={c.hint}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${c.accent}`}
                >
                  {c.label}
                </button>
              ))}
            </span>
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-500">{exercise.prompt}</p>
      )}
    </div>
  );
}

export function TestDesignPage() {
  const { active, attempts, begin, clearAttempts } = useTestDesignStore();
  const [methodOpen, setMethodOpen] = useState(false);
  const [kinds, setKinds] = useState<ExerciseCategory[]>([]);

  if (active) {
    const exercise = EXERCISES.find((e) => e.id === active.exerciseId);
    // An attempt persisted against an exercise that no longer exists would otherwise wedge the
    // page — there is no way back except to drop it.
    if (!exercise) {
      return (
        <div className="h-full overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto">
            <div className={`${CARD} p-5`}>
              <p className="text-sm text-slate-400">
                This attempt refers to an exercise that no longer exists.{' '}
                <button
                  onClick={() => useTestDesignStore.getState().abandon()}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Discard it
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="h-full overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {active.revealedAt ? (
            <Comparing exercise={exercise} active={active} />
          ) : (
            <Enumerating exercise={exercise} active={active} />
          )}
        </div>
      </div>
    );
  }

  const summary = summarise(attempts);
  const spots = blindSpots(attempts);
  const attemptedIds = new Set(attempts.map((a) => a.exerciseId));

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className={`${CARD} p-5`}>
          <h2 className="text-xl font-bold mb-1">Test design — how would you test X?</h2>
          <p className="text-sm text-slate-400 mb-4">
            The round that is only asked of you. It is not scored on how many cases you produce —
            it is scored on whether you enumerate a space systematically or list whatever comes to
            mind and stop when you run dry. Write your list first, then compare it against the
            reference and mark what you actually had.
          </p>

          <div className="flex flex-wrap gap-2 text-xs mb-4">
            <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-medium">
              {summary.attempted} / {summary.exercises} exercises attempted
            </span>
            <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">
              {Math.round(summary.recall * 100)}% mean recall
            </span>
            <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">
              {summary.totalAttempts} attempt{summary.totalAttempts === 1 ? '' : 's'} recorded
            </span>
          </div>

          <button
            onClick={() => setMethodOpen((v) => !v)}
            aria-expanded={methodOpen}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {methodOpen ? 'Hide the method' : 'The method, in four steps'}
          </button>
          {methodOpen && (
            <div className="mt-3 flex flex-col gap-2.5">
              {METHOD_STEPS.map((step, i) => (
                <div key={step.title} className="flex gap-3">
                  <span className="text-xs font-mono text-slate-600 mt-0.5">{i + 1}</span>
                  <div>
                    <span className="text-sm font-medium text-slate-200">{step.title}</span>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* The output this whole page exists to produce. */}
        {spots.length > 0 && (
          <div className={`${CARD} p-5`}>
            <h3 className="text-lg font-bold mb-1">Your blind spots</h3>
            <p className="text-sm text-slate-400 mb-3">
              Recall per dimension across everything you have attempted, weakest first. One
              exercise tells you about one subject; four start telling you about you.
            </p>
            <div className="flex flex-col gap-2">
              {spots.map((spot) => {
                const pct = Math.round(spot.recall * 100);
                return (
                  <div key={spot.dimension.id} className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 w-44 flex-shrink-0 truncate">
                      {spot.dimension.label}
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-500 w-20 text-right">
                      {spot.hit}/{spot.total} · {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
            {spots[0].recall < 0.5 && (
              <p className="text-xs text-slate-400 mt-3">
                <span className="text-slate-200 font-medium">{spots[0].dimension.label}</span> is
                where you are losing the most. {spots[0].dimension.question}
              </p>
            )}
          </div>
        )}

        {/* Filter, then group. Twenty-four titles in one list is a wall; the kinds are also how
            loops differ — an API-platform team asks about endpoints and a consumer team does not. */}
        <div className={`${CARD} p-4`}>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Kind
            </span>
            <button
              onClick={() => setKinds([])}
              aria-pressed={kinds.length === 0}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                kinds.length === 0
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
              }`}
            >
              All {EXERCISES.length}
            </button>
            {CATEGORIES.map((category) => {
              const on = kinds.includes(category.id);
              const count = EXERCISES.filter((e) => e.category === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() =>
                    setKinds((prev) =>
                      prev.includes(category.id)
                        ? prev.filter((k) => k !== category.id)
                        : [...prev, category.id]
                    )
                  }
                  aria-pressed={on}
                  title={category.blurb}
                  className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                    on
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {category.label} {count}
                </button>
              );
            })}
          </div>
        </div>

        {CATEGORIES.filter((c) => kinds.length === 0 || kinds.includes(c.id)).map((category) => {
          const inCategory = EXERCISES.filter((e) => e.category === category.id);
          const done = inCategory.filter((e) => attemptedIds.has(e.id)).length;
          return (
            <div key={category.id} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2 flex-wrap px-1">
                <h3 className="text-lg font-bold">{category.label}</h3>
                <span className="text-xs font-mono text-slate-500">
                  {done} / {inCategory.length}
                </span>
                <p className="text-xs text-slate-500 basis-full">{category.blurb}</p>
              </div>
              {inCategory.map((exercise) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  onStart={() => begin(exercise.id, Date.now())}
                />
              ))}
            </div>
          );
        })}

        {attempts.length > 0 && (
          <div className={`${CARD} p-4`}>
            <p className="text-xs text-slate-500">
              Attempts are kept so a re-run can be read against the first one.{' '}
              <button
                onClick={clearAttempts}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Clear the history
              </button>
              , which also empties the blind-spot chart.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
