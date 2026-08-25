/**
 * Selenium and Playwright, as they are actually asked.
 *
 * WHY THIS EXISTS. The Craft section already ranks waits and locators and argues about frameworks,
 * which is the judgement half. It is not what an automation round opens with. That round opens
 * with "what is a StaleElementReferenceException", "how do you handle an iframe", "implicit or
 * explicit wait", and it goes badly for people who have opinions about test design but have never
 * been asked to name the exception. Both halves are needed and they are different material.
 *
 * ON THE PAIRING. Almost every question here is answered for both tools, because the interesting
 * content is usually the contrast: Selenium hands you a WebElement and it can go stale, Playwright
 * hands you a Locator and it cannot, and understanding why is worth more than either fact. Where a
 * question only makes sense for one tool it is marked as such rather than padded.
 *
 * ON THE CODE. Every snippet has been syntax-checked — the Java through javac's parser, the
 * TypeScript through the TypeScript compiler's. That catches malformed code, which is the failure
 * that would embarrass you if you copied it into an interview. It does not prove the API calls are
 * real, because neither Selenium nor Playwright is a dependency of this project; those were
 * written from the documented APIs and should be read as answers, not as a test suite.
 */

export type Tool = 'selenium' | 'playwright' | 'both';

export type QuestionGroup =
  | 'architecture'
  | 'locating'
  | 'waiting'
  | 'interactions'
  | 'structure'
  | 'network'
  | 'debugging'
  | 'scale';

export interface QuestionGroupMeta {
  id: QuestionGroup;
  label: string;
  blurb: string;
}

export const QUESTION_GROUPS: QuestionGroupMeta[] = [
  {
    id: 'architecture',
    label: 'How it works',
    blurb:
      'The opener in a lot of loops, and the one people skip because it feels academic. It is not: nearly every flake question later resolves to how the tool talks to the browser.',
  },
  {
    id: 'locating',
    label: 'Finding elements',
    blurb:
      'Where the single most-asked exception lives. The contrast that matters: Selenium hands you a reference to an element, Playwright hands you a description of how to find one, and almost everything else follows from that.',
  },
  {
    id: 'waiting',
    label: 'Waiting',
    blurb:
      'The highest-signal topic in the whole screen, because the wrong answer is short and confident. If you only prepare one section, prepare this one.',
  },
  {
    id: 'interactions',
    label: 'Awkward interactions',
    blurb:
      'Dropdowns, alerts, frames, tabs, uploads. Individually trivia; collectively the fastest way for an interviewer to find out whether you have actually automated a real application.',
  },
  {
    id: 'structure',
    label: 'Structuring a suite',
    blurb:
      'Fixtures, setup, and keeping tests independent. The question under all of them is whether your suite can run in a random order on ten machines.',
  },
  {
    id: 'network',
    label: 'Network and auth',
    blurb:
      'Logging in once instead of a thousand times, and controlling what the backend says. This is where an hour comes off the suite runtime, so it is worth having a specific answer.',
  },
  {
    id: 'debugging',
    label: 'Debugging a failure',
    blurb:
      '"It only fails in CI" is the most common real-world question there is, and the answer is about evidence you collected before the failure rather than cleverness after it.',
  },
  {
    id: 'scale',
    label: 'Running it at scale',
    blurb:
      'Grid, parallelism, cross-browser and headless. Mostly about knowing what actually differs, so you can say which of these is worth paying for.',
  },
];

export interface ToolQuestion {
  id: string;
  group: QuestionGroup;
  /** Which tool the question is about. 'both' means the answer contrasts them. */
  tool: Tool;
  question: string;
  /** The answer as you would say it out loud. */
  answer: string;
  /** Shown side by side when both are present. */
  code?: { selenium?: string; playwright?: string };
  /** The answer that loses the room. Omitted where there isn't a common bad one. */
  wrong?: string;
  /** Where the interviewer takes it once you have answered. */
  followUp: string;
}

