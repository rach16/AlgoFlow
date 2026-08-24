import { useState } from 'react';
import {
  CI_CARDS,
  FRAMEWORKS,
  FRAMEWORK_VERDICT,
  LOCATORS,
  POM_MISTAKES,
  POM_PRINCIPLE,
  VERDICT_META,
  WAITS,
} from '../data/craft';

/**
 * Tooling craft: waits, locators, page objects, CI.
 *
 * Test design says what to test and testability says what to change. This is the part in between —
 * how the test is actually written — and it is where a screen stops being about principles and
 * starts being about whether you have done the work.
 *
 * The opinions here are ranked rather than hedged, because a reference saying every option has
 * trade-offs is useless in a room where somebody is asking what you would actually do.
 */

const CARD = 'bg-slate-800 rounded-xl';
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase tracking-wider';

type SectionId = 'waits' | 'locators' | 'pom' | 'ci' | 'frameworks';

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'waits', label: 'Waits' },
  { id: 'locators', label: 'Locators' },
  { id: 'pom', label: 'Page objects' },
  { id: 'ci', label: 'CI' },
  { id: 'frameworks', label: 'Frameworks' },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-[11px] leading-relaxed overflow-x-auto text-slate-300 whitespace-pre">
      {children}
    </pre>
  );
}

function Waits() {
  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-bold mb-1">Waits, worst to best</h3>
      <p className="text-sm text-slate-400 mb-4">
        The most reliable filter question in an SDET screen, because the wrong answer is short and
        confident. The through-line: wait for the condition the next line depends on, and prefer a
        wait that ends the moment it is satisfied.
      </p>
      <div className="flex flex-col gap-3">
        {WAITS.map((wait) => {
          const verdict = VERDICT_META[wait.verdict];
          return (
            <div key={wait.id} className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-sm font-medium">{wait.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${verdict.accent}`}>
                  {verdict.label}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{wait.what}</p>
              <Code>{wait.code}</Code>
              <p className="text-xs text-red-200/70 leading-relaxed mt-2">
                <span className="text-red-400/70">Breaks:</span> {wait.breaks}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed mt-1.5 italic">“{wait.say}”</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Locators() {
  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-bold mb-1">Locators, ranked</h3>
      <p className="text-sm text-slate-400 mb-4">
        “It depends” is not an answer to how you choose a locator. Rank 1 is the default; anything
        further down needs a reason, and the reason is usually that nothing better exists on that
        element — which is itself worth reporting.
      </p>
      <div className="flex flex-col gap-3">
        {LOCATORS.map((locator) => (
          <div key={locator.id} className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded bg-slate-700 text-[11px] font-mono flex items-center justify-center text-slate-300 flex-shrink-0">
                {locator.rank}
              </span>
              <span className="text-sm font-medium">{locator.name}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className={LABEL}>Playwright</span>
                <Code>{locator.playwright}</Code>
              </div>
              <div>
                <span className={LABEL}>Selenium</span>
                <Code>{locator.selenium}</Code>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              <span className="text-slate-500">Holds up:</span> {locator.resilience}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
              <span className="text-slate-500">Right choice when:</span> {locator.useWhen}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageObjects() {
  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-bold mb-1">Page objects, and their five failure modes</h3>
      <div className="flex flex-col gap-2 mb-4">
        <p className="text-sm text-slate-400">{POM_PRINCIPLE.worth}</p>
        <p className="text-sm text-slate-400">{POM_PRINCIPLE.cost}</p>
        <p className="text-sm text-indigo-300">{POM_PRINCIPLE.modern}</p>
      </div>
      <div className="flex flex-col gap-2">
        {POM_MISTAKES.map((card) => (
          <div key={card.id} className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            <span className="text-sm font-medium">{card.title}</span>
            <p className="text-xs text-red-200/70 leading-relaxed mt-1">
              <span className="text-red-400/70">×</span> {card.problem}
            </p>
            <p className="text-xs text-slate-200 leading-relaxed mt-1.5">
              <span className="text-green-400">→</span> {card.fix}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Ci() {
  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-bold mb-1">Running it in CI</h3>
      <p className="text-sm text-slate-400 mb-4">
        Writing the test is half of it. The other half is a pipeline people still trust after six
        months, which is mostly a question of what you do about flake rather than about coverage.
      </p>
      <div className="flex flex-col gap-2">
        {CI_CARDS.map((card) => (
          <div key={card.id} className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            <span className="text-sm font-medium">{card.title}</span>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">{card.body}</p>
            <p className="text-xs text-indigo-300 leading-relaxed mt-1.5">
              <span className="text-slate-500">Rule of thumb:</span> {card.rule}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Frameworks() {
  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-bold mb-1">Selenium, Playwright, Cypress</h3>
      <p className="text-sm text-slate-400 mb-4">
        Asked as “which do you prefer”, and answered badly by naming one. What is being assessed is
        whether you know what each is actually trading away.
      </p>
      <div className="flex flex-col gap-3">
        {FRAMEWORKS.map((framework) => (
          <div key={framework.id} className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            <span className="text-sm font-medium">{framework.name}</span>
            <dl className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2">
              {[
                ['Waits', framework.waits],
                ['Parallelism', framework.parallel],
                ['Reach', framework.reach],
                ['Debugging', framework.debugging],
              ].map(([term, def]) => (
                <div key={term}>
                  <dt className={LABEL}>{term}</dt>
                  <dd className="text-slate-300 leading-relaxed">{def}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-slate-200 leading-relaxed mt-2">
              <span className="text-green-400">Pick it for:</span> {framework.pick}
            </p>
            <p className="text-xs text-red-200/70 leading-relaxed mt-1.5">
              <span className="text-red-400/70">Costs you:</span> {framework.cost}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-slate-900/40 border border-slate-700 rounded-lg p-3">
        <span className={`${LABEL} mb-1`}>Answering “which would you choose”</span>
        <p className="text-xs text-slate-300 leading-relaxed">{FRAMEWORK_VERDICT}</p>
      </div>
    </div>
  );
}

export function CraftPage() {
  const [section, setSection] = useState<SectionId>('waits');

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className={`${CARD} p-5`}>
          <h2 className="text-xl font-bold mb-1">Tooling craft</h2>
          <p className="text-sm text-slate-400 mb-4">
            Test design says what to test; testability says what to change. This is the part in
            between — how the test is actually written — and it is where a screen stops being about
            principles and starts being about whether you have done the work.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                aria-pressed={section === s.id}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  section === s.id
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {section === 'waits' && <Waits />}
        {section === 'locators' && <Locators />}
        {section === 'pom' && <PageObjects />}
        {section === 'ci' && <Ci />}
        {section === 'frameworks' && <Frameworks />}
      </div>
    </div>
  );
}
