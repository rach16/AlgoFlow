/**
 * AI in testing, in both directions.
 *
 * WHY THIS EXISTS. "How are you using AI in your testing?" is now asked in almost every SDET loop,
 * and it is one of the few questions where both obvious answers lose. Dismissing it reads as
 * incurious; enthusing about it reads as somebody who has not yet been burned. What lands is a
 * position: here is what I hand to it, here is what I refuse to, and here is the new failure mode
 * it introduces.
 *
 * The second direction matters more for the job hunt. Companies are hiring testers specifically to
 * test AI-powered features, and that work has a genuinely different shape — there is no single
 * correct output, so the assertion becomes a metric over a set rather than an equality on one
 * result. Most candidates have never thought about it, which makes it the cheapest place to be
 * clearly better than the field.
 *
 * ON THE TONE. This is deliberately unimpressed by vendor claims and deliberately not dismissive
 * of the technology. Both halves of that are load-bearing in a room.
 */

export interface Position {
  id: string;
  /** The answer as it usually comes out. */
  answer: string;
  /** Why it costs you. */
  problem: string;
  verdict: 'bad' | 'good';
}

export const POSITIONS: Position[] = [
  {
    id: 'dismissive',
    answer: '“I don’t really use it — I prefer to write my own tests.”',
    problem:
      'Reads as incurious rather than principled. The interviewer is not asking whether you like it; they are asking whether you have formed a view about a tool their team is already using, and "no" tells them you have not looked.',
    verdict: 'bad',
  },
  {
    id: 'credulous',
    answer: '“I use Copilot to generate my tests — it saves a huge amount of time.”',
    problem:
      'Answers a question about judgement with a question about typing speed. It also invites the obvious follow-up — how do you know the generated tests are any good — and if the answer is coverage percentage, the conversation is over.',
    verdict: 'bad',
  },
  {
    id: 'positioned',
    answer:
      '“For the mechanical half — scaffolding, parameterising, test data, converting a case list into skeletons. Not for deciding what to test, and never for the assertion, because a test generated from the implementation encodes today’s bugs as expected behaviour.”',
    problem:
      'This is the answer. It shows the split, names the specific failure mode, and leaves you somewhere to go when they push — which they will, usually by asking how you would catch it.',
    verdict: 'good',
  },
];

export interface TaskCall {
  id: string;
  task: string;
  /** Hand it over, or keep it. */
  hand: boolean;
  why: string;
}

/** The split that makes the answer credible: specific tasks, not a general attitude. */
export const TASK_CALLS: TaskCall[] = [
  {
    id: 'scaffold',
    task: 'Scaffolding a page object or a test file from an existing pattern',
    hand: true,
    why: 'Mechanical, and wrong in ways that are immediately visible — it either compiles and matches the pattern or it does not.',
  },
  {
    id: 'params',
    task: 'Turning one test into a parameterised set from a list of cases you wrote',
    hand: true,
    why: 'You supplied the cases, so the thinking is already done. This is transcription, and it is genuinely faster.',
  },
  {
    id: 'data',
    task: 'Generating realistic test data — names, addresses, edge-case strings',
    hand: true,
    why: 'It is good at the long tail here: unicode names, RTL text, addresses that break a form. Better than most hand-written fixtures.',
  },
  {
    id: 'explain',
    task: 'Explaining an unfamiliar failure or a stack trace',
    hand: true,
    why: 'It narrows where to look, and you verify the answer against the code in the next minute anyway. Being wrong is cheap and obvious.',
  },
  {
    id: 'locators',
    task: 'Writing a locator from a DOM snippet',
    hand: true,
    why: 'Small, checkable, instantly falsifiable. Worth reviewing for whether it chose a structural selector when an accessible name was available.',
  },
  {
    id: 'whattotest',
    task: 'Deciding what to test',
    hand: false,
    why: 'It regresses to the mean of public code, which is happy paths and shallow validation. It will not tell you that the interesting case is a refund arriving before its payment, because most repositories do not contain that thought.',
  },
  {
    id: 'oracle',
    task: 'Writing the assertion — the oracle',
    hand: false,
    why: 'The assertion is the entire content of a test. Everything else is setup. Handing over the one part that encodes what correct means is handing over the test.',
  },
  {
    id: 'fromcode',
    task: 'Generating tests from the implementation',
    hand: false,
    why: 'The tautology trap. A test derived from the code asserts what the code does, so a bug in the code becomes a passing test — and now the bug is protected by a regression test.',
  },
  {
    id: 'triage',
    task: 'Deciding whether a failure is a real bug or a flake',
    hand: false,
    why: 'It will produce a confident answer either way, and the cost of "that one is just flaky" being wrong is a shipped defect nobody re-examines.',
  },
];

