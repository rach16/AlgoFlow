import { useState } from 'react';
import { ReviewControl } from '../components/common/ReviewControl';
import {
  QUESTION_GROUPS,
  TOOL_QUESTIONS,
  type QuestionGroup,
  type Tool,
  type ToolQuestion,
} from '../data/toolQuestions';

/**
 * The Selenium and Playwright question bank.
 *
 * The section next door ranks waits and locators and argues about frameworks — that is the
 * judgement half, and it is not what an automation round opens with. This is the recall half:
 * name the exception, handle the iframe, say what auto-waiting checks.
 *
 * Questions are collapsed by default so the page can be used as a self-test rather than read.
 * Answering out loud and then opening it is the only version of this that is worth anything;
 * scrolling through thirty answers feels like preparation and is not.
 */

const CARD = 'bg-slate-800 rounded-xl';
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase tracking-wider';

const TOOL_META: Record<Tool, { label: string; accent: string }> = {
  selenium: { label: 'Selenium', accent: 'bg-emerald-500/20 text-emerald-300' },
  playwright: { label: 'Playwright', accent: 'bg-sky-500/20 text-sky-300' },
  both: { label: 'Both', accent: 'bg-slate-700 text-slate-300' },
};

const TOOL_FILTERS: { id: Tool | 'all'; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'selenium', label: 'Selenium' },
  { id: 'playwright', label: 'Playwright' },
  { id: 'both', label: 'The contrast' },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-[11px] leading-relaxed overflow-x-auto text-slate-300 whitespace-pre">
      {children}
    </pre>
  );
}

function Question({ question }: { question: ToolQuestion }) {
  const [open, setOpen] = useState(false);
  const meta = TOOL_META[question.tool];
  const both = question.code?.selenium && question.code?.playwright;

  return (
    <div className="bg-slate-900/40 border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full text-left px-3 py-2.5 hover:bg-slate-700/40 transition-colors flex items-start gap-2"
      >
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 mt-0.5 ${meta.accent}`}
        >
          {meta.label}
        </span>
        <span className="text-sm text-slate-200 leading-relaxed flex-1">{question.question}</span>
        <svg
          className={`w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-3 pb-3 flex flex-col gap-3">
          <p className="text-xs text-slate-300 leading-relaxed">{question.answer}</p>

          {question.code && (
            <div className={`grid gap-2 ${both ? 'sm:grid-cols-2' : ''}`}>
              {question.code.selenium && (
                <div>
                  <span className={LABEL}>Selenium (Java)</span>
                  <div className="mt-1">
                    <Code>{question.code.selenium}</Code>
                  </div>
                </div>
              )}
              {question.code.playwright && (
                <div>
                  <span className={LABEL}>Playwright (TypeScript)</span>
                  <div className="mt-1">
                    <Code>{question.code.playwright}</Code>
                  </div>
                </div>
              )}
            </div>
          )}

          {question.wrong && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
              <span className={`${LABEL} mb-1`}>The answer that loses the room</span>
              <p className="text-xs text-red-200/80 leading-relaxed">{question.wrong}</p>
            </div>
          )}

          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2.5">
            <span className={`${LABEL} mb-1`}>Where it goes next</span>
            <p className="text-xs text-slate-300 leading-relaxed">{question.followUp}</p>
          </div>

          <ReviewControl kind="tool" itemId={question.id} prompt="Ask me again:" />
        </div>
      )}
    </div>
  );
}

export function ToolQuestionsPage() {
  const [tool, setTool] = useState<Tool | 'all'>('all');
  const [group, setGroup] = useState<QuestionGroup | 'all'>('all');

  const shown = TOOL_QUESTIONS.filter(
    (q) => (tool === 'all' || q.tool === tool) && (group === 'all' || q.group === group)
  );
  const groups = QUESTION_GROUPS.filter((g) => shown.some((q) => q.group === g.id));

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className={`${CARD} p-5`}>
          <h2 className="text-xl font-bold mb-1">Selenium and Playwright, as they are asked</h2>
          <p className="text-sm text-slate-400 mb-2">
            Tooling next door is the judgement half — what you would rank and why. This is the
            recall half: name the exception, handle the iframe, say what auto-waiting actually
            checks before a click. Both get asked, and they are different preparation.
          </p>
          <p className="text-sm text-slate-400 mb-4">
            {TOOL_QUESTIONS.length} questions, collapsed on purpose. Answer out loud first — the
            gap between what you said and what is written is the only part of this that does
            anything.
          </p>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {TOOL_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setTool(f.id)}
                aria-pressed={tool === f.id}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  tool === f.id
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
                {f.id !== 'all' && (
                  <span className="ml-1.5 text-[10px] text-slate-500">
                    {TOOL_QUESTIONS.filter((q) => q.tool === f.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[{ id: 'all' as const, label: 'All topics' }, ...QUESTION_GROUPS].map((g) => (
              <button
                key={g.id}
                onClick={() => setGroup(g.id as QuestionGroup | 'all')}
                aria-pressed={group === g.id}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  group === g.id
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-slate-700/30 border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.id} className={`${CARD} p-5`}>
            <h3 className="text-lg font-bold mb-1">{g.label}</h3>
            <p className="text-sm text-slate-400 mb-3">{g.blurb}</p>
            <div className="flex flex-col gap-2">
              {shown
                .filter((q) => q.group === g.id)
                .map((q) => (
                  <Question key={q.id} question={q} />
                ))}
            </div>
          </div>
        ))}

        {shown.length === 0 && (
          <div className={`${CARD} p-5`}>
            <p className="text-sm text-slate-400">
              Nothing matches that combination — try widening the tool or the topic.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
