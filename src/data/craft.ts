/**
 * Tooling craft: waits, locators, page objects, CI.
 *
 * WHY THIS EXISTS. Test design says what to test and testability says what to change. This is the
 * part in between — how the test is actually written — and it is where an interview stops being
 * about principles and starts being about whether you have done the work. "How do you handle
 * waits?" is the single most reliable filter question in an SDET screen, because the wrong answer
 * is short and confident and the right one is not.
 *
 * ON THE OPINIONS. These are ranked and the ranking is argued rather than hedged. A reference that
 * says every option has trade-offs is useless in a room where someone is asking what you would
 * actually do. Where a choice genuinely depends, the dependency is named.
 */

export type Verdict = 'never' | 'careful' | 'good' | 'best';

export const VERDICT_META: Record<Verdict, { label: string; accent: string }> = {
  never: { label: 'Never', accent: 'bg-red-500/20 text-red-300' },
  careful: { label: 'With care', accent: 'bg-orange-500/20 text-orange-300' },
  good: { label: 'Good', accent: 'bg-green-500/20 text-green-300' },
  best: { label: 'Reach for this', accent: 'bg-indigo-500/20 text-indigo-300' },
};

export interface WaitStrategy {
  id: string;
  name: string;
  verdict: Verdict;
  /** What it actually does, mechanically. */
  what: string;
  /** The code, so the name maps to something you would recognise in a diff. */
  code: string;
  /** Where it breaks. The part that gets probed. */
  breaks: string;
  /** What to say about it in the room. */
  say: string;
}

export const WAITS: WaitStrategy[] = [
  {
    id: 'sleep',
    name: 'Fixed sleep',
    verdict: 'never',
    what: 'Stops the test for a set duration regardless of what the page is doing.',
    code: 'Thread.sleep(3000);\nawait page.waitForTimeout(3000);',
    breaks:
      'Both ways at once. On a fast machine it wastes almost all of the three seconds, and multiplied across a suite that is where the forty-minute build comes from. On a loaded CI runner the thing takes 3.2 seconds and the test fails anyway — so it is simultaneously the slowest option and not reliable.',
    say:
      'A sleep encodes a guess about someone else’s machine. The only defensible use I have for one is deliberately throttling something, never waiting for it.',
  },
  {
    id: 'implicit',
    name: 'Implicit wait',
    verdict: 'careful',
    what:
      'A Selenium setting that makes every findElement poll for up to N seconds before throwing.',
    code: 'driver.manage().timeouts()\n    .implicitlyWait(Duration.ofSeconds(10));',
    breaks:
      'It only covers finding an element. It does nothing for an element that exists but is not yet clickable, or for text that has not updated yet — the two things you usually need. Worse, mixing it with an explicit wait makes the timeouts compound unpredictably, so a ten-second explicit wait can take fifty. And it slows down every negative assertion: checking something is absent now takes the full timeout every time.',
    say:
      'I set it to zero and use explicit waits. Implicit waits look like they save typing and then quietly change the meaning of every other wait in the suite.',
  },
  {
    id: 'explicit',
    name: 'Explicit wait',
    verdict: 'good',
    what: 'Polls for a named condition, with its own timeout, at the point you need it.',
    code: 'new WebDriverWait(driver, Duration.ofSeconds(10))\n    .until(ExpectedConditions.elementToBeClickable(by));',
    breaks:
      'Waiting for the wrong condition. Presence is the default people reach for and is almost never what they need — an element can be present and invisible, visible and disabled, or visible and covered by a fading overlay. The other failure is waiting for the spinner to disappear as a proxy for the data having arrived, which is a race dressed as a wait.',
    say:
      'Explicit, and for the condition the next line actually depends on — clickable if I am about to click, not merely present.',
  },
  {
    id: 'fluent',
    name: 'Fluent wait',
    verdict: 'good',
    what:
      'An explicit wait with a tuned polling interval and a list of exceptions to swallow while polling.',
    code: 'new FluentWait<>(driver)\n    .withTimeout(Duration.ofSeconds(20))\n    .pollingEvery(Duration.ofMillis(200))\n    .ignoring(StaleElementReferenceException.class);',
    breaks:
      'Ignoring exceptions that were telling you something. Swallowing StaleElementReference while re-resolving is correct; swallowing NoSuchElement for twenty seconds because the locator is wrong turns a two-second failure into a twenty-second one with a worse message.',
    say:
      'Useful when a component genuinely churns while it settles. I would keep the ignore list to the one exception I mean.',
  },
  {
    id: 'autowait',
    name: 'Auto-waiting actionability',
    verdict: 'best',
    what:
      'Playwright re-checks a set of conditions before every action: attached, visible, stable (not animating), enabled, and actually able to receive the event.',
    code: 'await page.getByRole(\'button\', { name: \'Pay\' }).click();',
    breaks:
      'It does not cover your own application state. The button can be perfectly actionable while the data behind it has not loaded, so an action that succeeds proves nothing about the app being ready. It also cannot help if the locator matches two things — that is a strictness error, not a timing one.',
    say:
      'It removes the entire class of waits about the element itself, which leaves me writing waits only about application state — which is where they belonged.',
  },
  {
    id: 'retrying',
    name: 'Retrying assertion',
    verdict: 'best',
    what:
      'The assertion itself polls until it passes or times out, so the wait and the check are one thing.',
    code: 'await expect(page.getByTestId(\'total\')).toHaveText(\'£42.00\');',
    breaks:
      'Asserting on something that is briefly true. A retrying assertion passes the moment the condition holds, so if the total flashes the old value first you can catch either — which is why the assertion should be on the settled state, and why a toHaveCount(0) on a list that has not rendered yet passes for the wrong reason.',
    say:
      'The wait and the assertion should be the same statement. Separating them is what creates the gap where the state changes between checking and acting.',
  },
];

