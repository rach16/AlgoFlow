/**
 * The reference half of test design: technique, layer, and testability.
 *
 * The exercises next door train enumeration. This file holds the three things an interviewer
 * asks about once your list is on the table — what technique produced it, where each case
 * belongs, and what you would change in the product so the case is cheap to write at all.
 *
 * The last of those is the one that separates a tester from an SDET. "How would you test this?"
 * has a good answer. "What would you change so this is testable?" is the question the title is
 * actually for, and it is asked far more often than candidates prepare for.
 */

export interface Technique {
  id: string;
  name: string;
  /** One line: what the technique does to the input space. */
  idea: string;
  /** When it earns its place over just listing cases. */
  useWhen: string;
  /** A concrete, small worked instance. */
  example: string;
  /** How it is misapplied — this is the part interviewers probe. */
  trap: string;
}

export const TECHNIQUES: Technique[] = [
  {
    id: 'equivalence',
    name: 'Equivalence partitioning',
    idea: 'Split the input space into classes whose members should all behave the same, then test one member of each.',
    useWhen: 'Any input with more legal values than you can enumerate — which is nearly all of them.',
    example:
      'An age field: under 13, 13–17, 18–64, 65+, negative, non-numeric, empty. Seven tests instead of a hundred and twenty, and the seven are defensible.',
    trap:
      'Assuming a class is uniform when the code branches inside it. If a discount changes at 60, then "18–64" was never one class — read the rules, not just the field.',
  },
  {
    id: 'boundary',
    name: 'Boundary value analysis',
    idea: 'Test at each edge and one value either side, because < gets typed where <= was meant.',
    useWhen: 'Immediately after partitioning — every class you drew has two edges.',
    example:
      'A 20-character limit: 19, 20, 21. A cart limit of 10: 9, 10, 11. An expiry of 24 hours: 23:59, 24:00, 24:01.',
    trap:
      'Testing the boundary the UI enforces and not the one the storage enforces. A form that caps at 20 in front of a column that caps at 16 fails only via the API.',
  },
  {
    id: 'decision',
    name: 'Decision table',
    idea: 'When the outcome depends on several conditions combining, enumerate the combinations and strike out the impossible ones.',
    useWhen: 'Business rules with two to four independent conditions — pricing, eligibility, permissions.',
    example:
      'Signed in × has a saved card × item in stock → eight rows. Two are unreachable, one is the interesting one nobody had specified: signed in, no card, in stock.',
    trap:
      'It explodes. Past four or five conditions the table stops being readable, and that is the signal to switch to pairwise rather than to keep going.',
  },
  {
    id: 'state',
    name: 'State transition',
    idea: 'Draw the legal states and the transitions between them, then deliberately attempt the illegal ones.',
    useWhen: 'Anything with a lifecycle: orders, sessions, subscriptions, uploads, deployments.',
    example:
      'An order as created → paid → shipped → delivered, with refund reachable from three of them. The tests worth writing are ship-before-pay and refund-twice.',
    trap:
      'Testing one happy path through the diagram and calling it covered. The diagram exists to show you the edges you would not have thought of.',
  },
  {
    id: 'pairwise',
    name: 'Pairwise (all-pairs)',
    idea: 'Most configuration bugs need only two factors to interact, so cover every pair of values rather than every combination.',
    useWhen: 'Configuration matrices — browser × OS × locale × plan × feature flag.',
    example:
      '4 browsers × 3 operating systems × 3 locales × 2 plans is 72 combinations, or about 12 that still cover every pair.',
    trap:
      'A bug that genuinely needs three factors will be missed, by construction. Keep the known-nasty triples in the suite explicitly, alongside the generated set.',
  },
  {
    id: 'guessing',
    name: 'Error guessing',
    idea: 'The cases experience says break things: empty, zero, null, duplicate, the largest anyone has entered, the emoji, the leap day, the daylight-saving hour, the user with one name.',
    useWhen: 'After the systematic techniques, as a deliberate top-up — never as the whole method.',
    example:
      'A booking system tested across the 2am that happens twice in October, and the 2am that never happens in March.',
    trap:
      'Leading with it. It produces good cases and no coverage argument, so an answer built only from it sounds like anecdote rather than method.',
  },
];