export const VERIFICATION_DEBT = {
  definition:
    'Verification debt is the gap that opens when code is produced faster than it can be checked. Generation got roughly free; understanding whether the result is correct did not, so the bottleneck moved from writing to verifying — and unverified work accumulates exactly like unpaid technical debt, except it looks finished.',
  why:
    'It compounds in a way that ordinary technical debt does not, because the artefact that would normally reveal the problem is itself generated. A suite of four hundred AI-written tests around AI-written code can be entirely green and prove nothing, since both sides were derived from the same misunderstanding. Coverage goes up, confidence goes up, and the evidence base under both of them is unchanged.',
  tell:
    'The specific tell is a test that cannot fail for the right reason. If it was written by reading the implementation, it asserts what the implementation does — so it is a change detector, not a correctness check. It will fire on every refactor and stay silent on every real defect, which is exactly backwards.',
  fixes: [
    {
      id: 'spec',
      title: 'Assert against the specification, not the code',
      body: 'Give the model the requirement, the ticket, the API contract — never the implementation — when you want a test that can disagree with the code. If the only input was the code, the output cannot contradict it.',
    },
    {
      id: 'split',
      title: 'Human writes the oracle, machine writes the setup',
      body: 'The split that survives contact: you decide what correct means and write the assertion; it builds the fixtures, the parameterisation and the boilerplate around it. Most of the typing is the second half anyway.',
    },
    {
      id: 'mutation',
      title: 'Measure with mutation score, not coverage',
      body: 'Mutation testing changes the code deliberately — flips a comparison, removes a line — and asks whether any test notices. A generated suite at 95% line coverage that kills 30% of mutants is coverage theatre, and this is the number that shows it. It is also the strongest possible answer to "how do you know the generated tests are any good".',
    },
    {
      id: 'review',
      title: 'Review generated tests harder than written ones',
      body: 'They arrive plausible, consistent and confident, which is precisely why they get skimmed. The specific things to look for: an assertion that restates the input, a mock asserted against itself, a test with no possible failing execution, and a name that promises more than the body checks.',
    },
    {
      id: 'budget',
      title: 'Treat review capacity as the real constraint',
      body: 'If a team can generate a thousand lines an hour and review two hundred, the ceiling is two hundred. Generating more does not raise throughput; it raises the amount of unreviewed work that looks finished, which is the debt.',
    },
  ],
};

export interface ToolClaim {
  id: string;
  name: string;
  claim: string;
  how: string;
  /** The unflattering part, stated plainly. */
  catch: string;
  /** When it is genuinely the right call. */
  goodFor: string;
  say: string;
}

