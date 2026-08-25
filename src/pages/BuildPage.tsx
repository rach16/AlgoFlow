import { useState } from 'react';
import { ReviewControl } from '../components/common/ReviewControl';
import { BUILD_EXERCISES } from '../data/buildExercises';

/**
 * The twenty-minute build round.
 *
 * The prompt and what is being assessed are visible; the solution is behind a reveal, because
 * reading a solution you have not attempted teaches nothing and the whole value of this round is
 * whether the edge cases occur to you unprompted.
 *
 * The follow-ups are shown before the solution on purpose. They are what the interviewer asks
 * once the code works, which means they are the actual question — the code is only the ticket
 * into the conversation.
 */

const CARD = 'bg-slate-800 rounded-xl';
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase tracking-wider';

function Exercise({ exercise }: { exercise: (typeof BUILD_EXERCISES)[number] }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-bold mb-1 font-mono">{exercise.title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed mb-3">{exercise.prompt}</p>

      <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-3 mb-3">
        <span className={`${LABEL} mb-1`}>What is actually being read</span>
        <p className="text-xs text-slate-300 leading-relaxed">{exercise.assessed}</p>
      </div>

      <div className="mb-3">
        <span className={`${LABEL} mb-1.5`}>What they ask once it works</span>
        <ul className="flex flex-col gap-1">
          {exercise.followUps.map((q) => (
            <li key={q} className="text-xs text-slate-400 leading-relaxed flex gap-2">
              <span className="text-slate-600 flex-shrink-0">·</span>
              {q}
            </li>
          ))}
        </ul>
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/40 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 transition-colors"
        >
          Write it yourself first, then reveal the solution
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <span className={`${LABEL} mb-1.5`}>A solution</span>
            <pre className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-[11px] leading-relaxed overflow-x-auto text-slate-300 whitespace-pre">
              {exercise.solution}
            </pre>
          </div>

          {/* Naming the assertions the source passed is the difference between a snippet and a
              claim you can check. It is also the habit the round is testing. */}
          <div>
            <span className={`${LABEL} mb-1.5`}>Verified by</span>
            <ul className="flex flex-col gap-1">
              {exercise.checks.map((check) => (
                <li key={check} className="text-xs text-green-300/80 leading-relaxed flex gap-2">
                  <span className="text-green-400/70 flex-shrink-0">✓</span>
                  {check}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className={`${LABEL} mb-1.5`}>How it goes wrong</span>
            <ul className="flex flex-col gap-1.5">
              {exercise.mistakes.map((m) => (
                <li key={m} className="text-xs text-red-200/70 leading-relaxed flex gap-2">
                  <span className="text-red-400/60 flex-shrink-0">×</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <ReviewControl
            kind="build"
            itemId={exercise.id}
            prompt="Come back and build it again:"
            className="pt-1"
          />
        </div>
      )}
    </div>
  );
}

export function BuildPage() {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className={`${CARD} p-5`}>
          <h2 className="text-xl font-bold mb-1">The build round</h2>
          <p className="text-sm text-slate-400 mb-2">
            Not an algorithm round. They hand you a small piece of test infrastructure — a wait, a
            retry, a rate limiter, a runner — and watch how you build it. The code is not the
            signal: what is being read is which edge cases you volunteer before being asked, and
            whether what you wrote can be tested without sleeping.
          </p>
          <p className="text-sm text-slate-400">
            Every solution here takes its clock or its sleep as a parameter. That one habit
            separates people who have maintained a suite from people who have only written one, and
            it is why each of these can be verified in microseconds.
          </p>
        </div>

        {BUILD_EXERCISES.map((exercise) => (
          <Exercise key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </div>
  );
}