export interface PyramidLayer {
  id: string;
  name: string;
  /** What belongs at this layer. */
  belongs: string;
  /** Order-of-magnitude runtime for one test. */
  speed: string;
  /** Why tests here flake, if they do. */
  flake: string;
  /** The specific mistake made at this layer. */
  mistake: string;
}

export const PYRAMID: PyramidLayer[] = [
  {
    id: 'unit',
    name: 'Unit',
    belongs: 'Pure logic in one process with no I/O — the rules, the parsing, the maths, the state machine.',
    speed: 'Milliseconds. Thousands of them run before you finish reading the diff.',
    flake: 'Should not flake at all. If it does, it is touching the clock, randomness, or shared static state.',
    mistake:
      'Mocking so heavily that the test asserts the mock behaves like the mock. If every collaborator is stubbed, the only thing verified is the wiring you wrote in the test.',
  },
  {
    id: 'integration',
    name: 'Integration / component',
    belongs: 'Your service against a real database or a controlled fake dependency, over a real transport.',
    speed: 'Seconds. Hundreds is reasonable; thousands is a slow build.',
    flake: 'Shared state and test ordering. Two tests writing the same row pass alone and fail together.',
    mistake:
      'One database shared across parallel workers. Fix it with per-test data and unique keys, not by turning off parallelism.',
  },
  {
    id: 'contract',
    name: 'Contract',
    belongs: 'The agreed shape between two services, checked from both sides without deploying either against the other.',
    speed: 'Seconds, and it runs in both teams’ pipelines.',
    flake: 'Rarely flaky; usually just absent.',
    mistake:
      'Skipping the layer, then discovering a field rename in a full end-to-end run — where it costs an order of magnitude more to diagnose because everything is a suspect.',
  },
  {
    id: 'e2e',
    name: 'End-to-end',
    belongs: 'A handful of journeys through the real system: the ones whose failure means the product is down.',
    speed: 'Minutes. Ten of these can cost more wall-clock than the entire unit suite.',
    flake: 'The main source in any suite — timing, network, environment drift, test data left behind.',
    mistake:
      'Pushing case coverage here because the UI is where the feature is visible. Every case added at this layer costs roughly a hundred times what the same case costs one layer down, and it fails for a hundred reasons.',
  },
  {
    id: 'exploratory',
    name: 'Exploratory',
    belongs: 'A person, unscripted, with a charter and a time box, hunting for what the model did not predict.',
    speed: 'Half an hour at a time. Not automatable and not a coverage number.',
    flake: 'Not applicable — this layer is where you find out the model was wrong.',
    mistake:
      'Cutting it because it does not produce a green tick. Every automated test you own was once somebody noticing something.',
  },
];

/**
 * The argument for the shape, in one place, because "the pyramid" gets recited without it.
 */
export const PYRAMID_ARGUMENT = {
  rule: 'Push every case to the lowest layer that can still fail for the real reason.',
  why: 'The pyramid is not about how many tests you have. It is about where a failure is cheapest to diagnose. A unit failure names the function; an end-to-end failure names the product.',
  inversion:
    'The inverted shape — the ice-cream cone — is what you get by adding tests where the feature is visible rather than where the logic lives. It passes review, and then the suite takes forty minutes, fails twice a week for reasons nobody can reproduce, and gets ignored.',
};

export interface TestabilityLever {
  id: string;
  /** The symptom you would notice in a suite. */
  smell: string;
  /** The change to the product that removes it. */
  lever: string;
  /** How to put it in the room, since the question is usually "what would you change?". */
  say: string;
}