export const TOOL_CLAIMS: ToolClaim[] = [
  {
    id: 'healing',
    name: 'Self-healing locators',
    claim: 'Tests stop breaking when the UI changes.',
    how:
      'The tool records many attributes for each element — id, classes, text, position, neighbours, accessibility properties — and when the primary locator misses, it scores candidates on the remaining attributes and picks the closest match, then rewrites the locator.',
    catch:
      'A test that no longer fails when the UI changes is a test that no longer notices when the UI changes — and sometimes the change was the bug. If a Delete button and a Download button sit side by side and the id moves, healing can quietly retarget onto the wrong one and keep passing. The failure mode is a green suite, which is the worst kind.',
    goodFor:
      'Churny internal applications where the markup genuinely moves every sprint and the tests are smoke coverage rather than a release gate. There, constant locator maintenance really is the bigger cost.',
    say:
      'I would take it for smoke coverage on a fast-moving internal app, and not on a release gate. And I would want every heal reported and reviewed rather than applied silently — a heal is a change to what the test means.',
  },
  {
    id: 'visual',
    name: 'Visual and anomaly assertions',
    claim: 'Catch anything that looks wrong, without writing assertions.',
    how:
      'A baseline screenshot is compared perceptually rather than pixel by pixel, with ignore regions and tolerances, and some tools add anomaly detection to flag layout that looks unlike previous runs.',
    catch:
      '"Did anything change" is a weak oracle pointed in the wrong direction. It fires on every intentional redesign and stays quiet on a total that is wrong but correctly formatted. Baseline maintenance then becomes its own job, and a team that approves diffs in bulk has turned the tool off without saying so.',
    goodFor:
      'Layout, theming, responsive breakpoints and third-party embeds — the class of defect that functional assertions genuinely cannot see. Narrowly scoped to a component, it earns its place.',
    say:
      'Scoped to components and paired with functional assertions, yes. Full-page snapshots as the main safety net produce a diff queue nobody reads within a month.',
  },
  {
    id: 'agents',
    name: 'Agents that drive the browser',
    claim: 'Describe the goal in English and the agent explores and tests the app.',
    how:
      'A model with a browser tool takes a natural-language objective, looks at the page, decides the next action, and repeats — either following a described journey or exploring to find problems.',
    catch:
      'It does something slightly different on every run, and a test that varies each run is not a regression test — you cannot bisect it, and a failure is not reproducible. It is also slow and costs real money per run, which rules it out of a per-commit gate. And it reports plausible defects that are not defects, so somebody has to triage.',
    goodFor:
      'Exploratory sweeps, crawling for crashes and broken links, and generating candidate cases a human then curates. Non-determinism is an asset when you are hunting for the unknown and a liability when you are guarding the known.',
    say:
      'As an exploratory tool feeding a human, genuinely useful. As a regression gate, it fails the one property a gate needs, which is that the same input gives the same answer.',
  },
  {
    id: 'genfromreq',
    name: 'Test generation from requirements',
    claim: 'Paste the ticket, get the test suite.',
    how:
      'The model reads a requirement or a user story and emits cases and code against it.',
    catch:
      'It produces the cases a competent person would produce in five minutes, which is the happy path and obvious validation. The dimensions that separate a good tester — concurrency, partial failure, permission, the state that only breaks on the second attempt — are exactly the ones under-represented in whatever it learned from.',
    goodFor:
      'A first draft to react to. Reviewing a list and noticing what is missing is a different and easier task than starting from a blank page, and it is a legitimate use.',
    say:
      'I use it to get a straw man, then spend my time on what it did not think of — which is reliably concurrency and failure. The value is in the gap, not in the list.',
  },
];

export type EvalGroupId = 'quality' | 'repro' | 'safety' | 'ops';

export interface EvalGroup {
  id: EvalGroupId;
  label: string;
  /** What the whole group is about, so the tabs are not just labels. */
  blurb: string;
}

/**
 * Eleven cards read as a list; grouped, they read as an argument. The order is the order you
 * meet the problems: you cannot grade the output, then you cannot reproduce the run, then you
 * discover the input is an attack surface, and only then does somebody look at the bill.
 */
