import { useState } from 'react';
import { EVAL_CARDS, EVAL_GROUPS, type EvalGroupId } from '../data/aiTesting';

/**
 * Testing a feature that is itself powered by a model.
 *
 * This is the half nobody prepares for, and it is where the rest of the site's assumptions break.
 * Every technique elsewhere in SDETPrep assumes you can state the right answer; here you usually
 * cannot, so the assertion stops being an equality on one result and becomes a score over a set.
 *
 * Grouped rather than listed, because eleven cards in a row read as trivia and the grouping is
 * the argument: you cannot grade it, then you cannot reproduce it, then you find out the input is
 * an attack surface, and only then does somebody look at the bill.
 */

const CARD = 'bg-slate-800 rounded-xl';
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase tracking-wider';

type Filter = EvalGroupId | 'all';

export function AiFeaturesPage() {
  const [filter, setFilter] = useState<Filter>('all');

  const groups = EVAL_GROUPS.filter((g) => filter === 'all' || g.id === filter);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className={`${CARD} p-5`}>
          <h2 className="text-xl font-bold mb-1">Testing an AI feature</h2>
          <p className="text-sm text-slate-400 mb-2">
            The other direction, and the one worth more in a job hunt. Companies are hiring testers
            specifically for this work, it has a genuinely different shape, and most candidates
            have never thought about it — which makes it the cheapest place to be clearly better
            than the field.
          </p>
          <p className="text-sm text-slate-400 mb-4">
            The shape: there is no single correct output, so the assertion becomes a metric over a
            set rather than an equality on one result. Everything below follows from that.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {([{ id: 'all' as const, label: 'Everything' }, ...EVAL_GROUPS]).map((g) => (
              <button
                key={g.id}
                onClick={() => setFilter(g.id as Filter)}
                aria-pressed={filter === g.id}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  filter === g.id
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {g.label}
                {g.id !== 'all' && (
                  <span className="ml-1.5 text-[10px] text-slate-500">
                    {EVAL_CARDS.filter((c) => c.group === g.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.id} className={`${CARD} p-5`}>
            <h3 className="text-lg font-bold mb-1">{group.label}</h3>
            <p className="text-sm text-slate-400 mb-4">{group.blurb}</p>
            <div className="flex flex-col gap-2">
              {EVAL_CARDS.filter((card) => card.group === group.id).map((card) => (
                <div
                  key={card.id}
                  className="bg-slate-900/40 border border-slate-700 rounded-lg p-3"
                >
                  <span className="text-sm font-medium">{card.title}</span>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">{card.body}</p>
                  {/* The practice line is the half that survives into an interview answer, so it
                      is labelled rather than left as a second paragraph of the same colour. */}
                  <div className="grid grid-cols-[4.5rem_1fr] gap-2 items-baseline mt-2 pt-2 border-t border-slate-700">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-green-400/80">
                      You do
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">{card.practice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className={`${CARD} p-5`}>
          <span className={`${LABEL} mb-1`}>If you only remember one thing</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            The gate becomes a threshold over a curated eval set, not an equality on one output —
            plus per-category minimums, so an aggregate cannot hold steady while one category
            collapses, and a small set of never-regress cases that stay as hard assertions. Then
            pin the model version, because a provider updating it behind the same name is a
            breaking change with no changelog.
          </p>
        </div>
      </div>
    </div>
  );
}