export interface LocatorStrategy {
  id: string;
  name: string;
  rank: number;
  playwright: string;
  selenium: string;
  /** Why it survives, or does not, when the page changes. */
  resilience: string;
  /** When this one is genuinely the right choice. */
  useWhen: string;
}

/**
 * Ranked, because "it depends" is not an answer to "how do you choose a locator".
 * Rank 1 is the default and you should have a reason for anything further down.
 */
export const LOCATORS: LocatorStrategy[] = [
  {
    id: 'role',
    name: 'Role and accessible name',
    rank: 1,
    playwright: "page.getByRole('button', { name: 'Sign in' })",
    selenium: 'By.cssSelector("button[aria-label=\'Sign in\']")  // or an a11y-aware helper',
    resilience:
      'Survives restyling, re-nesting and class renames, because it targets what the element IS rather than where it sits. It breaks when the visible label changes, which is a change you want a test to notice.',
    useWhen:
      'By default. It is the only strategy that also asserts the element is reachable by assistive technology — a failing locator is then a real accessibility bug rather than test maintenance.',
  },
  {
    id: 'label',
    name: 'Label, placeholder or title',
    rank: 2,
    playwright: "page.getByLabel('Email address')",
    selenium: 'By.xpath("//label[text()=\'Email address\']/following::input[1]")',
    resilience:
      'As stable as the copy. Breaks on wording changes and on translation, which is the argument for pinning a test locale rather than for abandoning it.',
    useWhen:
      'Form fields, where the label is the thing a user actually looks for and a missing label is itself a defect.',
  },
  {
    id: 'text',
    name: 'Visible text',
    rank: 3,
    playwright: "page.getByText('Order confirmed')",
    selenium: 'By.xpath("//*[text()=\'Order confirmed\']")',
    resilience:
      'Breaks on copy changes, on translation, and on whitespace you cannot see. Substring matching then produces the worse failure: it matches something you did not mean.',
    useWhen:
      'Asserting on content, which is what it is for. As a locator for interaction it is a third choice.',
  },
  {
    id: 'testid',
    name: 'Test id',
    rank: 4,
    playwright: "page.getByTestId('checkout-total')",
    selenium: 'By.cssSelector("[data-testid=\'checkout-total\']")',
    resilience:
      'The most stable option, because it exists only for you and nothing else has a reason to change it. That is also its weakness: it survives the element becoming invisible, unlabelled or unreachable by keyboard, so the test keeps passing while the feature is broken for real users.',
    useWhen:
      'When there is no accessible name to target and adding one is not appropriate — a chart region, a container, a purely visual element. Not as the house style, or you have opted out of noticing accessibility regressions.',
  },
  {
    id: 'css',
    name: 'CSS selector',
    rank: 5,
    playwright: "page.locator('.cart__total > span')",
    selenium: 'By.cssSelector(".cart__total > span")',
    resilience:
      'Tied to structure and styling, both of which change for reasons unrelated to behaviour. A framework that generates class names breaks it on every build.',
    useWhen:
      'Scoping to a container before a better locator inside it, which is a legitimate and common use. As the final selector, it is a smell.',
  },
  {
    id: 'xpath',
    name: 'XPath',
    rank: 6,
    playwright: "page.locator('xpath=//div[3]/span[2]')",
    selenium: 'By.xpath("//div[3]/span[2]")',
    resilience:
      'An absolute path is the most brittle locator there is — it encodes the whole document shape, so any insertion anywhere above breaks it.',
    useWhen:
      'Relationships the other strategies cannot express, which in Selenium mostly means "the row containing this text, then the button inside it". Playwright expresses that with filter and chaining, so it needs XPath far less often.',
  },
];