export const EVAL_GROUPS: EvalGroup[] = [
  {
    id: 'quality',
    label: 'Grading output',
    blurb:
      'The oracle problem, restated for generative output. There is no single right answer, so the assertion stops being an equality on one result and becomes a score over a set — and then you have to test the thing doing the scoring.',
  },
  {
    id: 'repro',
    label: 'Reproducibility',
    blurb:
      'A test you cannot rerun is not a test. Two things move underneath you here: the sampling, which you can mostly pin, and the provider, which you cannot — a model updated behind the same name is a breaking change with no changelog.',
  },
  {
    id: 'safety',
    label: 'The new attack surface',
    blurb:
      'Natural language is now an input to control flow. Everything the model reads — a document, a ticket, a calendar invite — can carry instructions, and the model has no reliable way to tell data from instruction. Refusing too much belongs here too, because it is the same dial.',
  },
  {
    id: 'ops',
    label: 'Cost and data',
    blurb:
      'The two regressions that no functional test catches: a prompt change that quietly adds a paragraph to every request, and a context assembly step that ships more of the customer to a third party than anyone intended.',
  },
];

export interface EvalCard {
  id: string;
  group: EvalGroupId;
  title: string;
  body: string;
  /** The concrete practice, so it is not just a concept. */
  practice: string;
}

/** Testing a feature that is itself powered by a model. The half nobody prepares for. */
export const EVAL_CARDS: EvalCard[] = [
  {
    id: 'oracle',
    group: 'quality',
    title: 'There is no single correct output',
    body:
      'Every technique in the rest of this app assumes you can say what the right answer is. With generative output you usually cannot: a support reply can be phrased a thousand ways and be correct in all of them. Asserting equality against a stored string produces a test that fails on every harmless rewording, so people delete it, and then nothing is tested at all.',
    practice:
      'Assert on properties instead of on the text: does it cite a real order, is it under the length limit, does it decline to promise a refund, is it in the customer’s language. Properties survive rewording and still catch the failures that matter.',
  },
  {
    id: 'evalset',
    group: 'quality',
    title: 'An eval set is the test suite',
    body:
      'The unit of testing moves from one case to a curated set — inputs paired with graded expectations, run together, scored as a whole. A single output being wrong tells you almost nothing, because the same input can produce a different output tomorrow. The aggregate is the signal.',
    practice:
      'Build the set from real traffic and real incidents rather than imagination, keep it versioned in the repo, and hold out a slice you never look at so you are not tuning against your own test. A hundred well-chosen cases beat ten thousand generated ones.',
  },
  {
    id: 'threshold',
    group: 'quality',
    title: 'Thresholds, not equality',
    body:
      'The gate becomes "at least 92% of the eval set passes" rather than "this test passes". That feels uncomfortable coming from deterministic testing, and it is the right shape — but it needs a second guard, because an aggregate can hold steady while a specific category collapses.',
    practice:
      'Gate on the overall score and on per-category minimums, and keep a small set of cases that must never regress — the ones tied to a past incident or a legal requirement. Those are equality assertions and they stay.',
  },
  {
    id: 'judge',
    group: 'quality',
    title: 'LLM-as-judge, and its biases',
    body:
      'Grading thousands of outputs by hand does not scale, so a model grades them — which works, and comes with measurable biases. Judges prefer longer answers, prefer whichever candidate is shown first, and rate output from their own family more highly. A judge is a component with an error rate, not an authority.',
    practice:
      'Validate the judge against human labels on a sample and track its agreement rate as a number. Randomise position, keep the rubric explicit and narrow, and use a different model family from the one under test where you can.',
  },
  {
    id: 'determinism',
    group: 'repro',
    title: 'Temperature zero is not determinism',
    body:
      'Setting temperature to zero reduces variation; it does not eliminate it, because batching, hardware and floating-point non-associativity still move the result. And the larger source of change is outside your repository entirely: a provider updating a model behind the same name is a breaking change with no changelog and no version bump.',
    practice:
      'Pin model versions explicitly, run the eval suite on a schedule as well as on your own changes so provider drift is caught, and record the model version with every eval result so a score drop can be attributed.',
  },
  {
    id: 'prompts',
    group: 'repro',
    title: 'A prompt change is a code change',
    body:
      'Prompts are the logic of the feature and they are edited casually, often outside the pull-request flow, sometimes in a vendor console by someone who is not an engineer. A single wording change can move behaviour across the whole eval set.',
    practice:
      'Version prompts in the repository, require the eval suite to run on any prompt change, and refuse the pattern where prompts live only in a hosted dashboard with no history.',
  },
  {
    id: 'injection',
    group: 'safety',
    title: 'Prompt injection is a test class',
    body:
      'Direct injection is the user telling the model to ignore its instructions. The one that actually bites is indirect: the instruction arrives inside content the model retrieves — a document, a web page, a support ticket, a calendar invite — and the model has no reliable way to tell data from instruction. If the feature can act on the world, this is an authorisation hole with a natural-language interface.',
    practice:
      'Keep a corpus of injection attempts as a standing suite, covering both direct and content-borne. Assert on what the system did, not on what it said — the only real guarantee is that the tools it can call are scoped to what the user is permitted to do.',
  },
  {
    id: 'grounding',
    group: 'safety',
    title: 'Grounding and hallucination',
    body:
      'For anything retrieval-backed, the failure that matters is a confident answer unsupported by the retrieved documents. It reads exactly like a good answer, which is why human review misses it at scale and why it needs a mechanical check.',
    practice:
      'Assert faithfulness: every claim traceable to a retrieved passage, and every citation resolving to a document that actually contains it. A fabricated citation is the cheapest hallucination to detect automatically, and its presence predicts the rest.',
  },
  {
    id: 'refusal',
    group: 'safety',
    title: 'Over-refusal is a defect too',
    body:
      'Guardrail testing usually only measures the unsafe direction. A model that refuses a legitimate question — a customer asking about their own order, a medical question from a clinician — is a product failure, and it is invisible if the only metric is harmful-output rate.',
    practice:
      'Two sets: things it must refuse, and things it must not refuse. Track both, because tightening one always moves the other, and only measuring one direction guarantees the trade goes unnoticed.',
  },
  {
    id: 'cost',
    group: 'ops',
    title: 'Cost and latency are assertions',
    body:
      'Tokens are money and the bill scales with traffic, so a prompt change that adds a paragraph of instructions to every request is a cost regression that no functional test will catch. Latency behaves the same way, and a retry-on-failure policy multiplies both.',
    practice:
      'Assert on tokens per request and p95 latency in the eval run, with a budget that fails the build. It is the one place where a test that fails on cost is entirely reasonable.',
  },
  {
    id: 'pii',
    group: 'ops',
    title: 'What ends up in the prompt',
    body:
      'Whatever context the feature assembles gets sent to a third party and frequently logged in full for debugging. That is a data-protection question hiding inside a technical one, and it is usually discovered during an audit rather than during testing.',
    practice:
      'Test what the outbound request actually contains, not what the code intends it to contain, and assert that traces and logs redact it. Include the retrieval step, since that is where an unrelated customer’s data most often arrives.',
  },
];

