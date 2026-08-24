/**
 * The flake lab: races, played out one step at a time.
 *
 * WHY THIS EXISTS. Every source in this app can tell you "the click landed before the handler was
 * bound". Almost nobody can picture it, because the whole difficulty is that two things are
 * happening at once and the failure depends on their order. That is exactly what this app already
 * does well for algorithms — step through it and watch — so the same treatment is applied here.
 *
 * Each scenario runs twice: once as it breaks, once with the fix, on the same clock. Seeing the
 * fixed run wait where the broken run charged ahead is the point; a paragraph saying "use an
 * explicit wait" does not land the same way.
 *
 * The timings are illustrative and are laid out by step rather than to scale — a five-second
 * timeout drawn proportionally would squash everything else into a millimetre.
 */

export interface Lane {
  id: string;
  label: string;
}

export type StepTone = 'normal' | 'risk' | 'fail' | 'win';

export interface TimelineStep {
  /** Milliseconds on the scenario clock. Displayed, not used for layout. */
  at: number;
  /** Which lane this happens in. */
  lane: string;
  /** Short label on the marker. */
  label: string;
  /** What is actually going on, and why it matters. */
  note: string;
  tone: StepTone;
}

export interface FlakeScenario {
  id: string;
  title: string;
  /** How it presents in CI, which is all you get at first. */
  symptom: string;
  /** The mechanism. */
  why: string;
  /** What actually removes it — not "add a wait". */
  fix: string;
  /** Why it is intermittent rather than always failing. */
  intermittent: string;
  lanes: Lane[];
  broken: TimelineStep[];
  fixed: TimelineStep[];
  code: { broken: string; fixed: string };
}