export interface PomCard {
  id: string;
  title: string;
  /** What goes wrong, concretely. */
  problem: string;
  /** What to do instead. */
  fix: string;
}

export const POM_PRINCIPLE = {
  worth:
    'The real benefit is one: when the UI changes, one file changes instead of forty tests. Everything else claimed for page objects is a consequence of that, and any structure delivering it is doing the job.',
  cost:
    'The cost is indirection. A test that reads "loginPage.loginAs(user)" hides whether that is one click or six, so a failure inside it tells you less than a failing line would. Worth paying when the flow really is repeated everywhere; not worth it for a page used by two tests.',
  modern:
    'With Playwright, lazy locators and fixtures already give you the reuse, so a full page-object layer often adds indirection for very little. With Selenium, where a found element goes stale and locating is eager, page objects earn their place more clearly. Saying which framework you are talking about is part of a good answer.',
};

export const POM_MISTAKES: PomCard[] = [
  {
    id: 'god',
    title: 'The god object',
    problem:
      'One class per page means a class per URL, and a modern page is not one thing — so the checkout page object grows to eighty methods covering the cart, the address form, the payment panel and the summary, and every one of those areas has a different owner.',
    fix:
      'Model components, not URLs. A CartPanel and an AddressForm are reusable across the pages that embed them, and each stays small enough to read.',
  },
  {
    id: 'assertions',
    title: 'Assertions inside the page object',
    problem:
      'A method like assertOrderPlaced() moves the meaning of the test into the object, so two tests needing slightly different checks either share a wrong assertion or add a near-duplicate method. Read the test file afterwards and you cannot tell what it verifies.',
    fix:
      'Page objects expose state; tests assert on it. The exception people argue for is a shared "page loaded" check, and even that reads better as a fixture.',
  },
  {
    id: 'returning',
    title: 'Returning the next page from every method',
    problem:
      'A chain like login().goToCart().checkout() encodes navigation into the type system, which is elegant until the flow branches — a login that sometimes lands on a 2FA prompt cannot return one type honestly, and then the object lies.',
    fix:
      'Return nothing, and let the test say where it expects to be. The navigation graph belongs in the test, which is the thing describing the journey.',
  },
  {
    id: 'leaking',
    title: 'Exposing raw elements',
    problem:
      'A getter returning a WebElement puts driver mechanics back in the test, so every caller repeats the wait-and-click dance and the abstraction has bought nothing.',
    fix:
      'Expose intent — signIn(user), totalText() — and keep the driver behind the boundary. If a test needs a raw element, that is a missing method, not a reason to leak.',
  },
  {
    id: 'setup',
    title: 'Driving the UI to reach the state under test',
    problem:
      'Twelve tests that each sign up, verify an email, add an address and add three items before testing anything spend most of their runtime re-testing signup, and every one of them fails when signup breaks.',
    fix:
      'Set state through the API or the database and enter the UI at the point you care about. It is faster, it fails for the right reason, and it makes the signup test the only one that tests signup.',
  },
];

export interface CiCard {
  id: string;
  title: string;
  body: string;
  /** The number or rule that makes it concrete. */
  rule: string;
}

