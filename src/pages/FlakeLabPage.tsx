import { useState } from 'react';
import { ReviewControl } from '../components/common/ReviewControl';
import { FLAKE_SCENARIOS } from '../data/flakeScenarios';
import { RaceTimeline } from '../components/craft/RaceTimeline';

/**
 * The flake lab.
 *
 * Every other source can tell you the click landed before the handler was bound. Almost nobody can
 * picture it, because the difficulty is that two things happen at once and the failure depends on
 * their order — which is precisely what this app already does well for algorithms. So each
 * scenario runs twice on the same clock: once as it breaks, once with the fix, and the interesting
 * frame is the one where the fixed run waits and the broken run charges ahead.
 */

const CARD = 'bg-slate-800 rounded-xl';
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase tracking-wider';

export function FlakeLabPage() {
  const [openId, setOpenId] = useState<string>(FLAKE_SCENARIOS[0].id);
  const [variant, setVariant] = useState<'broken' | 'fixed'>('broken');

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className={`${CARD} p-5`}>
          <h2 className="text-xl font-bold mb-1">Flake lab</h2>
          <p className="text-sm text-slate-400">
            Five races that produce most of the flake in a browser suite, each played out step by
            step. Run the broken version, then the fix on the same clock — the frame worth watching
            is the one where the fixed run waits and the broken run charges ahead.
          </p>
          <p className="text-xs text-slate-500 mt-3">
            “How would you debug a flaky test?” is asked in almost every SDET loop, and the answer
            that lands is a mechanism rather than a process. Naming the race is what separates it
            from “I would re-run it and add a wait”.
          </p>
        </div>

        {FLAKE_SCENARIOS.map((scenario) => {
          const open = openId === scenario.id;
          return (
            <div key={scenario.id} className={`${CARD} overflow-hidden`}>
              <button
                onClick={() => setOpenId(open ? '' : scenario.id)}
                aria-expanded={open}
                className="w-full text-left px-5 py-4 hover:bg-slate-700/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">{scenario.title}</span>
                  <svg
                    className={`w-4 h-4 text-slate-500 ml-auto flex-shrink-0 transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{scenario.symptom}</p>
              </button>

              {open && (
                <div className="px-5 pb-5 pt-4 border-t border-slate-700 flex flex-col gap-4">
                  {/* Broken first, deliberately: the fix means nothing until you have seen it fail. */}
                  <div className="flex items-center gap-1.5">
                    {(['broken', 'fixed'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setVariant(v)}
                        aria-pressed={variant === v}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          variant === v
                            ? v === 'broken'
                              ? 'bg-red-500/20 border-red-500/50 text-red-300'
                              : 'bg-green-500/20 border-green-500/50 text-green-300'
                            : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        {v === 'broken' ? 'How it fails' : 'With the fix'}
                      </button>
                    ))}
                  </div>

                  {/* Keyed, so switching variant restarts the playhead by remounting. */}
                  <RaceTimeline
                    key={`${scenario.id}-${variant}`}
                    scenario={scenario}
                    variant={variant}
                  />

                  <div>
                    <span className={LABEL}>The code</span>
                    <pre className="mt-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-[11px] leading-relaxed overflow-x-auto text-slate-300">
                      {scenario.code[variant]}
                    </pre>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className={LABEL}>Why it happens</span>
                      <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{scenario.why}</p>
                    </div>
                    <div>
                      <span className={LABEL}>Why it is intermittent</span>
                      <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                        {scenario.intermittent}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
                    <span className={LABEL}>The fix</span>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{scenario.fix}</p>
                  </div>

                  {/* Watching the animation is not the same as being able to name the race under
                      pressure, which is what the question actually asks for. */}
                  <ReviewControl
                    kind="flake"
                    itemId={scenario.id}
                    prompt="Come back and explain this one cold:"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
