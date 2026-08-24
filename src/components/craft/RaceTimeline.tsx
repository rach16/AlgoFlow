import { useEffect, useState } from 'react';
import type { FlakeScenario, StepTone, TimelineStep } from '../../data/flakeScenarios';

/**
 * A race condition, stepped through.
 *
 * The whole difficulty with a flaky test is that two things happen at once and the failure depends
 * on their order — which is exactly the kind of thing this app already steps through for
 * algorithms. Same treatment: lanes for the actors, one column per event, a playhead you can drive
 * by hand or let run.
 *
 * LAYOUT IS BY STEP, NOT TO SCALE. The times are real and displayed, but a five-second timeout
 * drawn proportionally would compress the four events that matter into a millimetre. The order is
 * what the diagram is for.
 */

const TONE: Record<StepTone, { dot: string; ring: string; text: string }> = {
  normal: { dot: 'bg-slate-500', ring: 'ring-slate-400', text: 'text-slate-300' },
  risk: { dot: 'bg-orange-500', ring: 'ring-orange-400', text: 'text-orange-200' },
  fail: { dot: 'bg-red-500', ring: 'ring-red-400', text: 'text-red-200' },
  win: { dot: 'bg-green-500', ring: 'ring-green-400', text: 'text-green-200' },
};

const STEP_MS = 1100;

interface Props {
  scenario: FlakeScenario;
  variant: 'broken' | 'fixed';
}

/**
 * Reset on a scenario or variant change is done with a `key` at the call site rather than an
 * effect that clears state — the effect version is the pattern React specifically warns about, and
 * remounting expresses "this is a different timeline" exactly.
 */
export function RaceTimeline({ scenario, variant }: Props) {
  const steps: TimelineStep[] = scenario[variant];
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const atEnd = index >= steps.length - 1;

  // Playback stops by simply not scheduling the next tick, so nothing has to set state from an
  // effect to halt at the end.
  useEffect(() => {
    if (!playing || atEnd) return;
    const id = setTimeout(() => setIndex((i) => i + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [playing, atEnd, index]);

  const onPlayButton = () => {
    if (atEnd) {
      setIndex(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  const current = steps[index];

  return (
    <div className="flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onPlayButton}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium transition-colors"
        >
          {atEnd ? 'Replay' : playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setIndex((i) => Math.max(0, i - 1));
          }}
          disabled={index === 0}
          aria-label="Previous step"
          className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs transition-colors disabled:opacity-30"
        >
          ‹ Back
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setIndex((i) => Math.min(steps.length - 1, i + 1));
          }}
          disabled={atEnd}
          aria-label="Next step"
          className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs transition-colors disabled:opacity-30"
        >
          Step ›
        </button>
        <span className="text-xs text-slate-500 font-mono ml-1">
          {index + 1} / {steps.length} · {current.at} ms
        </span>
      </div>

      {/* Lanes */}
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <div className="min-w-[560px]">
          {scenario.lanes.map((lane) => (
            <div key={lane.id} className="flex items-stretch border-b border-slate-800 last:border-b-0">
              <div className="w-24 flex-shrink-0 flex items-center py-3 pr-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {lane.label}
                </span>
              </div>
              <div
                className="flex-1 grid gap-1 py-2"
                style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
              >
                {steps.map((step, i) => {
                  const here = step.lane === lane.id;
                  const reached = i <= index;
                  const isCurrent = i === index;
                  const tone = TONE[step.tone];
                  return (
                    <div
                      key={i}
                      className={`relative flex items-center justify-center rounded-md px-1 py-2 transition-all duration-300 ${
                        isCurrent ? 'bg-slate-700/50' : ''
                      }`}
                    >
                      {/* The lane's own track, so an empty cell still reads as "this lane exists". */}
                      <div className="absolute inset-x-0 top-1/2 h-px bg-slate-800" />
                      {here && (
                        <div
                          className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${
                            reached ? 'opacity-100' : 'opacity-25'
                          } ${isCurrent ? 'scale-110' : 'scale-100'}`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${tone.dot} ${
                              isCurrent ? `ring-2 ring-offset-2 ring-offset-slate-800 ${tone.ring}` : ''
                            }`}
                          />
                          <span
                            className={`text-[10px] leading-tight text-center ${
                              reached ? tone.text : 'text-slate-600'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Clock */}
          <div className="flex items-stretch">
            <div className="w-24 flex-shrink-0" />
            <div
              className="flex-1 grid gap-1 pt-1"
              style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
            >
              {steps.map((step, i) => (
                <span
                  key={i}
                  className={`text-[9px] font-mono text-center ${
                    i === index ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {step.at}ms
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Narration. A live region, so stepping is followable without watching the dots. */}
      <div
        aria-live="polite"
        className="bg-slate-900/40 border border-slate-700 rounded-lg p-3 min-h-[5.5rem]"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2 h-2 rounded-full ${TONE[current.tone].dot}`} />
          <span className="text-xs font-medium text-slate-200">{current.label}</span>
          <span className="text-[10px] font-mono text-slate-500 ml-auto">{current.at} ms</span>
        </div>
        <p className={`text-xs leading-relaxed ${TONE[current.tone].text}`}>{current.note}</p>
      </div>
    </div>
  );
}
