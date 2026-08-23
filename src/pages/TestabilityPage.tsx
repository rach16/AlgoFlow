import { useState } from 'react';
import {
  FLAKE_MATH,
  PYRAMID,
  PYRAMID_ARGUMENT,
  TECHNIQUES,
  TESTABILITY_LEVERS,
} from '../data/testability';

/**
 * The reference half of test design: technique, layer, testability.
 *
 * Read-only on purpose. The exercises next door are where you produce something; this is what an
 * interviewer asks about once your list is on the table — what technique produced it, where each
 * case belongs, and what you would change in the product to make the case cheap to write.
 */

const CARD = 'bg-slate-800 rounded-xl';
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase tracking-wider';

/** Per-test reliability the arithmetic is run at. The point survives any of them. */
const RELIABILITIES = [0.999, 0.995, 0.99, 0.98];

function FlakeTable() {
  const [perTest, setPerTest] = useState(FLAKE_MATH.perTest);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-xs text-slate-400 mr-1">Each test passes</span>
        {RELIABILITIES.map((r) => (
          <button
            key={r}
            onClick={() => setPerTest(r)}
            aria-pressed={r === perTest}
            className={`px-2 py-0.5 rounded text-xs font-mono border transition-colors ${
              r === perTest
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {(r * 100).toFixed(1)}%
          </button>
        ))}
        <span className="text-xs text-slate-400">of the time, independently</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {FLAKE_MATH.sizes.map((size) => {
          const green = FLAKE_MATH.greenRate(perTest, size);
          const pct = green * 100;
          return (
            <div key={size} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-24 flex-shrink-0 font-mono">
                {size} tests
              </span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    pct >= 90 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(pct, 0.5)}%` }}
                />
              </div>
              <span className="text-xs font-mono text-slate-400 w-28 text-right">
                {pct < 1 ? pct.toFixed(2) : pct.toFixed(1)}% green
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TestabilityPage() {
  const [openTechnique, setOpenTechnique] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className={`${CARD} p-5`}>
          <h2 className="text-xl font-bold mb-1">Technique, layer, testability</h2>
          <p className="text-sm text-slate-400">
            Three things the interviewer asks once your list of cases is on the table: which
            technique produced it, where each case belongs, and what you would change in the
            product so the case is cheap to write at all. The last one is the question the title
            is actually for — and the one candidates prepare for least.
          </p>
        </div>

        {/* Techniques */}
        <div className={`${CARD} p-5`}>
          <h3 className="text-lg font-bold mb-1">Techniques that produce cases</h3>
          <p className="text-sm text-slate-400 mb-3">
            Naming the technique is what turns a list into a coverage argument. Every one of these
            has a trap, and the trap is usually what gets probed.
          </p>
          <div className="flex flex-col gap-2">
            {TECHNIQUES.map((technique) => {
              const open = openTechnique === technique.id;
              return (
                <div key={technique.id} className="bg-slate-900/40 border border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenTechnique(open ? null : technique.id)}
                    aria-expanded={open}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-700/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{technique.name}</span>
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
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{technique.idea}</p>
                  </button>
                  {open && (
                    <div className="px-3 pb-3 pt-1 flex flex-col gap-2.5 border-t border-slate-700">
                      <div>
                        <span className={LABEL}>Reach for it when</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{technique.useWhen}</p>
                      </div>
                      <div>
                        <span className={LABEL}>Worked small</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{technique.example}</p>
                      </div>
                      <div>
                        <span className={LABEL}>The trap</span>
                        <p className="text-xs text-red-200/70 leading-relaxed">{technique.trap}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pyramid */}
        <div className={`${CARD} p-5`}>
          <h3 className="text-lg font-bold mb-1">Where the case belongs</h3>
          <p className="text-sm text-slate-400 mb-1">{PYRAMID_ARGUMENT.why}</p>
          <p className="text-sm text-indigo-300 font-medium mb-4">{PYRAMID_ARGUMENT.rule}</p>

          <div className="flex flex-col gap-2">
            {PYRAMID.map((layer, i) => (
              <div
                key={layer.id}
                className="bg-slate-900/40 border border-slate-700 rounded-lg p-3"
                // Indented by depth, so the shape is visible without drawing a triangle nobody
                // can read on a phone.
                style={{ marginLeft: `${i * 6}%` }}
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-medium">{layer.name}</span>
                  <span className="text-[11px] text-slate-500 ml-auto">{layer.speed}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{layer.belongs}</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  <span className="text-slate-400">Flake:</span> {layer.flake}
                </p>
                <p className="text-xs text-red-200/70 mt-1 leading-relaxed">
                  <span className="text-red-400/70">×</span> {layer.mistake}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            <span className={`${LABEL} mb-1`}>The inversion</span>
            <p className="text-xs text-slate-400 leading-relaxed">{PYRAMID_ARGUMENT.inversion}</p>
          </div>
        </div>

        {/* Flake arithmetic */}
        <div className={`${CARD} p-5`}>
          <h3 className="text-lg font-bold mb-1">Why “mostly reliable” is not a number</h3>
          <p className="text-sm text-slate-400 mb-4">
            Flake compounds, and the arithmetic is the argument. Have it ready — it is the fastest
            way to turn “our suite is a bit flaky” into a decision.
          </p>
          <FlakeTable />
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">{FLAKE_MATH.point}</p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{FLAKE_MATH.retries}</p>
        </div>

        {/* Testability */}
        <div className={`${CARD} p-5`}>
          <h3 className="text-lg font-bold mb-1">Design for testability</h3>
          <p className="text-sm text-slate-400 mb-4">
            “What would you change so this is easier to test?” is the question the SDET title is
            for. Each of these is a smell you can name, a change you can ask for, and a sentence
            you can say in the room.
          </p>
          <div className="flex flex-col gap-2">
            {TESTABILITY_LEVERS.map((lever) => (
              <div key={lever.id} className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
                <p className="text-xs text-red-200/70 leading-relaxed">
                  <span className="text-red-400/70">×</span> {lever.smell}
                </p>
                <p className="text-xs text-slate-200 leading-relaxed mt-1.5">
                  <span className="text-green-400">→</span> {lever.lever}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mt-1.5 italic">
                  “{lever.say}”
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
