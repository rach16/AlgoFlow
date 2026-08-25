import { useState } from 'react';
import { ReviewControl } from '../components/common/ReviewControl';
import { aiQuestionId } from '../utils/reviewKinds';
import {
  AI_QA,
  MUTANTS,
  MUTATION_SPEC,
  MUTATION_SUBJECT,
  MUTATION_SUITES,
  MUTATION_VERDICT,
  POSITIONS,
  TASK_CALLS,
  TOOL_CLAIMS,
  VERIFICATION_DEBT,
} from '../data/aiTesting';

/**
 * Using AI in testing — the direction the interviewer asks about first.
 *
 * The screen is organised around the fact that both obvious answers lose. Dismissing it reads as
 * incurious; enthusing about it invites "how do you know the generated tests are any good", and
 * that question has exactly one good answer, which is why it gets a lab rather than a paragraph.
 *
 * The tool section is deliberately unimpressed and deliberately not dismissive. A reference that
 * only sneers is as useless in a room as one that only sells.
 */

const CARD = 'bg-slate-800 rounded-xl';
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase tracking-wider';

type SectionId = 'position' | 'split' | 'debt' | 'mutation' | 'tools' | 'answers';

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'position', label: 'The position' },
  { id: 'split', label: 'What you hand over' },
  { id: 'debt', label: 'Verification debt' },
  { id: 'mutation', label: 'Mutation lab' },
  { id: 'tools', label: 'Tool claims' },
  { id: 'answers', label: 'Answers' },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-[11px] leading-relaxed overflow-x-auto text-slate-300 whitespace-pre">
      {children}
    </pre>
  );
}