export interface AiInterviewQa {
  question: string;
  answer: string;
}

export const AI_QA: AiInterviewQa[] = [
  {
    question: 'How are you using AI in your testing today?',
    answer:
      'For the mechanical half — scaffolding, parameterising a case list I wrote, generating awkward test data, and narrowing down an unfamiliar failure. Not for deciding what to test, because it regresses to happy paths, and not for the assertion. The specific line I hold is that I never generate a test from the implementation: the test then asserts what the code does, so a bug becomes a passing test and is now protected by a regression test.',
  },
  {
    question: 'Your team generated four hundred tests with AI. How do you know they are any good?',
    answer:
      'Coverage will not tell me, so I would run mutation testing: change the code deliberately — flip a comparison, delete a line — and see how many mutants the suite kills. A generated suite at 95% line coverage killing 30% of mutants is coverage theatre, and that number is the argument. Then I would read a sample for the specific tells: an assertion restating the input, a mock asserted against itself, a test with no execution path that could fail.',
  },
  {
    question: 'How would you test a feature powered by an LLM?',
    answer:
      'I would stop trying to assert equality on the output and move to an eval set — real inputs from traffic and past incidents, graded on properties rather than exact text, gated on an overall threshold plus per-category minimums. A small set of never-regress cases stays as hard assertions. Then the things that are not about output quality at all: prompt injection as a standing suite, faithfulness to retrieved documents, over-refusal as well as unsafe output, and token cost and latency asserted with a budget. And I would pin the model version, because a provider updating it is a breaking change with no changelog.',
  },
  {
    question: 'Are self-healing locators a good idea?',
    answer:
      'For smoke coverage on a fast-moving internal app, yes — locator churn there is a real cost. On a release gate, no, because a test that stops failing when the UI changes has stopped noticing when the UI changes, and sometimes the change was the bug. The version I would accept anywhere is one that reports every heal for review rather than applying it silently, since a heal alters what the test means.',
  },
  {
    question: 'Does AI make SDETs redundant?',
    answer:
      'It removes the typing, which was never the hard part. The hard part is deciding what to test and knowing whether the answer is right, and generation makes that scarcer rather than less necessary — code arrives faster than anyone can verify it, so the reviewing capacity becomes the bottleneck. And there is a whole class of feature now shipping that most testers have no method for. The work moved; it did not shrink.',
  },
];

