/**
 * Everything ⌘K can find that is not a problem.
 *
 * WHY THIS EXISTS. The palette indexed the 254 algorithms and nothing else, which was the whole
 * site when it was written. It is now about a third of it: there are twenty-four test-design
 * subjects, twelve SQL exercises, eight build exercises, eleven eval cards, sixteen leadership
 * principles and a pile of ranked reference, none of which were reachable by search. The gap
 * widened with every section added, and the cost is not theoretical — a reference you cannot find
 * from the keyboard is one you will not consult mid-problem, which is the only time it matters.
 *
 * The index is deliberately built from the same data the pages render, so an entry cannot drift
 * from the thing it points at. Nothing here is hand-maintained.
 *
 * WHAT IT DOES NOT DO. Search lands you on the section, not on the specific card — the pages own
 * their internal state (which tab, which exercise is expanded) and threading a deep link through
 * all of them would be a much larger change than this earns. Getting to the right page from the
 * keyboard is most of the value.
 */

import type { AppView } from '../components/layout/navigation';
import { AI_QA, EVAL_CARDS, TOOL_CLAIMS } from '../data/aiTesting';
import { BUILD_EXERCISES } from '../data/buildExercises';
import {
  CI_CARDS,
  CRAFT_REVIEW_TOPICS,
  FRAMEWORKS,
  LOCATORS,
  POM_MISTAKES,
  WAITS,
} from '../data/craft';
import { FLAKE_SCENARIOS } from '../data/flakeScenarios';
import { LEADERSHIP_PRINCIPLES } from '../data/leadershipPrinciples';
import { SQL_EXERCISES } from '../data/sqlExercises';
import { EXERCISES } from '../data/testDesign';
import { TOOL_QUESTIONS } from '../data/toolQuestions';
import { PYRAMID, TECHNIQUES, TESTABILITY_LEVERS } from '../data/testability';

export interface ReferenceEntry {
  /** Unique across the whole index, since the palette keys rows on it. */
  id: string;
  title: string;
  /** The one line under the title in the results list. */
  subtitle: string;
  /** Where picking it takes you. */
  view: AppView;
  /** Shown as a chip, so a result is identifiable without reading the subtitle. */
  section: string;
  /** Everything matchable, pre-lowercased once. */
  haystack: string;
}

function entry(
  id: string,
  view: AppView,
  section: string,
  title: string,
  subtitle: string,
  extra: string[] = []
): ReferenceEntry {
  return {
    id,
    title,
    subtitle,
    view,
    section,
    haystack: [title, subtitle, section, ...extra].join(' ').toLowerCase(),
  };
}

/** Trim a long body down to something that fits one line under the title. */
const line = (text: string, max = 110): string =>
  text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;

export const REFERENCE_ENTRIES: ReferenceEntry[] = [
  ...EXERCISES.map((e) =>
    entry(`design:${e.id}`, 'testdesign', 'Test design', e.title, line(e.prompt), [e.category])
  ),
  ...TECHNIQUES.map((t) =>
    entry(`technique:${t.id}`, 'testability', 'Technique', t.name, line(t.idea), [t.useWhen])
  ),
  ...PYRAMID.map((l) =>
    entry(`pyramid:${l.id}`, 'testability', 'Test pyramid', l.name, line(l.belongs), [l.mistake])
  ),
  ...TESTABILITY_LEVERS.map((l) =>
    entry(`lever:${l.id}`, 'testability', 'Testability', line(l.lever, 60), line(l.smell), [l.say])
  ),
  ...WAITS.map((w) =>
    entry(`wait:${w.id}`, 'craft', 'Waits', w.name, line(w.what), [w.breaks])
  ),
  ...LOCATORS.map((l) =>
    entry(`locator:${l.id}`, 'craft', 'Locators', l.name, line(l.resilience), [
      l.playwright,
      l.selenium,
    ])
  ),
  ...FRAMEWORKS.map((f) =>
    entry(`framework:${f.id}`, 'craft', 'Frameworks', f.name, line(f.pick), [f.cost])
  ),
  ...CRAFT_REVIEW_TOPICS.map((t) =>
    entry(`craft:${t.id}`, 'craft', 'Tooling craft', t.title, line(t.prompt))
  ),
  ...CI_CARDS.map((c) => entry(`ci:${c.id}`, 'craft', 'CI', c.title, line(c.body), [c.rule])),
  ...POM_MISTAKES.map((m) =>
    entry(`pom:${m.id}`, 'craft', 'Page objects', m.title, line(m.problem), [m.fix])
  ),
  // The scenarios never use the word "flaky" — they describe the race, not the symptom — so the
  // term everybody actually searches for is added explicitly rather than left to chance.
  ...FLAKE_SCENARIOS.map((s) =>
    entry(`flake:${s.id}`, 'flake', 'Flake lab', s.title, line(s.symptom), [
      s.why,
      s.fix,
      s.intermittent,
      'flaky flake race intermittent',
    ])
  ),
  ...TOOL_QUESTIONS.map((q) =>
    entry(
      `toolq:${q.id}`,
      'toolqa',
      q.tool === 'both' ? 'Selenium / Playwright' : q.tool === 'selenium' ? 'Selenium' : 'Playwright',
      line(q.question, 70),
      line(q.answer),
      [q.code?.selenium ?? '', q.code?.playwright ?? '', q.followUp]
    )
  ),
  ...AI_QA.map((qa, i) =>
    entry(`aiqa:${i}`, 'ai', 'AI in testing', line(qa.question, 70), line(qa.answer))
  ),
  ...TOOL_CLAIMS.map((t) =>
    entry(`aitool:${t.id}`, 'ai', 'AI tooling', t.name, line(t.catch), [t.claim, t.goodFor])
  ),
  ...EVAL_CARDS.map((c) =>
    entry(`eval:${c.id}`, 'aifeatures', 'Testing AI', c.title, line(c.body), [c.practice])
  ),
  ...SQL_EXERCISES.map((e) =>
    entry(`sql:${e.id}`, 'sql', 'SQL', e.title, line(e.prompt), [e.correct.sql, e.mechanism])
  ),
  ...BUILD_EXERCISES.map((e) =>
    entry(`build:${e.id}`, 'build', 'Build round', e.title, line(e.prompt), [e.assessed])
  ),
  ...LEADERSHIP_PRINCIPLES.map((p) =>
    entry(`lp:${p.id}`, 'behavioral', 'Leadership principle', p.name, line(p.probing))
  ),
  entry(
    'ai:mutation',
    'ai',
    'AI in testing',
    'Mutation lab',
    'Two suites at identical line coverage, nine mutants, and the score that separates them',
    ['mutation score', 'mutant', 'coverage theatre', 'generated tests']
  ),
];