function Positions() {
  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-bold mb-1">“How are you using AI in your testing?”</h3>
      <p className="text-sm text-slate-400 mb-4">
        Asked in almost every loop now, and one of the few questions where both obvious answers
        lose. What lands is a position: here is what I hand to it, here is what I refuse to, and
        here is the new failure mode it introduces.
      </p>
      <div className="flex flex-col gap-3">
        {POSITIONS.map((position) => (
          <div
            key={position.id}
            className={`rounded-lg p-3 border ${
              position.verdict === 'good'
                ? 'bg-green-500/5 border-green-500/30'
                : 'bg-slate-900/40 border-slate-700'
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 mt-0.5 ${
                  position.verdict === 'good'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {position.verdict === 'good' ? 'Lands' : 'Costs you'}
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">{position.answer}</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">{position.problem}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Split() {
  const hand = TASK_CALLS.filter((t) => t.hand);
  const keep = TASK_CALLS.filter((t) => !t.hand);

  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-bold mb-1">The split that makes the answer credible</h3>
      <p className="text-sm text-slate-400 mb-4">
        A general attitude is not a position. Naming specific tasks on both sides of the line is,
        and the line has a shape: hand over the work whose errors are cheap and immediately
        visible, keep the work where being confidently wrong costs you a shipped defect.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: 'Hand it over',
            note: 'Wrong in ways you see in the next minute.',
            tone: 'green' as const,
            items: hand,
          },
          {
            title: 'Keep it',
            note: 'Wrong in ways that look exactly like right.',
            tone: 'red' as const,
            items: keep,
          },
        ].map((column) => (
          <div key={column.title}>
            <div className="mb-2">
              <span
                className={`text-sm font-semibold ${
                  column.tone === 'green' ? 'text-green-400' : 'text-red-400/90'
                }`}
              >
                {column.title}
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">{column.note}</p>
            </div>
            <div className="flex flex-col gap-2">
              {column.items.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-lg p-3 border ${
                    column.tone === 'green'
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <p className="text-xs font-medium text-slate-200 leading-relaxed">{task.task}</p>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5">{task.why}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Debt() {
  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-bold mb-1">Verification debt</h3>
      <div className="flex flex-col gap-2 mb-4">
        <p className="text-sm text-slate-300 leading-relaxed">{VERIFICATION_DEBT.definition}</p>
        <p className="text-sm text-slate-400 leading-relaxed">{VERIFICATION_DEBT.why}</p>
      </div>
      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 mb-4">
        <span className={`${LABEL} mb-1`}>The tell</span>
        <p className="text-xs text-red-200/80 leading-relaxed">{VERIFICATION_DEBT.tell}</p>
      </div>
      <span className={`${LABEL} mb-2`}>What you do about it</span>
      <div className="flex flex-col gap-2">
        {VERIFICATION_DEBT.fixes.map((fix) => (
          <div key={fix.id} className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            <span className="text-sm font-medium">{fix.title}</span>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">{fix.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The mutation lab.
 *
 * Two suites over one function, both at 100% line coverage, and nine deliberate breakages. The
 * score is computed from the data rather than asserted in prose, so the argument on the page is
 * the argument the numbers actually make.
 */
function MutationLab() {
  const [suiteId, setSuiteId] = useState(MUTATION_SUITES[0].id);
  const [openMutant, setOpenMutant] = useState<string | null>(null);
  const suite = MUTATION_SUITES.find((s) => s.id === suiteId)!;

  const killable = MUTANTS.filter((m) => !m.equivalent);
  const killed = killable.filter((m) => m.killedBy.includes(suiteId));
  const score = Math.round((killed.length / killable.length) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div className={`${CARD} p-5`}>
        <h3 className="text-lg font-bold mb-1">Mutation lab</h3>
        <p className="text-sm text-slate-400 mb-4">
          “How do you know the generated tests are any good?” Coverage cannot answer it, and this
          is the demonstration. One function, two suites, both at 100% line coverage. Then break
          the code nine ways and count who notices.
        </p>

        <span className={`${LABEL} mb-1.5`}>The code under test</span>
        <Code>{MUTATION_SUBJECT}</Code>

        <span className={`${LABEL} mt-4 mb-1.5`}>The rules it is supposed to implement</span>
        <ul className="flex flex-col gap-1">
          {MUTATION_SPEC.map((rule) => (
            <li key={rule} className="text-xs text-slate-300 leading-relaxed flex gap-2">
              <span className="text-slate-600 flex-shrink-0">·</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      <div className={`${CARD} p-5`}>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {MUTATION_SUITES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSuiteId(s.id);
                setOpenMutant(null);
              }}
              aria-pressed={s.id === suiteId}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                s.id === suiteId
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-3">{suite.origin}</p>
        <Code>{suite.tests}</Code>

        {/* The two numbers side by side is the entire argument, so they get the space. */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            <span className={LABEL}>Line coverage</span>
            <div className="text-2xl font-bold font-mono text-slate-300 mt-0.5">
              {suite.coverage}%
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
              Identical for both suites.
            </p>
          </div>
          <div
            className={`rounded-lg p-3 border ${
              score >= 80
                ? 'bg-green-500/5 border-green-500/30'
                : 'bg-red-500/5 border-red-500/30'
            }`}
          >
            <span className={LABEL}>Mutation score</span>
            <div
              className={`text-2xl font-bold font-mono mt-0.5 ${
                score >= 80 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {score}%
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
              {killed.length} of {killable.length} killable mutants, {MUTANTS.length - killable.length} equivalent
              excluded.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mt-3">{suite.verdict}</p>
      </div>

      <div className={`${CARD} p-5`}>
        <h4 className="text-sm font-bold mb-1">The nine mutants</h4>
        <p className="text-xs text-slate-400 mb-3">
          Each one is a single deliberate edit to the function above. Green means this suite fails
          — the mutant is killed, which is the outcome you want. Red means the suite stayed green
          against broken code. Open one for what the change does and why it was missed.
        </p>
        <div className="flex flex-col gap-2">
          {MUTANTS.map((mutant) => {
            const isKilled = mutant.killedBy.includes(suiteId);
            const open = openMutant === mutant.id;
            return (
              <div
                key={mutant.id}
                className={`rounded-lg border overflow-hidden ${
                  mutant.equivalent
                    ? 'bg-slate-900/40 border-slate-700'
                    : isKilled
                    ? 'bg-green-500/5 border-green-500/25'
                    : 'bg-red-500/5 border-red-500/25'
                }`}
              >
                <button
                  onClick={() => setOpenMutant(open ? null : mutant.id)}
                  aria-expanded={open}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${
                        mutant.equivalent
                          ? 'bg-slate-700 text-slate-400'
                          : isKilled
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {mutant.equivalent ? 'Equivalent' : isKilled ? 'Killed' : 'Survived'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 flex-shrink-0">
                      line {mutant.line}
                    </span>
                    <span className="text-xs text-slate-200 truncate">{mutant.label}</span>
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
                </button>
                {open && (
                  <div className="px-3 pb-3 flex flex-col gap-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <span className={LABEL}>Original</span>
                        <Code>{mutant.original}</Code>
                      </div>
                      <div>
                        <span className={LABEL}>Mutated</span>
                        <Code>{mutant.mutated}</Code>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="text-slate-500">Now does:</span> {mutant.meaning}
                    </p>
                    {mutant.escapes && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="text-slate-500">Why it is missed:</span> {mutant.escapes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${CARD} p-5 flex flex-col gap-3`}>
        <div>
          <span className={`${LABEL} mb-1`}>Why coverage cannot see this</span>
          <p className="text-xs text-slate-300 leading-relaxed">{MUTATION_VERDICT.coverage}</p>
        </div>
        <div>
          <span className={`${LABEL} mb-1`}>What the score buys you</span>
          <p className="text-xs text-slate-300 leading-relaxed">{MUTATION_VERDICT.score}</p>
        </div>
        <div>
          <span className={`${LABEL} mb-1`}>What it costs</span>
          <p className="text-xs text-slate-300 leading-relaxed">{MUTATION_VERDICT.cost}</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
          <span className={`${LABEL} mb-1`}>In the room</span>
          <p className="text-xs text-slate-400 leading-relaxed italic">“{MUTATION_VERDICT.say}”</p>
        </div>
      </div>
    </div>
  );
}

function Tools() {
  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-bold mb-1">What the tools claim, and what they do</h3>
      <p className="text-sm text-slate-400 mb-4">
        Every one of these is genuinely useful somewhere and genuinely oversold everywhere else.
        Knowing which is which is the whole of the answer — so each card names the mechanism, the
        catch, the case where it is the right call, and the sentence you say.
      </p>
      <div className="flex flex-col gap-3">
        {TOOL_CLAIMS.map((tool) => (
          <div key={tool.id} className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            <span className="text-sm font-medium">{tool.name}</span>
            <p className="text-xs text-slate-500 leading-relaxed italic mt-0.5">“{tool.claim}”</p>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              <span className="text-slate-500">How it works:</span> {tool.how}
            </p>
            <p className="text-xs text-red-200/70 leading-relaxed mt-1.5">
              <span className="text-red-400/70">The catch:</span> {tool.catch}
            </p>
            <p className="text-xs text-slate-200 leading-relaxed mt-1.5">
              <span className="text-green-400">Right call when:</span> {tool.goodFor}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed mt-2 pt-2 border-t border-slate-700 italic">
              “{tool.say}”
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Answers() {
  const [open, setOpen] = useState<string[]>([]);
  const toggle = (q: string) =>
    setOpen((prev) => (prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]));

  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-bold mb-1">The five questions, answered</h3>
      <p className="text-sm text-slate-400 mb-4">
        Behind reveals on purpose. Say your own answer out loud first — the gap between what you
        said and what is written is the only useful thing on this screen.
      </p>
      <div className="flex flex-col gap-2">
        {AI_QA.map((qa) => {
          const isOpen = open.includes(qa.question);
          return (
            <div
              key={qa.question}
              className="bg-slate-900/40 border border-slate-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggle(qa.question)}
                aria-expanded={isOpen}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-700/40 transition-colors flex items-center gap-2"
              >
                <span className="text-sm text-slate-200 leading-relaxed">{qa.question}</span>
                <span
                  className={`ml-auto flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider ${
                    isOpen ? 'text-slate-600' : 'text-indigo-400'
                  }`}
                >
                  {isOpen ? 'Hide' : 'Answer'}
                </span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 flex flex-col gap-2">
                  <p className="text-xs text-slate-300 leading-relaxed">{qa.answer}</p>
                  <ReviewControl
                    kind="ai"
                    itemId={aiQuestionId(qa.question)}
                    prompt="Ask me again:"
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

export function AiTestingPage() {
  const [section, setSection] = useState<SectionId>('position');

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className={`${CARD} p-5`}>
          <h2 className="text-xl font-bold mb-1">Using AI in testing</h2>
          <p className="text-sm text-slate-400 mb-4">
            Dismissing it reads as incurious; enthusing about it reads as somebody who has not yet
            been burned. What lands is a position — what you hand over, what you refuse to, and
            what you do about the failure mode it introduces, which is that code now arrives
            faster than anyone can check it.
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

        {section === 'position' && <Positions />}
        {section === 'split' && <Split />}
        {section === 'debt' && <Debt />}
        {section === 'mutation' && <MutationLab />}
        {section === 'tools' && <Tools />}
        {section === 'answers' && <Answers />}
      </div>
    </div>
  );
}