/* ------------------------------------------------------------------------------------------- *
 * The mutation lab.
 *
 * "How do you know the generated tests are any good" is the follow-up to every answer about AI
 * and testing, and coverage cannot answer it. The only way to make that concrete is to show two
 * suites that both reach 100% line coverage over the same twelve lines, and then break the code
 * nine ways and count who notices.
 *
 * The numbers below are not illustrative — they are what these suites actually do against these
 * mutants. Suite one was written by reading `orderTotal` and recording what it returned, which is
 * exactly how generated tests arrive. It reaches 3 of 8 killable mutants. Suite two was written
 * from the pricing rules before anybody opened the implementation, and reaches 8.
 * ------------------------------------------------------------------------------------------- */

export interface MutationSuite {
  id: string;
  name: string;
  /** Where the tests came from — the whole point of the comparison. */
  origin: string;
  tests: string;
  /** Line coverage, which is identical for both and is the joke. */
  coverage: number;
  verdict: string;
}

export interface Mutant {
  id: string;
  /**
   * What the edit did, in a few words. The collapsed row leads with this rather than with the
   * mutated line, because several mutations are invisible as fragments — dropping the round2()
   * call leaves a line that reads exactly like untouched code.
   */
  label: string;
  /** 1-based line in SUBJECT that the mutation edits. */
  line: number;
  original: string;
  mutated: string;
  /** What the mutated program now does differently. */
  meaning: string;
  /** Suite ids whose tests fail against this mutant. */
  killedBy: string[];
  /** Why the suites that miss it miss it. Empty when nothing misses it. */
  escapes: string;
  /**
   * An equivalent mutant is behaviourally identical to the original, so no test can kill it.
   * Real runs are full of these and they are the reason mutation score is never quoted as 100%.
   */
  equivalent?: boolean;
}

export const MUTATION_SUBJECT = `1   export function orderTotal(items: Item[], member: boolean): number {
2     let subtotal = 0;
3     for (const item of items) {
4       subtotal += item.price * item.qty;
5     }
6     let discount = 0;
7     if (member && subtotal >= 100) {
8       discount = subtotal * 0.1;
9     }
10    const shipping = subtotal - discount >= 50 ? 0 : 6;
11    return round2(subtotal - discount + shipping);
12  }`;

export const MUTATION_SPEC = [
  'Members get 10% off once the basket reaches £100. The threshold is inclusive.',
  'Shipping is a flat £6, free once the basket reaches £50 after any discount. That threshold is inclusive too.',
  'Line totals are price × quantity. The order total is rounded to two decimal places.',
];