export const FLAKE_SCENARIOS: FlakeScenario[] = [
  {
    id: 'hydration',
    title: 'The click that lands before the handler',
    symptom:
      'Passes locally every time. Fails on CI maybe one run in fifteen, always with a timeout on the assertion after the click — never on the click itself.',
    why:
      'Server-rendered HTML paints the button long before the JavaScript bundle finishes parsing and attaches its listener. For that window the button is present, visible and enabled, so every element-level check passes — and the click is dispatched into a void. Nothing errors. The test then waits for a consequence that was never triggered.',
    fix:
      'Wait for evidence the component is interactive, not for the element to exist. That means an application-level signal — the button being genuinely enabled once hydrated, or a state attribute the app sets — and then asserting on the effect of the click rather than assuming it landed.',
    intermittent:
      'It is a race with the bundle. A warm cache locally makes hydration almost instant; a cold, loaded CI runner stretches it to hundreds of milliseconds, and only then is the window wide enough for the test to get in first.',
    lanes: [
      { id: 'test', label: 'Test' },
      { id: 'page', label: 'Browser' },
    ],
    broken: [
      { at: 0, lane: 'page', label: 'HTML painted', note: 'The server-rendered markup is on screen. The button is in the DOM, visible and not disabled.', tone: 'normal' },
      { at: 40, lane: 'test', label: 'Locator resolves', note: 'The test finds the button. Every actionability check passes — attached, visible, stable, enabled. All of them are true and none of them are the question.', tone: 'risk' },
      { at: 60, lane: 'test', label: 'click()', note: 'The click is dispatched. No listener is attached yet, so the event travels up the DOM and nothing happens. No error, no warning.', tone: 'risk' },
      { at: 380, lane: 'page', label: 'Bundle parsed', note: 'JavaScript finishes hydrating and the click handler is finally bound — 320 ms too late to have heard anything.', tone: 'normal' },
      { at: 5060, lane: 'test', label: 'Assertion times out', note: 'The test has been waiting five seconds for a confirmation that was never going to come. The failure names the assertion, which is the one line that was not wrong.', tone: 'fail' },
    ],
    fixed: [
      { at: 0, lane: 'page', label: 'HTML painted', note: 'Identical start. The markup is on screen, the button looks ready, and hydration has not happened yet.', tone: 'normal' },
      { at: 40, lane: 'test', label: 'Waits for interactive', note: 'The test waits on a signal that means hydrated — the button becoming genuinely enabled, or a data attribute the app sets when the handler is bound.', tone: 'normal' },
      { at: 380, lane: 'page', label: 'Handler bound', note: 'Hydration completes and the app flips the signal the test is watching.', tone: 'normal' },
      { at: 400, lane: 'test', label: 'click()', note: 'The click lands on a live listener. The 340 ms of waiting cost nothing on a fast machine, because the wait ends when the condition holds.', tone: 'win' },
      { at: 450, lane: 'page', label: 'Request sent', note: 'The consequence the test is really asserting on actually happens.', tone: 'win' },
    ],
    code: {
      broken: "await page.getByRole('button', { name: 'Pay' }).click();\nawait expect(page.getByText('Payment taken')).toBeVisible();",
      fixed:
        "// The app marks itself interactive; the test waits for that, not for the element.\nawait expect(page.getByTestId('checkout')).toHaveAttribute('data-hydrated', 'true');\nawait page.getByRole('button', { name: 'Pay' }).click();\nawait expect(page.getByText('Payment taken')).toBeVisible();",
    },
  },

  {
    id: 'stale',
    title: 'The element that was replaced underneath you',
    symptom:
      'StaleElementReferenceException on a line that has worked for months, usually on the second or third item in a list, and never when you step through it in a debugger.',
    why:
      'findElement returns a handle to a specific node in the DOM. When the framework re-renders that list — after a fetch resolves, or a sibling updates — it discards those nodes and builds new ones. The handle now points at something that has been removed from the document, and any use of it throws.',
    fix:
      'Do not hold a reference across time. Resolve the element at the moment you act on it: in Playwright a locator is lazy and re-resolves on every action, which is why the exception does not exist there; in Selenium, keep the find inside the wait so a re-render simply causes another attempt.',
    intermittent:
      'It needs a re-render to fall between the find and the use. Locally the data is cached and the render happens before the test looks; on CI the fetch lands a few milliseconds later and slips into the gap.',
    lanes: [
      { id: 'test', label: 'Test' },
      { id: 'page', label: 'Browser' },
    ],
    broken: [
      { at: 0, lane: 'test', label: 'findElement', note: 'The delete button in row 3 is located and a handle to that specific DOM node is stored.', tone: 'risk' },
      { at: 60, lane: 'page', label: 'Fetch resolves', note: 'A background request for updated stock comes back.', tone: 'normal' },
      { at: 120, lane: 'page', label: 'List re-renders', note: 'The framework rebuilds the rows. Visually nothing moved — but every node is new, and the old ones are detached.', tone: 'risk' },
      { at: 130, lane: 'test', label: 'click()', note: 'The stored handle points at a node that is no longer in the document. StaleElementReferenceException, on a line that is not the problem.', tone: 'fail' },
    ],
    fixed: [
      { at: 0, lane: 'test', label: 'Locator defined', note: 'A description of how to find the button is stored — not the button itself. Nothing has been resolved yet.', tone: 'normal' },
      { at: 60, lane: 'page', label: 'Fetch resolves', note: 'Same background request at the same moment — but the test is holding a description rather than a node, so it has nothing that can go stale.', tone: 'normal' },
      { at: 120, lane: 'page', label: 'List re-renders', note: 'The rows are rebuilt exactly as before, and every old node is detached — it simply does not matter to a test holding no reference.', tone: 'normal' },
      { at: 130, lane: 'test', label: 'Resolve, then click', note: 'The locator resolves against the current DOM at the instant of the action, finds the new node, and clicks it.', tone: 'win' },
    ],
    code: {
      broken:
        'WebElement del = driver.findElement(By.cssSelector("#row-3 .delete"));\n// ... anything at all can happen here ...\ndel.click();  // StaleElementReferenceException',
      fixed:
        '// Selenium: keep the find inside the wait, so a re-render just retries.\nnew WebDriverWait(driver, Duration.ofSeconds(10))\n    .until(ExpectedConditions.elementToBeClickable(\n        By.cssSelector("#row-3 .delete")))\n    .click();\n\n// Playwright: locators are lazy, so this is simply the default.\nawait page.locator(\'#row-3 .delete\').click();',
    },
  },

  {
    id: 'overlay',
    title: 'The overlay that ate the click',
    symptom:
      '"Element click intercepted" or a click that reports success and changes nothing, right after closing a dialog or dismissing a toast.',
    why:
      'The dialog is closed as far as the application is concerned, but its backdrop is running a 300 ms fade-out and is still in the document at full size. The button underneath is visible and enabled — the overlay is simply on top of it, so the click hits the overlay instead.',
    fix:
      'Wait for the overlay to be gone rather than for the button to look ready. Playwright’s actionability includes a stability check and a receives-events check, which covers this by default; in Selenium it is an explicit wait for invisibility of the backdrop, and pointer-events: none during the animation removes the whole class of problem at the source.',
    intermittent:
      'The animation is a fixed duration but the test’s arrival is not. A fast machine gets there inside the fade; a slower one arrives after it has finished and passes, which is why this one is often reported as "fails on the fast machines".',
    lanes: [
      { id: 'test', label: 'Test' },
      { id: 'page', label: 'Browser' },
    ],
    broken: [
      { at: 0, lane: 'test', label: 'Close dialog', note: 'The test dismisses the confirmation dialog and moves straight on.', tone: 'normal' },
      { at: 10, lane: 'page', label: 'Fade begins', note: 'The dialog is logically closed. Its backdrop starts a 300 ms opacity transition and stays in the DOM, full size, for the duration.', tone: 'risk' },
      { at: 30, lane: 'test', label: 'Button is visible', note: 'The test checks the button underneath: attached, visible, enabled. True — and irrelevant, because visibility says nothing about what is on top.', tone: 'risk' },
      { at: 40, lane: 'test', label: 'click()', note: 'The click is dispatched at the button’s coordinates and lands on the backdrop instead.', tone: 'fail' },
      { at: 50, lane: 'page', label: 'Overlay swallows it', note: 'Selenium raises ElementClickInterceptedException. A raw JavaScript click would have "succeeded" and done nothing, which is worse.', tone: 'fail' },
    ],
    fixed: [
      { at: 0, lane: 'test', label: 'Close dialog', note: 'Same action, same moment — the fix changes nothing about how the dialog is dismissed.', tone: 'normal' },
      { at: 10, lane: 'page', label: 'Fade begins', note: 'The backdrop starts the same 300 ms transition and is still covering the button underneath.', tone: 'normal' },
      { at: 30, lane: 'test', label: 'Actionability check', note: 'The test requires the target to actually receive the event, and to be stable. Something is covering it, so it waits and re-checks.', tone: 'normal' },
      { at: 320, lane: 'page', label: 'Overlay detached', note: 'The transition ends and the backdrop is removed from the document.', tone: 'normal' },
      { at: 330, lane: 'test', label: 'click() lands', note: 'The next check passes and the click reaches the button. It cost 300 ms — and only on the runs where it was actually needed.', tone: 'win' },
    ],
    code: {
      broken: "await page.getByRole('button', { name: 'Close' }).click();\nawait page.getByRole('button', { name: 'Delete' }).click();  // intercepted",
      fixed:
        "await page.getByRole('button', { name: 'Close' }).click();\n// Wait for the thing that is in the way, not for the thing underneath.\nawait expect(page.locator('.modal-backdrop')).toHaveCount(0);\nawait page.getByRole('button', { name: 'Delete' }).click();",
    },
  },

  {
    id: 'sleep',
    title: 'The sleep that is both too long and too short',
    symptom:
      'A suite that takes forty minutes and still fails a couple of times a week, always on assertions that come after a fixed wait.',
    why:
      'A sleep encodes a guess about how long something takes on a machine you are not using. The guess is far too long for the ninety-nine runs where the response takes 200 ms, and too short for the one where a loaded runner takes 2.3 seconds. It is simultaneously the slowest option available and an unreliable one.',
    fix:
      'Make the assertion the wait. A retrying assertion polls until the condition holds or the timeout expires, so it returns in 200 ms locally and still passes at 2.3 seconds on CI — faster in the common case and correct in the rare one, which a fixed number can never be.',
    intermittent:
      'It fails exactly as often as the response exceeds the guess, so it tracks CI load. That is why it gets worse as the team grows and nobody can point to a change that caused it.',
    lanes: [
      { id: 'test', label: 'Test' },
      { id: 'server', label: 'Server' },
    ],
    broken: [
      { at: 0, lane: 'test', label: 'Click Save', note: 'The test saves the form and the request goes out.', tone: 'normal' },
      { at: 10, lane: 'test', label: 'sleep(2000)', note: 'The test stops dead for two seconds. On a normal run the response arrives at 200 ms and 1.8 seconds are burned doing nothing — every single time.', tone: 'risk' },
      { at: 2010, lane: 'test', label: 'Assert total', note: 'The sleep is over and the assertion runs once. This is a loaded CI runner, and the response has not come back yet.', tone: 'risk' },
      { at: 2015, lane: 'test', label: 'Reads stale value', note: 'The old total is still on screen. The assertion fails on its single attempt.', tone: 'fail' },
      { at: 2300, lane: 'server', label: 'Response arrives', note: 'The correct value renders 285 ms after the test gave up on it.', tone: 'fail' },
    ],
    fixed: [
      { at: 0, lane: 'test', label: 'Click Save', note: 'Identical action on an identically loaded runner — the only thing that changes is how the test waits.', tone: 'normal' },
      { at: 10, lane: 'test', label: 'Assertion starts polling', note: 'The assertion begins re-checking the total against the expected value, with its own timeout.', tone: 'normal' },
      { at: 500, lane: 'test', label: 'Still stale — retries', note: 'Not there yet, so it checks again. No wall-clock is wasted, because it stops the moment it succeeds.', tone: 'normal' },
      { at: 2300, lane: 'server', label: 'Response arrives', note: 'The value updates on screen at exactly the same time as in the broken run.', tone: 'normal' },
      { at: 2350, lane: 'test', label: 'Assertion passes', note: 'The next poll sees the new total and the test moves on. The same statement returns in 250 ms on a fast machine.', tone: 'win' },
    ],
    code: {
      broken: "await page.getByRole('button', { name: 'Save' }).click();\nawait page.waitForTimeout(2000);\nexpect(await page.getByTestId('total').textContent()).toBe('£42.00');",
      fixed: "await page.getByRole('button', { name: 'Save' }).click();\n// Polls until it matches or times out — fast when fast, patient when slow.\nawait expect(page.getByTestId('total')).toHaveText('£42.00');",
    },
  },

  {
    id: 'shareddata',
    title: 'The fixture two workers were both using',
    symptom:
      'Green when run alone, red roughly one time in four in CI, and the failing test is never the same one twice.',
    why:
      'Both tests sign in as the same seeded account. One of them deletes the saved address as part of its own flow — or in its cleanup — while the other is midway through asserting that the address is there. Neither test is wrong on its own; they are wrong together, and parallelism is what puts them together.',
    fix:
      'Isolation by data, not by scheduling. Each test creates the account and the records it needs under a unique key and removes exactly those. Reducing concurrency hides this and costs you the parallelism; deleting the shared fixture fixes it.',
    intermittent:
      'It depends entirely on the interleaving, which depends on how the shards were split and how loaded each runner is. That is why it moves between tests and why re-running "fixes" it.',
    lanes: [
      { id: 'a', label: 'Worker A' },
      { id: 'b', label: 'Worker B' },
      { id: 'db', label: 'Database' },
    ],
    broken: [
      { at: 0, lane: 'a', label: 'Sign in as qa_user', note: 'Worker A starts the address test using the shared seeded account.', tone: 'risk' },
      { at: 5, lane: 'b', label: 'Sign in as qa_user', note: 'Worker B starts a different test — and uses the same account, because that is the fixture everybody uses.', tone: 'risk' },
      { at: 180, lane: 'b', label: 'Cleanup: delete addresses', note: 'Worker B tidies up after itself. It has no idea anyone else is using this account, and nothing in the code says so.', tone: 'risk' },
      { at: 185, lane: 'db', label: 'Row removed', note: 'The address row is gone. Both workers are still running.', tone: 'fail' },
      { at: 260, lane: 'a', label: 'Assert address shown', note: 'Worker A fails. Its own code is correct, its own setup was correct, and nothing in its failure points at Worker B.', tone: 'fail' },
    ],
    fixed: [
      { at: 0, lane: 'a', label: 'Create qa_a41f', note: 'Worker A creates its own account with a unique key, via the API rather than the UI.', tone: 'normal' },
      { at: 5, lane: 'b', label: 'Create qa_c93d', note: 'Worker B creates a different account. The two tests can no longer see each other.', tone: 'normal' },
      { at: 180, lane: 'b', label: 'Cleanup: own key only', note: 'Worker B deletes the data it created, scoped to its own key rather than to the table.', tone: 'normal' },
      { at: 185, lane: 'db', label: 'Only B’s rows removed', note: 'Worker A’s address is untouched, because it was never shared.', tone: 'normal' },
      { at: 260, lane: 'a', label: 'Assertion passes', note: 'And the suite can now run at any concurrency, which is the actual prize — this is what makes sharding safe.', tone: 'win' },
    ],
    code: {
      broken: '// fixtures.ts — one account, every test\nexport const TEST_USER = { email: \'qa_user@example.com\' };\n\ntest.afterEach(async () => {\n  await api.deleteAllAddresses(TEST_USER);  // for everybody, as it turns out\n});',
      fixed:
        "// Each test owns its data, keyed uniquely, created through the API.\nconst user = await api.createUser({ tag: testInfo.testId });\n\ntest.afterEach(async () => {\n  await api.deleteUser(user.id);  // exactly what this test made\n});",
    },
  },
];
