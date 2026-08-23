/**
 * Amazon's Leadership Principles, framed for an SDET.
 *
 * WHY THIS EXISTS. Amazon does not run one behavioral round — Leadership Principles are scored in
 * every round of the loop, each interviewer owns two or three of them, and one interviewer is a
 * Bar Raiser from another org whose job is to press hardest on exactly this. Reported preparation
 * is two to three stories per principle, which is sixteen to twenty-one prepared stories. No
 * amount of algorithm practice substitutes.
 *
 * ON THE WORDING. The principle names are Amazon's. Everything else here is written from scratch:
 * `probing` is what the question is actually assessing, `prompts` are scaffolding for your own
 * story, `antiPatterns` are the ways this specific principle gets answered badly. Amazon's own
 * descriptions of its principles are not reproduced — you should read those on Amazon's site, and
 * a paraphrase would be more useful for interview prep anyway.
 *
 * ON THE EXAMPLES. The seven principles reported most often carry a worked example. It is
 * deliberately behind a reveal in the UI, and deliberately somebody else's story: the point is to
 * calibrate the level of specificity expected, not to be recited.
 */

export interface StarExample {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface LeadershipPrinciple {
  id: string;
  name: string;
  /** One of the seven most consistently reported in SDET loops. */
  core: boolean;
  /** What the interviewer is really assessing, as opposed to the surface question. */
  probing: string;
  /** Scaffolding prompts, specific to this principle rather than generic STAR. */
  prompts: string[];
  /** How this principle specifically gets answered badly. */
  antiPatterns: string[];
  /** Present for the core seven. Shown collapsed, after you have written your own. */
  example?: StarExample;
}

export const LEADERSHIP_PRINCIPLES: LeadershipPrinciple[] = [
  {
    id: 'customer-obsession',
    name: 'Customer Obsession',
    core: true,
    probing:
      'Whether you reason about user-visible impact, or about coverage numbers that make the dashboard look good.',
    prompts: [
      'Who was the customer — an end user, or the engineers who depend on your suite? Say which.',
      'What did the failure actually cost them: a broken checkout, a slow release, a lost weekend on-call?',
      'What did you choose NOT to test because it did not affect them?',
    ],
    antiPatterns: [
      'Talking about coverage percentage as if it were the goal.',
      'A story where the customer is never named and the impact is never quantified.',
      'Claiming you advocated for the customer without saying who you had to push back against.',
    ],
    example: {
      situation:
        'Our checkout suite reported 94% coverage, but two payment failures reached production in one quarter — both in the retry path after a gateway timeout.',
      task:
        'I owned the payments test suite and had to explain why high coverage was not catching real failures.',
      action:
        'I pulled the last six months of production incidents and mapped each to whether a test could plausibly have caught it. Four of six sat in code paths the suite executed but never asserted on. I stopped adding new tests, wrote assertions for the timeout and partial-failure paths, and deleted eleven tests that only exercised getters to stop them inflating the number.',
      result:
        'Coverage dropped to 88% and I presented that as the win. No payment failure reached production in the following two quarters, and the incident-to-test mapping became a review step for the team.',
    },
  },
  {
    id: 'ownership',
    name: 'Ownership',
    core: true,
    probing:
      'Whether you fixed the underlying problem or filed a ticket and considered your part finished.',
    prompts: [
      'Where did your job formally end, and what did you do past that line?',
      'What was the thing nobody had asked you to do?',
      'If you handed it off, what did you do to make sure it landed?',
    ],
    antiPatterns: [
      '"I raised it with the team" as the entire action.',
      'A story where the fix was someone else\'s work and you narrate it in the first person plural.',
      'Owning a success but describing a failure as something that happened to you.',
    ],
    example: {
      situation:
        'A service my team tested had no owner after a reorg. Its integration tests had been failing for three weeks and everyone was re-running them.',
      task:
        'It was not my service and not my sprint. But my team\'s release gate depended on it being green.',
      action:
        'I traced the failures to a schema change in an upstream service and found the migration had never been applied to the staging database. I applied it, fixed the four tests that had encoded the old schema, then wrote up who the upstream owners were and got the service formally assigned in the service registry so the next person would not have to guess.',
      result:
        'The gate went green and stayed green. The registry entry meant two later incidents got routed correctly in minutes instead of hours.',
    },
  },
  {
    id: 'dive-deep',
    name: 'Dive Deep',
    core: true,
    probing:
      'Whether you can go from a symptom to a root cause with evidence, rather than guessing until it stops happening.',
    prompts: [
      'What was the symptom, and what did the first plausible explanation turn out to be?',
      'What did you measure or instrument? Name the actual tool.',
      'What surprised you — the detail that overturned your first theory?',
    ],
    antiPatterns: [
      'Calling a retry a fix.',
      'A story with no numbers in it.',
      'Skipping straight to the answer without showing how you narrowed it down.',
    ],
    example: {
      situation:
        'One end-to-end test failed roughly one run in twelve, only in CI, never locally. It had been quarantined for two months.',
      task:
        'I picked it up because the quarantine list had grown to nine tests and was becoming the norm.',
      action:
        'I added timing around each step and ran it a hundred times in CI. The failures clustered at the same assertion but the step before it varied by 40 ms to 2.1 s. That pointed at a wait, not the assertion. The page fetched a config blob asynchronously and the test asserted on a default value that got overwritten once the fetch resolved — so it passed only when the fetch was slow. Locally the fetch was always slow because of a proxy.',
      result:
        'I replaced the sleep with a wait on the config-loaded state and the test has not failed since. I audited the other eight quarantined tests for the same shape and three of them were the same bug.',
    },
  },
  {
    id: 'bias-for-action',
    name: 'Bias for Action',
    core: true,
    probing:
      'Whether you can move without complete information, and whether you know which decisions are reversible.',
    prompts: [
      'What information did you not have, and why was waiting worse than moving?',
      'Was the decision reversible? Say so explicitly — that is the judgment being tested.',
      'What did you deliberately do badly in order to be fast?',
    ],
    antiPatterns: [
      'A story where speed caused a problem and you do not acknowledge it.',
      'Recklessness dressed as urgency, with no mention of what could have gone wrong.',
      'Waiting for permission and calling it stakeholder alignment.',
    ],
    example: {
      situation:
        'Two days before a release, a partner changed an API response shape with no notice. Our contract tests caught it; the fix needed a decision about whether to support both shapes.',
      task:
        'The right long-term answer needed a design discussion nobody had time for.',
      action:
        'I shipped a narrow adapter that normalised both shapes, behind a flag, with a comment naming it as temporary and a ticket linked. I did not try to generalise it. I told the team in standup that I had chosen the ugly reversible option over the clean one and why.',
      result:
        'The release went out on time. We removed the adapter three weeks later after the proper discussion, and the flag meant removal was a one-line change rather than an archaeology exercise.',
    },
  },
  {
    id: 'earn-trust',
    name: 'Earn Trust',
    core: true,
    probing:
      'Whether you deliver bad news early and own your own misses, or manage perceptions.',
    prompts: [
      'What was the uncomfortable thing you had to say, and who did you say it to?',
      'If it was your mistake: how did you find out, and how fast did you tell someone?',
      'What did you do to make the relationship better afterwards, not just the incident?',
    ],
    antiPatterns: [
      'A story where you were right and everyone else was wrong.',
      'Trust described as being liked rather than being relied on.',
      'A "mistake" so small it costs you nothing to admit.',
    ],
    example: {
      situation:
        'A bug reached production in a feature I had signed off. My suite had a test for that exact path — I had marked it skipped during a refactor and never re-enabled it.',
      task:
        'The incident review was looking at the developer\'s change as the cause.',
      action:
        'I said in the review that the test existed, that I had disabled it, and that the change would have been caught. I brought the commit. Then I added a CI check that fails the build if the number of skipped tests increases, so the same lapse would be visible rather than depending on me remembering.',
      result:
        'The review conclusion changed to a gap in our process rather than one engineer\'s change. The skipped-test check has blocked eleven merges since, and two of those were mine.',
    },
  },
  {
    id: 'have-backbone',
    name: 'Have Backbone; Disagree and Commit',
    core: true,
    probing:
      'Whether you can hold a position under pressure, and then genuinely commit when the decision goes against you.',
    prompts: [
      'What was the disagreement, and who was on the other side — including if they outranked you?',
      'What evidence did you bring, rather than what opinion did you hold?',
      'How did it end? If you lost, what did committing actually look like in your behaviour?',
    ],
    antiPatterns: [
      'Every story ending with you being proved right.',
      '"Disagree and commit" told as disagree and quietly obstruct.',
      'A disagreement with a peer when the question is really about disagreeing upward.',
    ],
    example: {
      situation:
        'My manager wanted to ship with a known data-loss bug behind a low-traffic flag, arguing the exposure was under 1% of users.',
      task:
        'I thought the exposure calculation was wrong, and I had a week of release pressure pointed at me.',
      action:
        'I pulled the flag\'s actual allocation and found it was 1% of sessions but 11% of accounts, because the flag was sticky per session and heavy users hit it repeatedly. I brought that to her in writing before the release meeting rather than raising it in the room. She still chose to ship, with a narrower allocation. I said I disagreed, then wrote the monitoring for the failure mode myself and was on call for it.',
      result:
        'The narrower allocation held and no data was lost. The session-versus-account distinction became something we check on every flag rollout, which mattered more than winning the original argument.',
    },
  },
  {
    id: 'deliver-results',
    name: 'Deliver Results',
    core: true,
    probing:
      'Whether you finish under real constraints, and whether you can state the outcome as a number.',
    prompts: [
      'What was the constraint — a deadline, a headcount, a broken dependency?',
      'What is the number? Before and after. If you do not have one, this is the wrong story.',
      'What did you cut to get there, and was that the right call in hindsight?',
    ],
    antiPatterns: [
      'A result with no measurement, described as "significantly improved".',
      'Delivering by working weekends, with no mention of what you changed structurally.',
      'A story about effort rather than outcome.',
    ],
    example: {
      situation:
        'Our regression suite took 47 minutes and gated every merge. The team was batching merges to avoid it, which was making failures harder to attribute.',
      task:
        'I was given no extra headcount and told not to reduce coverage.',
      action:
        'I profiled it and found 60% of wall clock in eight tests that each span up a full environment. I split the suite into a 4-minute smoke set that gates merges and a full set that runs post-merge and on a schedule. Then I sharded the slow eight across four workers, which needed fixing three tests that shared a database fixture.',
      result:
        'Merge gate went from 47 minutes to 12. Batching stopped. Mean time to attribute a failure dropped from about a day to under an hour, and coverage was unchanged.',
    },
  },
  {
    id: 'insist-on-highest-standards',
    name: 'Insist on the Highest Standards',
    core: false,
    probing:
      'Whether your bar is actually high, or whether you accept the team\'s current normal and call it pragmatism.',
    prompts: [
      'What did everyone else consider acceptable that you did not?',
      'What was the cost of raising the bar, and who paid it?',
      'How did you make the new standard stick after you stopped pushing?',
    ],
    antiPatterns: [
      'Perfectionism with no shipping.',
      'A standard you imposed rather than one you got others to adopt.',
      'No mention of the trade-off you accepted in return.',
    ],
  },
  {
    id: 'invent-and-simplify',
    name: 'Invent and Simplify',
    core: false,
    probing:
      'Whether you can remove complexity rather than adding a layer on top of it.',
    prompts: [
      'What did you delete, not just what did you build?',
      'What was the simpler thing that the existing design made hard?',
      'Who resisted, and what convinced them?',
    ],
    antiPatterns: [
      'A new framework as the answer to a framework problem.',
      '"Simplified" meaning "moved the complexity somewhere I do not look".',
      'Invention with no adoption.',
    ],
  },
  {
    id: 'are-right-a-lot',
    name: 'Are Right, A Lot',
    core: false,
    probing:
      'Whether your judgment is calibrated — including whether you know when you were wrong.',
    prompts: [
      'What was the call, and what did you know at the time versus later?',
      'Whose view did you seek out because they were likely to disagree with you?',
      'Have a story ready where your judgment was wrong and you corrected fast.',
    ],
    antiPatterns: [
      'Hindsight told as foresight.',
      'Being right through luck, presented as process.',
      'No example of ever having been wrong.',
    ],
  },
  {
    id: 'learn-and-be-curious',
    name: 'Learn and Be Curious',
    core: false,
    probing:
      'Whether you learn things because the work needs them, or collect tools.',
    prompts: [
      'What did you not know, and what forced you to learn it?',
      'How did you learn it — and how fast were you useful?',
      'What did you go and understand that nobody required you to?',
    ],
    antiPatterns: [
      'A list of courses and certifications.',
      'Learning a tool with no problem attached to it.',
      'Curiosity with no output anyone else could see.',
    ],
  },
  {
    id: 'hire-and-develop',
    name: 'Hire and Develop the Best',
    core: false,
    probing:
      'Whether you have made someone else better, with something concrete to point at.',
    prompts: [
      'Who did you help, and what could they do afterwards that they could not before?',
      'What feedback did you give that was hard to give?',
      'If you have interviewed: what did you change about how you assess people?',
    ],
    antiPatterns: [
      'Mentoring described as answering questions.',
      'Taking credit for someone else\'s growth.',
      'No specifics about the person or the change.',
    ],
  },
  {
    id: 'think-big',
    name: 'Think Big',
    core: false,
    probing:
      'Whether you can propose something beyond your own scope and get others to move.',
    prompts: [
      'What was the bigger version of the problem nobody was framing?',
      'Who did you have to convince outside your team?',
      'What was the smallest first step that proved it?',
    ],
    antiPatterns: [
      'A grand plan with no first step.',
      'Scope that was already assigned to you, described as vision.',
      'Thinking big with no evidence anyone was persuaded.',
    ],
  },
  {
    id: 'frugality',
    name: 'Frugality',
    core: false,
    probing:
      'Whether you get results without reaching for more budget, headcount or infrastructure.',
    prompts: [
      'What did you achieve without the resource you were told you needed?',
      'What was the constraint that forced the better design?',
      'What did you reuse rather than build?',
    ],
    antiPatterns: [
      'Cost-cutting that created work for someone else.',
      'Frugality as an excuse for a worse outcome.',
      'No number on the saving.',
    ],
  },
  {
    id: 'earths-best-employer',
    name: "Strive to be Earth's Best Employer",
    core: false,
    probing:
      'Whether you improved the working life of the people around you, not just the output.',
    prompts: [
      'What was making the team\'s work worse — on-call load, flaky gates, meeting sprawl?',
      'What did you change, and did it survive after you?',
      'Whose problem was it that you took on because nobody else would?',
    ],
    antiPatterns: [
      'Team morale described without a mechanism.',
      'Social events as the answer to a structural problem.',
      'A change that helped you specifically.',
    ],
  },
  {
    id: 'broad-responsibility',
    name: 'Success and Scale Bring Broad Responsibility',
    core: false,
    probing:
      'Whether you think about consequences beyond the immediate feature — accessibility, privacy, what breaks at scale.',
    prompts: [
      'What second-order consequence did you catch that nobody was testing for?',
      'Who would have been harmed, and how would you have found out?',
      'What did you add to the process so the next person catches it too?',
    ],
    antiPatterns: [
      'Compliance framed as paperwork.',
      'A concern you raised but did nothing about.',
      'Scale discussed only as load.',
    ],
  },
];

export const CORE_PRINCIPLES = LEADERSHIP_PRINCIPLES.filter((p) => p.core);

/** Reported preparation is two to three stories per principle; two is the working target. */
export const STORIES_PER_PRINCIPLE = 2;

export function principleById(id: string): LeadershipPrinciple | undefined {
  return LEADERSHIP_PRINCIPLES.find((p) => p.id === id);
}