export const MUTATION_SUITES: MutationSuite[] = [
  {
    id: 'generated',
    name: 'Generated from the implementation',
    origin:
      'The model was shown orderTotal() and asked for tests. Every expected value here was obtained by running the function, which is what makes the suite green by construction — and what makes it unable to disagree with the code.',
    tests: `it('totals a single item', () =>
  expect(orderTotal([{ price: 20, qty: 1 }], false)).toBe(26));

it('applies the member discount', () =>
  expect(orderTotal([{ price: 200, qty: 1 }], true)).toBe(180));

it('charges shipping on a small order', () =>
  expect(orderTotal([{ price: 45, qty: 1 }], false)).toBe(51));

it('adds up two items', () =>
  expect(orderTotal(
    [{ price: 30, qty: 1 }, { price: 15, qty: 1 }], false)).toBe(51));

it('handles an empty basket', () =>
  expect(orderTotal([], false)).toBe(6));`,
    coverage: 100,
    verdict:
      'Five tests, every line executed, everything green. It will also stay green through a discount applied to the wrong people, a quantity that stops counting, and both threshold bugs — because it never asked a question the code had not already answered.',
  },
  {
    id: 'spec',
    name: 'Written from the pricing rules',
    origin:
      'Same function, but the cases came from the three rules above before anybody opened the implementation. Note what appears immediately and is absent from the generated suite: both inclusive boundaries, a quantity above one, and a discount that does not divide evenly.',
    tests: `it('counts quantity, not just line price', () =>
  expect(orderTotal([{ price: 10, qty: 3 }], false)).toBe(36));

it('discounts at exactly £100', () =>
  expect(orderTotal([{ price: 100, qty: 1 }], true)).toBe(90));

it('does not discount a non-member at £200', () =>
  expect(orderTotal([{ price: 200, qty: 1 }], false)).toBe(200));

it('ships free at exactly £50 after discount', () =>
  expect(orderTotal([{ price: 50, qty: 1 }], false)).toBe(50));

it('charges shipping a penny below the threshold', () =>
  expect(orderTotal([{ price: 49.99, qty: 1 }], false)).toBe(55.99));

it('rounds a discount that does not divide evenly', () =>
  expect(orderTotal([{ price: 43.30, qty: 3 }], true)).toBe(116.91));

it('charges shipping on an empty basket', () =>
  expect(orderTotal([], false)).toBe(6));`,
    coverage: 100,
    verdict:
      'Seven tests, the same 100% line coverage, and every killable mutant dies. The difference is not effort or count — it is that each case was chosen to answer a question, so each one can come back with an answer nobody expected.',
  },
];