export const TESTABILITY_LEVERS: TestabilityLever[] = [
  {
    id: 'clock',
    smell: 'Tests sleep. Something fails at midnight, or on the 29th, or only in a different timezone.',
    lever: 'Inject the clock. Time is a dependency, not an ambient fact.',
    say: 'I would ask for a clock the tests can set, so an expiry test moves time forward instead of waiting for it.',
  },
  {
    id: 'ids',
    smell: 'Assertions on generated ids, or a test that only passes when it runs first.',
    lever: 'A seedable generator, or an id factory passed in like any other collaborator.',
    say: 'Randomness injected the same way as the clock — then the failing case is reproducible from the seed in the log.',
  },
  {
    id: 'seams',
    smell: 'new PaymentClient() inside the method under test, so testing the rules requires a network.',
    lever: 'Pass the dependency in. This one change is what moves a case from end-to-end to unit.',
    say: 'A constructor parameter instead of a constructor call — a ninety-second browser test becomes a five-millisecond one.',
  },
  {
    id: 'hooks',
    smell: 'Locators like div > div:nth-child(3) > span, which break on any layout change.',
    lever: 'A stable hook: a role plus an accessible name where possible, a data-testid where it is not.',
    say: 'I prefer querying by role and name, because the locator then also asserts the thing is reachable by a screen reader.',
  },
  {
    id: 'isolation',
    smell: 'Tests that pass alone and fail in parallel, or that need the environment wiped first.',
    lever: 'Each test creates the data it needs under a unique key and cleans up by that key.',
    say: 'No shared fixtures, no truncating tables between tests — isolation by data, so the suite can run at any concurrency.',
  },
  {
    id: 'observable',
    smell: 'Waiting for a spinner to disappear as a proxy for "the background job finished".',
    lever: 'Something that states completion: an endpoint, an event, a status field.',
    say: 'Give me a way to ask whether it finished, and a race becomes an assertion.',
  },
  {
    id: 'controllable',
    smell: 'The suite depends on a third-party sandbox, which is rate limited and occasionally down.',
    lever: 'A fake at your own boundary for the suite, plus a contract test against the real thing on its own schedule.',
    say: 'Fast tests never leave our network; one slow job a day tells us if their contract moved.',
  },
  {
    id: 'idempotent-setup',
    smell: 'The suite only passes on a freshly built environment.',
    lever: 'Setup that converges on the state it needs rather than assuming a starting point.',
    say: 'Setup should be safe to run twice — if it is not, the first flake leaves the environment unusable.',
  },
  {
    id: 'flags',
    smell: 'The new path cannot be exercised until it is on for everyone.',
    lever: 'A flag settable per session or per request, not only per deployment.',
    say: 'Then the same suite covers both branches, and the rollout is a config change rather than a release.',
  },
  {
    id: 'correlation',
    smell: 'An end-to-end failure with no way to find the matching server-side log.',
    lever: 'A request id the test generates, sends, and prints on failure — carried through every log line.',
    say: 'The artefact of a failed test should be the id that finds the trace, not a screenshot of a spinner.',
  },
];

/**
 * Flake arithmetic. The reason "99% reliable" is not a defensible number for a suite, in a form
 * you can say out loud — and the argument for quarantine over retry.
 */
export const FLAKE_MATH = {
  perTest: 0.99,
  sizes: [10, 50, 100, 500],
  /** Chance the whole suite goes green when each test independently passes 99% of the time. */
  greenRate: (perTest: number, count: number): number => perTest ** count,
  point:
    'A suite of 500 tests each 99% reliable is green under 1% of the time. At that point a red build means nothing and people stop reading it, which costs more than the bugs the suite was catching.',
  retries:
    'Retrying hides the arithmetic instead of fixing it: a test that passes on the second attempt is still telling you something is racy. Retry to keep the pipeline moving, quarantine to keep the signal, and fix on a deadline — a quarantine with no expiry is a deletion with extra steps.',
};