export const TOOL_QUESTIONS: ToolQuestion[] = [
  /* ---------------------------------- architecture ---------------------------------- */
  {
    id: 'how-selenium-drives',
    group: 'architecture',
    tool: 'both',
    question: 'How does Selenium actually drive the browser, and how does Playwright differ?',
    answer:
      'Selenium speaks the W3C WebDriver protocol: your code sends JSON over HTTP to a driver process — chromedriver, geckodriver — and that driver uses the browser’s own automation interface to act. Every command is a separate round trip, which is why a script that finds fifty elements one at a time is slow, and why the driver binary version has to match the browser. Playwright keeps one persistent WebSocket to a browser it launched itself and speaks that browser’s debugging protocol, so it can do things a request/response protocol cannot: wait for an element to become actionable inside the browser, intercept network, and know when the page is busy. That single connection is the reason auto-waiting exists in one and not the other.',
    wrong:
      '"Selenium uses JavaScript to control the browser." It does not — that is the mechanism Cypress uses, and confusing the two suggests you have read about all three and used none.',
    followUp:
      'So why does Selenium need a matching driver binary and Playwright does not? — because Playwright ships and manages its own browser builds, which is also why its install is large and its runs are reproducible.',
  },
  {
    id: 'close-vs-quit',
    group: 'architecture',
    tool: 'selenium',
    question: 'What is the difference between driver.close() and driver.quit()?',
    answer:
      'close() shuts the current window and leaves the session alive; quit() ends the session and kills the driver process. The practical consequence is that a suite calling close() in teardown leaks a driver process per test, and after a few hundred tests the CI machine runs out of memory — which presents as unrelated tests failing near the end of a run, not as an obvious leak.',
    followUp:
      'If close() is called on the last remaining window, is the session gone? — the browser exits, but the session and driver process are not reliably cleaned up, which is exactly the leak. Always quit() in teardown.',
  },
  {
    id: 'browser-context-page',
    group: 'architecture',
    tool: 'playwright',
    question: 'Explain browser, context and page in Playwright. Which one is the isolation unit?',
    answer:
      'The browser is the process, a context is an isolated profile inside it — its own cookies, storage and cache — and a page is a tab in that context. The context is the isolation unit, and it is cheap: creating one costs milliseconds where launching a browser costs seconds. That is the whole trick behind Playwright’s parallelism. Every test gets a fresh context rather than a fresh browser, so tests are as isolated as if they had their own browser, at a fraction of the cost.',
    code: {
      playwright: `const browser = await chromium.launch();
// One profile per test — cookies and storage cannot leak between them.
const context = await browser.newContext();
const page = await context.newPage();`,
    },
    followUp:
      'How would you test two users interacting — a chat, a shared document? — two contexts in one browser, one page each. Two pages in one context would share a login.',
  },

  /* ------------------------------------ locating ------------------------------------ */
  {
    id: 'stale-element',
    group: 'locating',
    tool: 'selenium',
    question: 'What is a StaleElementReferenceException and how do you fix it?',
    answer:
      'findElement gives you a reference to a specific element in the DOM at that instant. If the page re-renders — a React re-render, a table refresh, an AJAX update — the old node is discarded and your reference points at something no longer attached to the document. The next use of it throws. The fix is not a retry loop and not a sleep: it is to stop holding element references across anything that can re-render. Find it again immediately before using it, and where the framework redraws aggressively, use a wait that returns the element rather than caching one from earlier in the test.',
    code: {
      selenium: `// Stale: the reference is captured before the update that replaces the row.
WebElement row = driver.findElement(By.cssSelector("#cart tr"));
refreshCart();
row.click(); // StaleElementReferenceException

// Re-find after the state change, and let the wait hand you a fresh element.
refreshCart();
WebElement fresh = new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.elementToBeClickable(By.cssSelector("#cart tr")));
fresh.click();`,
      playwright: `// A Locator is a description, not a reference — it is resolved at the
// moment of the click, so there is no stale window to fall into.
const row = page.locator('#cart tr');
await refreshCart();
await row.click();`,
    },
    followUp:
      'Why can Playwright not throw this? — because a Locator is re-resolved on every action, so there is no cached node to go stale. That contrast is the answer they are usually fishing for.',
  },
  {
    id: 'findelement-vs-findelements',
    group: 'locating',
    tool: 'selenium',
    question: 'findElement versus findElements — what is the difference?',
    answer:
      'findElement returns the first match and throws NoSuchElementException if there is none. findElements returns a list and returns an empty list if there is none — it never throws for absence. That makes findElements the right call for asserting something is gone, and it is also the trap: a test that checks `findElements(...).size() == 0` passes instantly on a page that has not finished rendering, because nothing has appeared yet. Absence needs a wait just as much as presence does.',
    code: {
      selenium: `// Throws if missing.
WebElement banner = driver.findElement(By.id("promo"));

// Empty list if missing — no exception, so this is how you check for absence.
boolean gone = driver.findElements(By.id("promo")).isEmpty();

// But absence needs waiting for, or it passes before the element ever renders.
new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.invisibilityOfElementLocated(By.id("promo")));`,
    },
    followUp:
      'How would you assert an element never appears? — you cannot prove a negative by waiting; you wait for a positive signal that the page has settled, then assert absence.',
  },
  {
    id: 'locator-vs-handle',
    group: 'locating',
    tool: 'playwright',
    question: 'What is the difference between a Locator and an ElementHandle?',
    answer:
      'An ElementHandle points at a specific DOM node, exactly like a Selenium WebElement, and it can go stale for exactly the same reason. A Locator is lazy: it stores how to find the element and re-runs that search on every action. That is why Locators do not go stale, why they can auto-wait, and why the documentation says to use them for everything. ElementHandle is effectively legacy — the only time you need one is when you are passing a live node into evaluated page JavaScript.',
    followUp:
      'When would you still reach for an ElementHandle? — passing a real node into page.evaluate. Otherwise never, and reaching for one is usually a sign of a habit carried over from Selenium.',
  },
  {
    id: 'strict-mode',
    group: 'locating',
    tool: 'playwright',
    question: 'What is strict mode, and why would a locator that used to work start failing?',
    answer:
      'A Locator that resolves to more than one element throws instead of silently acting on the first. It fails when a second matching element appears — a duplicated button in a modal, a second row with the same text — and that is the point: with Selenium the same change would silently click the wrong element and the test would pass, or fail somewhere unrelated later. Strict mode converts an ambiguity into an immediate, named error. The fix is to narrow the locator, not to bolt .first() onto it, because .first() reintroduces exactly the silent-wrong-element behaviour you were protected from.',
    code: {
      playwright: `// Throws if two "Delete" buttons exist — which is what you want to know.
await page.getByRole('button', { name: 'Delete' }).click();

// Narrow by the region that makes it unambiguous.
await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();`,
    },
    followUp:
      'So .first() is always wrong? — not always: it is right when the collection is genuinely ordered and you mean "the first one". It is wrong when it is used to silence an error you have not understood.',
  },
  {
    id: 'xpath-vs-css',
    group: 'locating',
    tool: 'both',
    question: 'CSS or XPath?',
    answer:
      'CSS by default: shorter, faster in Selenium, and far more people can read it. XPath earns its place for the two things CSS genuinely cannot do — walking up the tree to an ancestor, and matching on text content. If I am reaching for either of them, though, it is usually because the element has no role, no accessible name and no test id, and that is worth raising as a testability point rather than solving quietly with a clever selector.',
    code: {
      selenium: `// The two things only XPath can do: text, and walking upwards.
driver.findElement(By.xpath("//button[normalize-space()='Save']"));
driver.findElement(By.xpath("//td[text()='ORD-1']/ancestor::tr"));`,
      playwright: `// Both have first-class support that reads better than either selector.
await page.getByRole('button', { name: 'Save' }).click();
await page.getByRole('row', { name: 'ORD-1' }).getByRole('button').click();`,
    },
    followUp:
      'Why is XPath slower in Selenium? — some browsers have no native XPath engine for the driver to use, so it is evaluated by injected JavaScript. On a large DOM in a loop it is measurable; on one lookup it is not, so do not over-claim this.',
  },

  /* ------------------------------------- waiting ------------------------------------ */
  {
    id: 'implicit-vs-explicit',
    group: 'waiting',
    tool: 'selenium',
    question: 'Implicit or explicit wait — and can you use both?',
    answer:
      'An implicit wait is a global setting that makes every findElement poll for up to N seconds before throwing. An explicit wait waits for a named condition on a specific element. Explicit wins, because implicit only ever waits for presence in the DOM — not visible, not enabled, not settled — so an element that exists but is covered by a spinner passes an implicit wait and fails the click. And you should not mix them: the documented behaviour of combining them is unpredictable, and in practice the waits compound, so a ten-second explicit wait on a page with a ten-second implicit wait can take far longer than either. Set the implicit wait to zero and use explicit waits everywhere.',
    code: {
      selenium: `// Set once, applies to everything, and only ever waits for presence.
driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));

// Explicit: a named condition on one element, ends the moment it is true.
new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.elementToBeClickable(By.id("checkout")));`,
    },
    wrong:
      '"I set an implicit wait of thirty seconds so I do not have to think about waiting." It is the answer that ends the topic, because it says the suite is slow, the failures are unexplained, and nobody has looked at why.',
    followUp:
      'What does elementToBeClickable actually check? — displayed and enabled. Notably not "unobscured", which is why an overlay still eats the click and why this is not the same guarantee Playwright gives.',
  },
  {
    id: 'auto-waiting',
    group: 'waiting',
    tool: 'playwright',
    question: 'What does Playwright’s auto-waiting actually check before a click?',
    answer:
      'Before acting it runs actionability checks and retries them until they all pass or the timeout expires: the element is attached to the DOM, visible, stable — meaning it has stopped animating between two consecutive frames — it receives pointer events, and it is enabled. The one people forget is the hit-target check, and it is the valuable one: it is what catches the invisible overlay or the sticky header sitting on top of your button, which is the single most common cause of a click that reports success and changes nothing.',
    followUp:
      'So do you ever need an explicit wait in Playwright? — yes, for things that are not element state: a network response, a URL change, or a condition inside the page. Never for "the element should exist by now".',
  },
  {
    id: 'web-first-assertions',
    group: 'waiting',
    tool: 'playwright',
    question: 'Why use expect(locator) instead of reading the text and asserting on it?',
    answer:
      'expect(locator).toHaveText(...) retries until it passes or times out; reading textContent into a variable and asserting on it samples once, at whatever instant your code got there. The second form is the single most common source of flake in a Playwright suite written by someone coming from Selenium, because it looks identical and behaves completely differently under a re-render or an in-flight request.',
    code: {
      playwright: `// Samples once — flaky the moment the value arrives a frame later.
const text = await page.locator('#total').textContent();
expect(text).toBe('£42.00');

// Retries until it matches or the timeout expires.
await expect(page.locator('#total')).toHaveText('£42.00');`,
    },
    followUp:
      'What if the value legitimately settles through several states? — the retrying assertion handles that for free; the sampled one has to be wrapped in a poll, which is you reimplementing what the framework already does.',
  },
  {
    id: 'wait-for-network',
    group: 'waiting',
    tool: 'both',
    question: 'How do you wait for an API call to finish rather than for an element?',
    answer:
      'In Playwright you wait for the response itself, and you set the wait up before the action that triggers it — otherwise the response can arrive between the click and the wait, and you sit there until timeout. Selenium has no visibility into the network, so you wait for the user-visible consequence instead: the spinner gone, the row count changed, the value updated. Which is usually the better assertion anyway, because it is the thing the user actually experiences.',
    code: {
      playwright: `// Set up the wait first, then act — otherwise you can miss the response.
const responsePromise = page.waitForResponse(
  (r) => r.url().includes('/api/orders') && r.status() === 200
);
await page.getByRole('button', { name: 'Refresh' }).click();
await responsePromise;`,
      selenium: `// No network visibility, so wait for what the response changed on screen.
By spinner = By.cssSelector(".spinner");
new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.invisibilityOfElementLocated(spinner));`,
    },
    followUp:
      'Why not waitForLoadState("networkidle")? — it is discouraged and flaky by design: an app with polling or analytics never goes idle, so it either hangs or resolves at an arbitrary moment.',
  },

  /* ---------------------------------- interactions ---------------------------------- */
  {
    id: 'dropdowns',
    group: 'interactions',
    tool: 'both',
    question: 'How do you handle a dropdown?',
    answer:
      'The first question is whether it is a real select element or a div pretending to be one, and that distinction is most of the answer. A real select has a dedicated API in both tools. A custom dropdown — which is the overwhelming majority in a modern app — is just a button that opens a list, so you click it and click the option, and none of the select helpers apply.',
    code: {
      selenium: `// Real <select> only.
new Select(driver.findElement(By.id("country"))).selectByVisibleText("Germany");

// Custom dropdown: a button and a list, nothing more.
driver.findElement(By.id("country-trigger")).click();
driver.findElement(By.xpath("//li[normalize-space()='Germany']")).click();`,
      playwright: `await page.selectOption('#country', { label: 'Germany' });

await page.getByRole('combobox', { name: 'Country' }).click();
await page.getByRole('option', { name: 'Germany' }).click();`,
    },
    followUp:
      'How do you tell which kind it is? — look at the DOM. And if a custom one has no combobox role and no option roles, that is an accessibility bug as well as a testability one, which is a good thing to say out loud.',
  },
  {
    id: 'alerts',
    group: 'interactions',
    tool: 'both',
    question: 'How do you handle a native alert or confirm dialog?',
    answer:
      'In Selenium you switch to the alert and accept or dismiss it, after waiting for it to be present — it is not part of the page, so no element locator will ever find it. Playwright inverts this: it auto-dismisses dialogs by default, so if your test needs a confirm accepted you register a handler before the action that triggers it. The failure mode people hit is registering the handler after the click, by which point Playwright has already dismissed the dialog.',
    code: {
      selenium: `Alert alert = new WebDriverWait(driver, Duration.ofSeconds(5))
    .until(ExpectedConditions.alertIsPresent());
alert.accept();`,
      playwright: `// Register before the click; Playwright dismisses dialogs unless told otherwise.
page.on('dialog', (dialog) => dialog.accept());
await page.getByRole('button', { name: 'Delete' }).click();`,
    },
    followUp:
      'What about a custom modal that looks like a confirm? — that is ordinary DOM, so none of this applies. Knowing which one you are facing is the actual skill.',
  },
  {
    id: 'iframes',
    group: 'interactions',
    tool: 'both',
    question: 'How do you interact with something inside an iframe?',
    answer:
      'Selenium is modal: you switch the driver into the frame, and every subsequent command is scoped to it until you switch back to the default content. Forgetting to switch back is a classic, and it presents as a NoSuchElementException on an element that is plainly visible on screen. Playwright has no mode — you address the frame as part of the locator chain, so there is no state to restore and nothing to forget.',
    code: {
      selenium: `driver.switchTo().frame("payment-frame");
driver.findElement(By.id("card-number")).sendKeys("4242424242424242");
driver.switchTo().defaultContent(); // forget this and everything after fails`,
      playwright: `await page
  .frameLocator('#payment-frame')
  .getByLabel('Card number')
  .fill('4242424242424242');`,
    },
    followUp:
      'What about a frame inside a frame? — chain another frameLocator in Playwright; in Selenium switch twice, and remember defaultContent goes all the way out, not up one level.',
  },
  {
    id: 'windows-tabs',
    group: 'interactions',
    tool: 'both',
    question: 'A link opens a new tab. How do you work with it?',
    answer:
      'In Selenium you capture the set of window handles, act, find the handle that is new, and switch to it — and switch back afterwards. In Playwright you wait for the page event on the context, and you set that wait up before the click for the same reason as with network responses. Worth adding: for most tests the better move is not to open the tab at all — take the href off the link and assert on it, or navigate directly — because a second tab is slow and rarely what is under test.',
    code: {
      selenium: `String original = driver.getWindowHandle();
driver.findElement(By.linkText("Terms")).click();
for (String handle : driver.getWindowHandles()) {
  if (!handle.equals(original)) {
    driver.switchTo().window(handle);
    break;
  }
}
// ... assert ...
driver.close();
driver.switchTo().window(original);`,
      playwright: `const pagePromise = context.waitForEvent('page');
await page.getByRole('link', { name: 'Terms' }).click();
const newPage = await pagePromise;
await newPage.waitForLoadState();`,
    },
    followUp:
      'Why prefer asserting the href? — it is instant, deterministic, and tests the thing that actually broke. Opening the tab tests the browser.',
  },
  {
    id: 'file-upload-download',
    group: 'interactions',
    tool: 'both',
    question: 'How do you test a file upload, and a download?',
    answer:
      'For upload, never automate the operating system’s file picker — it is not part of the page and it is different on every platform. Send the path straight to the file input instead, which is what both tools do. Download is the harder half: in Playwright you wait for the download event and get the file. In Selenium you have to configure the browser’s download directory at driver creation and then poll the filesystem, which does not work on a remote Grid node at all — the file lands on the node, not on your machine.',
    code: {
      selenium: `driver.findElement(By.id("avatar")).sendKeys("/abs/path/photo.png");`,
      playwright: `await page.getByLabel('Avatar').setInputFiles('/abs/path/photo.png');

const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Export CSV' }).click();
const download = await downloadPromise;
await download.saveAs('/tmp/export.csv');`,
    },
    followUp:
      'How would you verify the downloaded CSV is correct? — parse it and assert on the content. If you only assert the file exists, you have tested that a button downloads something, which is not the requirement.',
  },
  {
    id: 'javascript-executor',
    group: 'interactions',
    tool: 'selenium',
    question: 'When is it acceptable to use JavascriptExecutor to click something?',
    answer:
      'Almost never, and being able to say why is the point of the question. A JavaScript click dispatches an event directly on the node, bypassing every check the browser would have done — so it clicks elements that are covered, invisible, disabled or off-screen. That means it passes in exactly the cases where a real user would be unable to click, which turns a genuine bug into a green test. The legitimate uses are things a user genuinely does not do: scrolling an element into view, or reading back a computed value. If a click only works through JavaScript, you have found a bug, not a workaround.',
    code: {
      selenium: `JavascriptExecutor js = (JavascriptExecutor) driver;

// Defensible: a user scrolls too, this just makes it deterministic.
js.executeScript("arguments[0].scrollIntoView({block:'center'});", element);

// Not defensible: passes even when the element is covered by an overlay.
js.executeScript("arguments[0].click();", element);`,
    },
    wrong:
      '"I use a JS click when the normal click is flaky." That sentence says you found a real defect and suppressed it, and every interviewer hears it that way.',
    followUp:
      'The element really is behind a sticky header and the product is fine with that. Now what? — scroll it into view, or set a viewport where it is not covered. Both keep the click honest.',
  },

  /* ------------------------------------ structure ----------------------------------- */
  {
    id: 'page-factory',
    group: 'structure',
    tool: 'selenium',
    question: 'What is PageFactory and @FindBy, and would you use it?',
    answer:
      'PageFactory initialises fields annotated with @FindBy as lazy proxies that resolve on first use. It reads nicely, and it has a real problem: the proxy caches the element after the first resolution, so on a page that re-renders you are back to StaleElementReferenceException, and now the cause is hidden inside a framework rather than visible in your code. Modern Selenium code tends to skip it and keep By locators as constants, resolving them at the point of use. I would not fail a codebase for using it, but I would not add it to a new one.',
    code: {
      selenium: `// The modern shape: a locator constant, resolved when it is used.
private static final By CHECKOUT = By.id("checkout");

public void checkout() {
  new WebDriverWait(driver, Duration.ofSeconds(10))
      .until(ExpectedConditions.elementToBeClickable(CHECKOUT))
      .click();
}`,
    },
    followUp:
      'What does @CacheLookup do? — it makes the caching explicit and permanent, so it is only safe on an element that never re-renders. It is a performance option that trades away the thing you usually need.',
  },
  {
    id: 'fixtures',
    group: 'structure',
    tool: 'playwright',
    question: 'What are fixtures in Playwright, and what do they replace?',
    answer:
      'A fixture is a named dependency a test declares and the runner constructs on demand — the built-in page fixture is why each test gets a fresh context without writing setup. Custom fixtures replace beforeEach hooks and, more importantly, replace shared mutable state at the top of a file. The difference that matters: a hook runs for every test in its scope whether the test needs it or not, while a fixture is only built for the tests that ask for it, and its teardown is attached to it rather than to a matching afterEach somebody will eventually forget to update.',
    code: {
      playwright: `const test = base.extend<{ signedIn: Page }>({
  signedIn: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await use(page); // the test runs here
    // teardown lives with the setup, not in a distant afterEach
  },
});

test('sees their orders', async ({ signedIn }) => {
  await expect(signedIn.getByRole('heading')).toHaveText('Your orders');
});`,
    },
    followUp:
      'How is that better than beforeEach? — it composes, it is lazy, and its teardown cannot drift away from its setup. Those are three different arguments; giving all three is a strong answer.',
  },
  {
    id: 'independent-tests',
    group: 'structure',
    tool: 'both',
    question: 'How do you keep tests independent?',
    answer:
      'Each test creates the data it needs and never depends on data another test left behind. In practice that means three habits: build fixtures through the API rather than by driving the UI, make every identifier unique per test so two workers cannot collide on the same record, and never write a test that only passes when the one before it ran. The check is simple — if the suite cannot run in a random order, or a single test cannot be run on its own, they are not independent, and that will surface as flake the day parallelism is turned on.',
    wrong:
      '"They run in order, so test 2 can rely on test 1 logging in." That is a suite that cannot shard, cannot retry a single failure, and produces cascading red where one thing broke.',
    followUp:
      'What about the login, though? Do you log in through the UI in every test? — no. Log in once, save the storage state, and reuse it. That is the next question, and having the answer ready is worth a lot.',
  },
  {
    id: 'annotations-order',
    group: 'structure',
    tool: 'selenium',
    question: 'What is the difference between @BeforeClass, @BeforeMethod and @BeforeSuite?',
    answer:
      'Suite runs once for the whole run, class once per test class, method before every test method — with the JUnit equivalents being @BeforeAll and @BeforeEach. The question underneath is where the driver should be created. Per method is the safest and slowest; per class is the usual compromise, and the moment you take it you own the cleanup, because state left in the browser by one test is now visible to the next. Anything static shared across a class is also the thing that breaks when the class runs in parallel.',
    followUp:
      'Where would you create the driver, then? — per method, unless the runtime demands otherwise, and if per class then with explicit state reset between tests. Say which trade you are making rather than naming one.',
  },

  /* ------------------------------------- network ------------------------------------ */
  {
    id: 'storage-state',
    group: 'network',
    tool: 'both',
    question: 'Your suite logs in through the UI in all 400 tests. How would you fix that?',
    answer:
      'Log in once, save the authenticated state, and load it into each test’s context. In Playwright that is storageState written by a setup project and reused by everything after it — cookies and local storage restored into a fresh context, so the test starts already signed in. In Selenium the equivalent is obtaining a session token through the API and injecting the cookie before the first navigation. Either way the login page gets tested by the handful of tests that are actually about login, and the other 399 stop paying for it. On a suite that size this is usually the single largest runtime win available, and it removes the most common cause of a full-suite cascade — every test failing because the login page changed.',
    code: {
      playwright: `// One setup project writes the state...
await page.context().storageState({ path: 'auth.json' });

// ...and every project after it starts signed in.
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /auth\\.setup\\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { storageState: 'auth.json' },
    },
  ],
});`,
      selenium: `// Get a session the fast way, then hand it to the browser.
String token = api.login("ada@example.com", "hunter2");
driver.get("https://app.example.com/blank");
driver.manage().addCookie(new Cookie("session", token));
driver.navigate().to("https://app.example.com/orders");`,
    },
    followUp:
      'What breaks if every test shares one account? — tests mutate each other’s data. Either the state is read-only, or you need an account per worker, and knowing which case you are in is the real answer.',
  },
  {
    id: 'network-mocking',
    group: 'network',
    tool: 'playwright',
    question: 'How would you test how the UI handles a 500 from the API?',
    answer:
      'Intercept the route and fulfil it with the response you want, which makes an error path that is nearly impossible to trigger for real into a fast, deterministic test. It is the strongest argument for Playwright over Selenium in a UI suite, because Selenium simply cannot do it without a proxy. The caveat to volunteer: a mocked response is a contract you have written down, and it will keep passing after the real API changes shape — so mocks belong in tests about the UI’s behaviour, with a contract test or a real end-to-end covering the shape itself.',
    code: {
      playwright: `await page.route('**/api/orders', (route) =>
  route.fulfill({ status: 500, body: '{"error":"boom"}' })
);
await page.goto('/orders');
await expect(page.getByRole('alert')).toHaveText(/try again/i);`,
    },
    followUp:
      'How do you stop the mock drifting from the real API? — pin it to a contract: generate from the schema, or have a contract test that fails when the real response stops matching.',
  },
  {
    id: 'api-plus-ui',
    group: 'network',
    tool: 'playwright',
    question: 'How would you set up test data without clicking through the UI to create it?',
    answer:
      'Call the API directly from the test using the request context, then drive the UI only for the part under test. A test about the orders list should create the order over HTTP in milliseconds rather than walking the checkout flow, because when it fails you want to know the list is broken, not that checkout is. It also removes the most common cause of a slow suite, which is every test recreating its world through the interface.',
    code: {
      playwright: `test('shows an order in the list', async ({ page, request }) => {
  const created = await request.post('/api/orders', {
    data: { sku: 'ABC-1', qty: 2 },
  });
  const { id } = await created.json();

  await page.goto('/orders');
  await expect(page.getByRole('row', { name: id })).toBeVisible();
});`,
    },
    followUp:
      'Does that not skip testing checkout? — checkout gets its own test. This is the difference between a test that has one reason to fail and one that has six.',
  },

  /* ------------------------------------ debugging ----------------------------------- */
  {
    id: 'fails-only-in-ci',
    group: 'debugging',
    tool: 'both',
    question: 'A test passes locally and fails only in CI. How do you debug it?',
    answer:
      'Start from evidence rather than theory, which means the first fix is usually to the pipeline, not the test: screenshot, video, trace and the page HTML on failure, uploaded as artifacts. With those in hand the causes are a short list — a different viewport so the element is off-screen or behind a sticky header; a slower machine so a real race loses; shared data because CI runs in parallel and your laptop does not; a different timezone or locale changing a formatted date; and animations that your machine finishes before the assertion and CI does not. I would reproduce with the CI viewport and a throttled CPU before changing a line of the test, because the temptation is to add a wait and the wait usually hides it rather than fixing it.',
    wrong:
      '"I add a retry and move on." Sometimes defensible as a stopgap, never as the answer to this question — it says the failure is unexplained and will be shipped.',
    followUp:
      'It only fails when the full suite runs, never alone. — that is shared state, and now the question is which resource two tests are both touching.',
  },
  {
    id: 'trace-viewer',
    group: 'debugging',
    tool: 'playwright',
    question: 'What is in a Playwright trace, and how do you use one?',
    answer:
      'A trace is a recording of the run: a DOM snapshot before and after every action, the network log, the console, the source line for each step, and screenshots along a timeline. You open it and scrub to the failing action, then look at the before snapshot — which is a live, inspectable DOM you can hover, not an image. That usually answers the question outright, because you can see the spinner still up or the element behind an overlay at the exact instant of the click. The setting worth knowing is trace: "on-first-retry", which costs nothing on green runs and gives you a full recording of anything that failed.',
    code: {
      playwright: `export default defineConfig({
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});`,
    },
    followUp:
      'Why not trace everything? — size and time. On-first-retry is the setting that gets you the evidence for exactly the runs where you need it.',
  },
  {
    id: 'selenium-artifacts',
    group: 'debugging',
    tool: 'selenium',
    question: 'What do you capture when a Selenium test fails?',
    answer:
      'A screenshot, the page source, the browser console log, and the URL — captured in a listener or a rule so it happens on every failure rather than being remembered per test. Selenium has nothing like a trace, so the artifacts you deliberately collect are all the evidence that will ever exist for that run, and the difference between a five-minute diagnosis and a "cannot reproduce" is entirely whether someone set this up before the failure happened.',
    code: {
      selenium: `File shot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
String html = driver.getPageSource();
String url = driver.getCurrentUrl();`,
    },
    followUp:
      'Why the page source as well as the screenshot? — a screenshot cannot tell you the element was there but zero-height, or that the text differed by a trailing space.',
  },

  /* -------------------------------------- scale ------------------------------------- */
  {
    id: 'grid-parallel',
    group: 'scale',
    tool: 'both',
    question: 'How do you run a suite in parallel?',
    answer:
      'Selenium distributes across machines with Grid — a hub handing sessions to nodes — and you point a RemoteWebDriver at it, with the test framework running threads locally. Playwright runs workers as separate processes on one machine and shards across machines in CI, and because a browser context is cheap it gets far more out of a single box before you need a grid at all. In both cases the hard part is not the mechanism, it is the data: parallelism turns every piece of shared state into a race, so the work is giving each worker its own account and its own records.',
    followUp:
      'How many workers? — measured, not guessed: raise it until the failure rate moves or the machine saturates. A number chosen without measuring is the usual cause of a suite that is flaky above four workers.',
  },
  {
    id: 'cross-browser',
    group: 'scale',
    tool: 'both',
    question: 'How much cross-browser testing is worth doing?',
    answer:
      'Less than people assume, and the answer should be driven by analytics rather than symmetry. The engines are three — Blink, Gecko, WebKit — so running Chrome and Edge is nearly the same test twice, while Safari is the one that actually finds things, and it is the one most teams skip because it needs a Mac. My default is the full suite on one engine per commit, and a smoke set on the others nightly, adjusted by what the traffic actually is. Saying "we run everything on everything" is usually a sign nobody has looked at the cost.',
    followUp:
      'What actually differs between engines in practice? — date and number formatting, font metrics changing layout, Safari’s stricter autoplay and storage rules, and flexbox and scrolling edge cases. Naming real ones is what separates this from a rehearsed answer.',
  },
  {
    id: 'headless',
    group: 'scale',
    tool: 'both',
    question: 'Does headless behave differently from headed?',
    answer:
      'Yes, and the differences are the ones that bite in CI. The default viewport is different, so elements are off-screen or a mobile layout renders instead. Fonts may be missing on a Linux container, which changes text metrics and therefore layout. Some GPU-backed rendering paths differ. And headless is faster, which sounds good and means a race your machine always won can start losing. The practical answer is to pin the viewport explicitly rather than inheriting a default, and to run headed locally with the CI viewport when reproducing a CI-only failure.',
    followUp:
      'Would you run headed in CI? — no, but I would run headed locally against the CI viewport and browser version, which reproduces most of these without the cost.',
  },
];