export const MUTANTS: Mutant[] = [
  {
    id: 'qty',
    label: 'Quantity stops counting',
    line: 4,
    original: 'subtotal += item.price * item.qty;',
    mutated: 'subtotal += item.price;',
    meaning: 'Quantity stops counting. Ordering three of something charges for one.',
    killedBy: ['spec'],
    escapes:
      'Every fixture in the generated suite uses qty: 1, where price × 1 and price are the same number. The suite has two items in one basket but never two of one item, so the multiplication is never actually exercised.',
  },
  {
    id: 'discount-boundary',
    label: 'Discount threshold made exclusive',
    line: 7,
    original: 'if (member && subtotal >= 100) {',
    mutated: 'if (member && subtotal > 100) {',
    meaning:
      'The discount threshold becomes exclusive. A member with exactly £100 in the basket is charged full price.',
    killedBy: ['spec'],
    escapes:
      'The only member basket in the generated suite is £200, which is over the line either way. This is the classic off-by-one and it is invisible to any suite that never sits on the boundary.',
  },
  {
    id: 'member-or',
    label: 'Membership no longer required',
    line: 7,
    original: 'if (member && subtotal >= 100) {',
    mutated: 'if (member || subtotal >= 100) {',
    meaning:
      'Membership stops being required. Anyone spending £100 gets the member discount — revenue walking out of the door on every large order.',
    killedBy: ['spec'],
    escapes:
      'The generated suite has non-member baskets, but all of them are under £100, so the second half of the condition is false anyway and the swapped operator changes nothing. The missing case is a non-member spending enough to qualify — which is the whole point of the rule.',
  },
  {
    id: 'rate',
    label: 'Discount rate off by a point',
    line: 8,
    original: 'discount = subtotal * 0.1;',
    mutated: 'discount = subtotal * 0.11;',
    meaning: 'The discount rate is wrong by a percentage point.',
    killedBy: ['generated', 'spec'],
    escapes: '',
  },
  {
    id: 'shipping-boundary',
    label: 'Free-shipping threshold made exclusive',
    line: 10,
    original: 'subtotal - discount >= 50 ? 0 : 6',
    mutated: 'subtotal - discount > 50 ? 0 : 6',
    meaning:
      'Free shipping becomes exclusive. A basket at exactly £50 after discount is charged the £6 it should not be.',
    killedBy: ['spec'],
    escapes:
      'The generated suite has orders at £45, £51 and £180 after discount. None of them land on £50, so the comparison is never tested at the only value where the two operators differ.',
  },
  {
    id: 'shipping-free',
    label: 'Shipping is free for everyone',
    line: 10,
    original: '? 0 : 6',
    mutated: '? 0 : 0',
    meaning: 'Shipping becomes free for everyone.',
    killedBy: ['generated', 'spec'],
    escapes: '',
  },
  {
    id: 'rounding',
    label: 'Rounding dropped',
    line: 11,
    original: 'return round2(subtotal - discount + shipping);',
    mutated: 'return subtotal - discount + shipping;',
    meaning:
      'Rounding is dropped, so a total can arrive as 116.91000000000001 and be displayed, charged or compared that way.',
    killedBy: ['spec'],
    escapes:
      'Every expected value in the generated suite is a whole number, so there is nothing to round and removing the rounding changes none of them. It takes one price like £43.30 × 3 to make the difference visible.',
  },
  {
    id: 'sign',
    label: 'Shipping subtracted, not added',
    line: 11,
    original: 'subtotal - discount + shipping',
    mutated: 'subtotal - discount - shipping',
    meaning: 'Shipping is subtracted from the order instead of added to it.',
    killedBy: ['generated', 'spec'],
    escapes: '',
  },
  {
    id: 'negative-zero',
    label: 'Subtotal starts at negative zero',
    line: 2,
    original: 'let subtotal = 0;',
    mutated: 'let subtotal = -0;',
    meaning:
      'Nothing. In JavaScript -0 + x === x for every x, and -0 === 0, so no input can distinguish this program from the original.',
    killedBy: [],
    escapes:
      'This is an equivalent mutant, and it is unkillable by definition. Real runs produce them constantly, which is why a mutation score is never 100% and why the honest number excludes them — and why the survivor list needs a human read rather than a threshold alone.',
    equivalent: true,
  },
];

export const MUTATION_VERDICT = {
  coverage:
    'Both suites execute all twelve lines. Line coverage cannot separate them, and neither can branch coverage — every branch is taken by both. Coverage measures whether a line ran, and a line that ran while nobody was checking the result counts exactly the same as one that ran under a real assertion.',
  score:
    'Mutation score separates them at a glance: 3 of 8 against 8 of 8, on code with identical coverage. That is the number to quote when somebody asks how you know four hundred generated tests are worth anything, because it is measuring the property you actually care about — can this suite fail for the right reason.',
  cost:
    'It is not free. A full run compiles and executes the suite once per mutant, so it is an overnight or per-release job rather than a per-commit gate, and every survivor needs a human read to separate a real gap from an equivalent mutant. The usual shape is to scope it to the code that would hurt — pricing, permissions, anything with money or access in it — rather than the whole repository.',
  say: 'I would not gate on it. I would run it over the payment and permission modules on a schedule, and treat the survivor list as a to-do rather than a score. The first run on a generated suite is usually the argument that ends the conversation about whether coverage is enough.',
};