export const CI_CARDS: CiCard[] = [
  {
    id: 'gates',
    title: 'What runs on a pull request',
    body:
      'The pull-request pipeline exists to answer one question quickly: is this change safe to merge? That is unit, service and contract tests, plus a small set of end-to-end smoke journeys. The full cross-browser suite belongs on a schedule, because adding twenty minutes to every pull request costs more engineering time than the bugs it catches at that stage.',
    rule: 'Target ten minutes on a pull request. Past fifteen, people stop waiting and start context-switching, and the feedback loop is gone whatever the coverage.',
  },
  {
    id: 'shard',
    title: 'Sharding and parallelism',
    body:
      'Split by measured duration rather than by file count, or one shard finishes in two minutes and another runs for twelve. Every shard needs its own data: the moment two workers share a seeded user, you have built a flake generator that only fires under load, which is exactly when you least want to debug it.',
    rule: 'Shard on recorded timings, and prove isolation by running the suite at double the concurrency you actually use.',
  },
  {
    id: 'artifacts',
    title: 'Artifacts on failure',
    body:
      'A red build with only a stack trace costs someone a reproduction attempt. A trace file with the DOM at each step, the network log and a screenshot usually costs nothing — the failure is visible in it. Capture on failure only, or the storage bill and the upload time make somebody turn it off.',
    rule: 'Trace, video and screenshot retained on failure and on the first retry. Include the correlation id so the server-side log is one search away.',
  },
  {
    id: 'retries',
    title: 'Retries, honestly',
    body:
      'A retry is a business decision to keep the pipeline moving, not a fix. The danger is that it makes flake invisible: a suite retrying silently looks green while quietly rotting. So retry, but record it — a test that passed on the second attempt has failed, and needs to be counted as a flake and owned.',
    rule: 'One retry, and every retry recorded. If a test flakes twice in a week it goes to quarantine with a name and a date on it.',
  },
  {
    id: 'quarantine',
    title: 'Quarantine with an expiry',
    body:
      'Quarantine keeps a flaky test out of the merge gate while still running it, so the signal survives without blocking anyone. It only works with an owner and a deadline attached — an open-ended quarantine is deleting the test while pretending you did not.',
    rule: 'Two weeks. At the deadline it is fixed or deleted, and deleting is an acceptable outcome as long as somebody decided it out loud.',
  },
  {
    id: 'flakerate',
    title: 'Measure the flake rate',
    body:
      'You cannot argue for time to fix flake without a number, and "it feels flaky" loses that argument every time. Track the proportion of builds that fail without a code cause, and the per-test flake count. Both are cheap to collect once retries are recorded, and they turn a complaint into a trend line.',
    rule: 'Below 1% of builds failing spuriously. Above 5%, people are already ignoring red, and every other quality effort is being wasted.',
  },
];

export interface FrameworkRow {
  id: string;
  name: string;
  waits: string;
  parallel: string;
  reach: string;
  debugging: string;
  /** The honest reason to pick it. */
  pick: string;
  /** The honest reason not to. */
  cost: string;
}

export const FRAMEWORKS: FrameworkRow[] = [
  {
    id: 'selenium',
    name: 'Selenium',
    waits: 'Manual — explicit waits everywhere, and stale elements are yours to handle.',
    parallel: 'Via Grid or a cloud provider; you assemble it.',
    reach: 'Every browser, real devices, and languages beyond JavaScript. The widest reach by far.',
    debugging: 'Screenshots and logs, unless you add tooling yourself.',
    pick:
      'A W3C standard with the longest support horizon, and the only real option when the suite must be in Java or C#, or must run on browsers and devices nothing else reaches. Most large enterprise suites are Selenium and will stay that way.',
    cost:
      'You write the reliability yourself. The wait discipline that Playwright gives you by default is a code review responsibility here, forever.',
  },
  {
    id: 'playwright',
    name: 'Playwright',
    waits: 'Auto-waiting on every action, plus retrying assertions. Stale elements are not a concept.',
    parallel: 'Built in, with worker isolation and sharding out of the box.',
    reach: 'Chromium, Firefox and WebKit. Emulated mobile, but not real devices.',
    debugging: 'Trace viewer with DOM snapshots per step — the strongest debugging story available.',
    pick:
      'The default for a new web suite. The auto-waiting removes the most common source of flake by construction, and the trace viewer turns a CI failure into something you can inspect rather than reproduce.',
    cost:
      'Younger, so a smaller hiring pool and fewer people who have run it at scale. No real-device coverage without a cloud provider on top.',
  },
  {
    id: 'cypress',
    name: 'Cypress',
    waits: 'Automatic retry on queries and assertions, inside its own command queue.',
    parallel: 'Across machines, coordinated by its dashboard service.',
    reach: 'Chromium-family plus Firefox. Runs inside the browser, which is the source of both its strengths and its limits.',
    debugging: 'Excellent interactive runner — time-travel through commands as they ran.',
    pick:
      'Developer experience for front-end teams writing their own tests. The interactive runner is the best thing about it and it is genuinely pleasant to work in.',
    cost:
      'Running inside the browser constrains it: multiple tabs, multiple origins and native events are awkward or unavailable, and its command queue is a second programming model to learn alongside JavaScript.',
  },
];

/** The answer to "which would you choose", which is what the table is actually for. */
export const FRAMEWORK_VERDICT =
  'For a new web suite I would start with Playwright, because auto-waiting removes the largest single source of flake before anyone writes a line, and the trace viewer means a CI failure is inspected rather than reproduced. I would choose Selenium when the language or the device coverage requires it, which is a real constraint at large companies and not a legacy excuse. What I would not do is migrate a working Selenium suite for its own sake — the flake in an old suite is almost never caused by the framework, and a migration relocates it rather than fixing it.';
