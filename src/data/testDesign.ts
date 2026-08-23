/**
 * Test design: the round that is actually about testing.
 *
 * WHY THIS EXISTS. Every phase before this one prepared you for rounds a SWE candidate also
 * sits. "How would you test X?" is the round that is only asked of you, it is asked in almost
 * every SDET loop, and it is scored on something the coding round never touches — whether you
 * can enumerate a space systematically instead of listing whatever comes to mind and stopping
 * when you run dry.
 *
 * That is a trainable skill, and it trains the same way vocabulary does: attempt first, compare
 * against a reference, and pay attention to which whole categories you never reached. A candidate
 * who lists twenty happy-path variations scores worse than one who lists eight cases spread
 * across boundaries, failure and concurrency, so the useful measurement is not how many cases you
 * produced — it is which DIMENSIONS you never touched. `blindSpots` in utils/testDesign.ts exists
 * for exactly that, and it is the part of this phase worth the most.
 *
 * ON THE REFERENCE LISTS. They are not exhaustive and cannot be — that is the nature of the
 * question. They are a floor. `must` marks what a competent answer is expected to reach;
 * `credit` marks what separates a strong answer from an adequate one. Both are written from
 * failure modes that show up in real systems rather than from a textbook's worked examples.
 */

export type DimensionId =
  | 'happy'
  | 'equivalence'
  | 'boundary'
  | 'negative'
  | 'state'
  | 'concurrency'
  | 'failure'
  | 'scale'
  | 'security'
  | 'compat'
  | 'observability';

export interface Dimension {
  id: DimensionId;
  label: string;
  /** The question to ask yourself, phrased so it works against any subject. */
  question: string;
  /** What skipping it costs — why this earns a place on the list. */
  miss: string;
}

/**
 * The enumeration scaffold, in the order to walk it in the room.
 *
 * Eleven is deliberately more than you will finish out loud. The point is that you never run
 * dry — you run out of time, which reads completely differently.
 */
export const DIMENSIONS: Dimension[] = [
  {
    id: 'happy',
    label: 'Happy path',
    question: 'What does "it works" mean, precisely, and how would you see it?',
    miss: 'Skipping it looks clever and reads as though you cannot state the requirement.',
  },
  {
    id: 'equivalence',
    label: 'Equivalence classes',
    question: 'Which groups of input should behave identically, so one case covers the group?',
    miss: 'Without classes you either test three variations of the same thing or all of them.',
  },
  {
    id: 'boundary',
    label: 'Boundaries',
    question: 'Where are the edges of each class — and what sits one either side of each edge?',
    miss: 'The densest bug region in any system, and the cheapest to name.',
  },
  {
    id: 'negative',
    label: 'Invalid and hostile input',
    question: 'What happens with malformed, missing, oversized or deliberately nasty input?',
    miss: 'Testers who only test what users are supposed to do find only the bugs users avoid.',
  },
  {
    id: 'state',
    label: 'State, order and repetition',
    question: 'Does doing it twice, out of order, or after a refresh give the same answer?',
    miss: 'Most production bugs that survive review are sequence bugs, not single-call bugs.',
  },
  {
    id: 'concurrency',
    label: 'Concurrency',
    question: 'What if two actors do it at the same instant — two tabs, two users, a double-click?',
    miss: 'The dimension candidates skip most often, and the one interviewers listen for.',
  },
  {
    id: 'failure',
    label: 'Dependency failure',
    question: 'What does it do when the thing it depends on is slow, down, or lies to it?',
    miss: 'A system is defined as much by how it degrades as by what it does when healthy.',
  },
  {
    id: 'scale',
    label: 'Scale and performance',
    question: 'What changes at a thousand times the volume, or on a connection ten times slower?',
    miss: 'Correct-but-unusable ships all the time, and functional tests never catch it.',
  },
  {
    id: 'security',
    label: 'Permission and abuse',
    question: 'Can someone see or change what is not theirs, or use this faster than intended?',
    miss: 'Authorisation by object id is the single most common real vulnerability in web apps.',
  },
  {
    id: 'compat',
    label: 'Environment, locale, accessibility',
    question: 'Which device, browser, language, or assistive technology have you assumed away?',
    miss: 'Accessibility in particular is legally required and almost never mentioned unprompted.',
  },
  {
    id: 'observability',
    label: 'Observability',
    question: 'If this broke in production at 3am, how would anyone know, and how would they tell why?',
    miss: 'Naming it is the clearest signal that you have owned something in production.',
  },
];

export const DIMENSION_BY_ID: Record<DimensionId, Dimension> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, d])
) as Record<DimensionId, Dimension>;

/** `must` — a competent answer reaches this. `credit` — it separates you from the pile. */
export type CaseTier = 'must' | 'credit';

export interface ExpectedCase {
  id: string;
  dimension: DimensionId;
  text: string;
  tier: CaseTier;
}

export interface DesignExercise {
  id: string;
  title: string;
  /** Roughly how the question gets put in the room. */
  prompt: string;
  /** What is unstated and worth asking for. Asking is itself part of what is scored. */
  clarifiers: string[];
  expected: ExpectedCase[];
  /** Where the interviewer takes it once you have produced a list. */
  followUps: string[];
}

export const EXERCISES: DesignExercise[] = [
  {
    id: 'login',
    title: 'A login page',
    prompt:
      'A standard email-and-password sign-in form on a web app. Take a few minutes and tell me how you would test it.',
    clarifiers: [
      'Is there SSO, or two-factor, or is password the only path?',
      'Is there a lockout policy, and after how many attempts?',
      'Who owns the session — a cookie we set, or a token from an auth service?',
      'Web only, or the mobile app against the same endpoint?',
    ],
    followUps: [
      'Which three of those would you automate first, and at which layer?',
      'Your login test is flaky in CI once a week. How do you find out why?',
      'How would you test this if the auth service belonged to another team and had no sandbox?',
    ],
    expected: [
      { id: 'login-happy-1', dimension: 'happy', tier: 'must', text: 'Valid credentials sign in and land on the page the user originally asked for, not just the home page.' },
      { id: 'login-happy-2', dimension: 'happy', tier: 'credit', text: '“Remember me” keeps the session across a browser restart; left unchecked, it does not.' },
      { id: 'login-eq-1', dimension: 'equivalence', tier: 'must', text: 'Right email + wrong password, wrong email + right password, and an unregistered email all present identically to the user.' },
      { id: 'login-eq-2', dimension: 'equivalence', tier: 'must', text: 'Email case and surrounding whitespace: “ Ada@x.com ” reaches the same account as “ada@x.com”.' },
      { id: 'login-bound-1', dimension: 'boundary', tier: 'must', text: 'Password at exactly the minimum length, one under, one over.' },
      { id: 'login-bound-2', dimension: 'boundary', tier: 'credit', text: 'Password at the documented maximum and one over — silent truncation at the boundary is a real bug class.' },
      { id: 'login-bound-3', dimension: 'boundary', tier: 'must', text: 'Empty email, empty password, both empty.' },
      { id: 'login-bound-4', dimension: 'boundary', tier: 'must', text: 'Lockout at exactly N failures: N−1 still succeeds, N locks, and a success resets the counter.' },
      { id: 'login-neg-1', dimension: 'negative', tier: 'must', text: 'Malformed addresses: no @, two @, trailing dot, unicode local part, a 300-character address.' },
      { id: 'login-neg-2', dimension: 'negative', tier: 'must', text: 'SQL and script payloads in both fields are stored and echoed back safely.' },
      { id: 'login-neg-3', dimension: 'negative', tier: 'credit', text: 'Leading and trailing spaces in the password are NOT trimmed — trimming silently changes the credential.' },
      { id: 'login-state-1', dimension: 'state', tier: 'must', text: 'Back button after logout does not restore an authenticated page from the browser cache.' },
      { id: 'login-state-2', dimension: 'state', tier: 'must', text: 'The session expires at the documented TTL, and an expired token returns you to login with the destination preserved.' },
      { id: 'login-state-3', dimension: 'state', tier: 'credit', text: 'Signing in on a second device does not invalidate the first, unless the product says it should.' },
      { id: 'login-conc-1', dimension: 'concurrency', tier: 'credit', text: 'Double-clicking Sign in submits once — twice can trip the lockout counter on a correct password.' },
      { id: 'login-conc-2', dimension: 'concurrency', tier: 'credit', text: 'Changing the password in one tab invalidates the session held in another.' },
      { id: 'login-fail-1', dimension: 'failure', tier: 'must', text: 'The auth service times out: the user gets a distinguishable error, not “wrong password”.' },
      { id: 'login-fail-2', dimension: 'failure', tier: 'credit', text: 'Whether a failed request is retried is a deliberate decision — an automatic retry double-counts a failed attempt.' },
      { id: 'login-sec-1', dimension: 'security', tier: 'must', text: 'The password never appears in the URL, the page source, the console, or an analytics payload.' },
      { id: 'login-sec-2', dimension: 'security', tier: 'credit', text: 'Response time is the same for a registered and an unregistered address, or the form enumerates accounts.' },
      { id: 'login-sec-3', dimension: 'security', tier: 'credit', text: 'Rate limiting per IP as well as per account, so guessing spread across accounts is still covered.' },
      { id: 'login-sec-4', dimension: 'security', tier: 'credit', text: 'The session cookie is HttpOnly, Secure and SameSite.' },
      { id: 'login-scale-1', dimension: 'scale', tier: 'credit', text: 'The lockout counter stays correct when one account is attacked from many machines at once.' },
      { id: 'login-compat-1', dimension: 'compat', tier: 'must', text: 'Keyboard only: tab order, Enter submits, and the error is announced to a screen reader rather than only turning red.' },
      { id: 'login-compat-2', dimension: 'compat', tier: 'credit', text: 'Password managers can fill it — a real input of type password, with a name they recognise.' },
      { id: 'login-compat-3', dimension: 'compat', tier: 'credit', text: 'Non-Latin passwords, and an RTL locale rendering the form.' },
      { id: 'login-obs-1', dimension: 'observability', tier: 'must', text: 'A failed login is logged with enough to investigate — time, IP, reason code — and without the password.' },
    ],
  },

  {
    id: 'cart',
    title: 'An Add to Cart button',
    prompt:
      'The Add to Cart button on a retail product page. How do you test it?',
    clarifiers: [
      'Signed in, guest, or both — and does a guest cart survive signing in?',
      'Is stock reserved when you add, or only at checkout?',
      'Does the cart follow the account across devices?',
      'One seller per item, or several with different prices?',
    ],
    followUps: [
      'Stock is decremented at checkout, not at add. Which of your cases changes?',
      'How do you test the two-tabs-last-unit case without two real browsers?',
      'Where does each of these live — unit, service, or end-to-end?',
    ],
    expected: [
      { id: 'cart-happy-1', dimension: 'happy', tier: 'must', text: 'Adding an item shows it in the cart with the right price, quantity, seller and image.' },
      { id: 'cart-happy-2', dimension: 'happy', tier: 'must', text: 'The cart badge count updates without a full page reload.' },
      { id: 'cart-eq-1', dimension: 'equivalence', tier: 'must', text: 'In stock, low stock, out of stock, and pre-order each follow their own rule.' },
      { id: 'cart-bound-1', dimension: 'boundary', tier: 'must', text: 'Quantity 1, at the per-order limit, one over the limit, zero, and negative.' },
      { id: 'cart-bound-2', dimension: 'boundary', tier: 'must', text: 'Adding the last unit in stock, and adding one more than remains.' },
      { id: 'cart-bound-3', dimension: 'boundary', tier: 'credit', text: 'A cart already at its maximum number of distinct lines.' },
      { id: 'cart-neg-1', dimension: 'negative', tier: 'must', text: 'Quantity of “2.5”, “1e3”, “abc” — including a value edited into the request rather than typed into the UI.' },
      { id: 'cart-neg-2', dimension: 'negative', tier: 'credit', text: 'A product id that exists but is not purchasable in this region.' },
      { id: 'cart-state-1', dimension: 'state', tier: 'must', text: 'Adding the same item twice increments the existing line rather than creating a second one.' },
      { id: 'cart-state-2', dimension: 'state', tier: 'must', text: 'A guest cart merges into the account cart on sign-in without losing or duplicating lines.' },
      { id: 'cart-state-3', dimension: 'state', tier: 'must', text: 'The cart survives a refresh, a new tab, and a session that expires and is renewed.' },
      { id: 'cart-state-4', dimension: 'state', tier: 'credit', text: 'A price that changes between add and checkout is surfaced rather than silently charged.' },
      { id: 'cart-conc-1', dimension: 'concurrency', tier: 'must', text: 'Two tabs adding the last unit at once: one succeeds, one gets a clear failure, stock never goes negative.' },
      { id: 'cart-conc-2', dimension: 'concurrency', tier: 'must', text: 'Double-click adds one, not two.' },
      { id: 'cart-fail-1', dimension: 'failure', tier: 'must', text: 'The pricing service is down: the button fails closed with a retry rather than adding at a stale or zero price.' },
      { id: 'cart-fail-2', dimension: 'failure', tier: 'credit', text: 'The add succeeds server-side but the response is lost — the client retry must be idempotent.' },
      { id: 'cart-scale-1', dimension: 'scale', tier: 'credit', text: 'A cart with hundreds of lines still renders and totals inside the latency budget.' },
      { id: 'cart-scale-2', dimension: 'scale', tier: 'credit', text: 'Add-to-cart latency under sale-event traffic, not just at rest.' },
      { id: 'cart-sec-1', dimension: 'security', tier: 'must', text: 'You cannot read or write another user’s cart by changing the id in the request.' },
      { id: 'cart-sec-2', dimension: 'security', tier: 'must', text: 'Price comes from the server; a price in the client payload is ignored.' },
      { id: 'cart-compat-1', dimension: 'compat', tier: 'must', text: 'A screen reader announces the addition — a purely visual badge change is silent.' },
      { id: 'cart-compat-2', dimension: 'compat', tier: 'credit', text: 'Mobile web and a slow connection, where the tap appears to do nothing for two seconds.' },
      { id: 'cart-obs-1', dimension: 'observability', tier: 'credit', text: 'Add-to-cart failures are counted and alertable separately from checkout failures.' },
    ],
  },

  {
    id: 'upload',
    title: 'A profile picture upload',
    prompt:
      'Users can upload a profile picture. Design the tests.',
    clarifiers: [
      'Which formats, and what is the size limit?',
      'Is the image resized or re-encoded server-side, or stored as sent?',
      'Is the stored file public, or behind authorisation?',
      'Is the camera a source on mobile, or file picker only?',
    ],
    followUps: [
      'How do you generate the malformed files — by hand, or as part of the suite?',
      'The upload works locally and fails in CI. Where do you look first?',
      'What would you assert about the resized output without comparing images pixel by pixel?',
    ],
    expected: [
      { id: 'upl-happy-1', dimension: 'happy', tier: 'must', text: 'A valid JPEG and PNG upload, and the new picture appears everywhere the avatar is shown, not only on the settings page.' },
      { id: 'upl-happy-2', dimension: 'happy', tier: 'must', text: 'Replacing an existing picture, and removing one entirely.' },
      { id: 'upl-eq-1', dimension: 'equivalence', tier: 'must', text: 'Each accepted format, one rejected format, and a file with an accepted extension but the wrong magic bytes.' },
      { id: 'upl-bound-1', dimension: 'boundary', tier: 'must', text: 'Exactly the size limit, one byte over, one byte, and a zero-byte file.' },
      { id: 'upl-bound-2', dimension: 'boundary', tier: 'credit', text: 'Minimum and maximum accepted dimensions, and an extreme aspect ratio such as 10000×1.' },
      { id: 'upl-neg-1', dimension: 'negative', tier: 'must', text: 'A .jpg that is really an archive or an executable.' },
      { id: 'upl-neg-2', dimension: 'negative', tier: 'must', text: 'A truncated or corrupt image that decodes halfway and then fails.' },
      { id: 'upl-neg-3', dimension: 'negative', tier: 'credit', text: 'A filename containing “../”, a null byte, 255 characters, or emoji.' },
      { id: 'upl-neg-4', dimension: 'negative', tier: 'credit', text: 'A decompression bomb — a small file whose pixel count exhausts memory on decode.' },
      { id: 'upl-state-1', dimension: 'state', tier: 'must', text: 'Cancelling mid-upload leaves no orphaned file and no half-updated profile.' },
      { id: 'upl-state-2', dimension: 'state', tier: 'credit', text: 'The previous file is deleted, or deliberately retained, according to policy.' },
      { id: 'upl-state-3', dimension: 'state', tier: 'credit', text: 'The write succeeds but the CDN copy lags — what does the user see in that window?' },
      { id: 'upl-conc-1', dimension: 'concurrency', tier: 'credit', text: 'Two uploads at once from two tabs resolve to one deterministic winner.' },
      { id: 'upl-fail-1', dimension: 'failure', tier: 'must', text: 'The connection drops at 90% — no partial file is served as if complete.' },
      { id: 'upl-fail-2', dimension: 'failure', tier: 'must', text: 'Storage errors after the database row is written: no record pointing at a file that does not exist.' },
      { id: 'upl-scale-1', dimension: 'scale', tier: 'credit', text: 'A max-size file on a slow connection against every timeout in the path — proxy, gateway and app.' },
      { id: 'upl-scale-2', dimension: 'scale', tier: 'credit', text: 'Progress is reported and is actually accurate rather than an animation.' },
      { id: 'upl-sec-1', dimension: 'security', tier: 'must', text: 'The file is served from somewhere it cannot execute, with a content type that cannot be sniffed into HTML.' },
      { id: 'upl-sec-2', dimension: 'security', tier: 'must', text: 'The endpoint requires authentication and is rate limited — free storage is a target.' },
      { id: 'upl-sec-3', dimension: 'security', tier: 'credit', text: 'EXIF GPS is stripped before the image is public.' },
      { id: 'upl-sec-4', dimension: 'security', tier: 'credit', text: 'If the picture is meant to be private, its URL is not guessable.' },
      { id: 'upl-compat-1', dimension: 'compat', tier: 'must', text: 'The file input is reachable by keyboard and carries a real label.' },
      { id: 'upl-compat-2', dimension: 'compat', tier: 'credit', text: 'HEIC from an iPhone, and portrait EXIF rotation being honoured rather than showing sideways.' },
      { id: 'upl-obs-1', dimension: 'observability', tier: 'credit', text: 'Rejections are logged with a reason, so “it will not let me” is diagnosable without a repro.' },
    ],
  },

  {
    id: 'typeahead',
    title: 'Search autocomplete',
    prompt:
      'The search box suggests results as the user types. How would you test it?',
    clarifiers: [
      'How many suggestions, from where, and are they personalised?',
      'Is there a debounce, and how long?',
      'Does Enter search the typed text or the highlighted suggestion?',
      'Is the suggestion index the same one that serves the results page?',
    ],
    followUps: [
      'How do you test the out-of-order response case deterministically?',
      'What is the assertion for “relevant”? Relevance is not a boolean.',
      'Which of these can be a unit test on the client?',
    ],
    expected: [
      { id: 'ta-happy-1', dimension: 'happy', tier: 'must', text: 'Typing a prefix shows suggestions, and picking one runs the search it promised.' },
      { id: 'ta-eq-1', dimension: 'equivalence', tier: 'must', text: 'Prefix match, mid-word match, misspelling and synonym each have a defined behaviour — or are explicitly out of scope.' },
      { id: 'ta-bound-1', dimension: 'boundary', tier: 'must', text: 'One character — does it fire at all? — and a query at the maximum length.' },
      { id: 'ta-bound-2', dimension: 'boundary', tier: 'must', text: 'Zero results shows a real empty state rather than an empty box.' },
      { id: 'ta-bound-3', dimension: 'boundary', tier: 'credit', text: 'Exactly the debounce interval between keystrokes, on both sides of it.' },
      { id: 'ta-neg-1', dimension: 'negative', tier: 'must', text: 'Whitespace only, punctuation only, an emoji, and a 5,000-character paste.' },
      { id: 'ta-neg-2', dimension: 'negative', tier: 'must', text: 'HTML inside a suggestion is escaped, not rendered — the suggestion list is a stored-XSS sink.' },
      { id: 'ta-state-1', dimension: 'state', tier: 'must', text: 'Responses arriving out of order: a slower earlier request must not overwrite a newer one.' },
      { id: 'ta-state-2', dimension: 'state', tier: 'must', text: 'Deleting back to empty closes the list rather than leaving the last results up.' },
      { id: 'ta-state-3', dimension: 'state', tier: 'credit', text: 'A suggestion chosen by keyboard and by mouse produce identical outcomes.' },
      { id: 'ta-conc-1', dimension: 'concurrency', tier: 'must', text: 'Typing fast enough that requests overlap — debounce and cancellation actually work.' },
      { id: 'ta-fail-1', dimension: 'failure', tier: 'must', text: 'The suggestion service is down and the box still lets you submit a plain search.' },
      { id: 'ta-fail-2', dimension: 'failure', tier: 'credit', text: 'A slow response leaves the list stale but never blocks typing.' },
      { id: 'ta-scale-1', dimension: 'scale', tier: 'must', text: 'The per-keystroke latency budget, and how many requests a 20-character query actually generates.' },
      { id: 'ta-scale-2', dimension: 'scale', tier: 'credit', text: 'A term matching millions of documents returns as fast as one matching ten.' },
      { id: 'ta-sec-1', dimension: 'security', tier: 'credit', text: 'Personalised suggestions never surface another user’s private terms.' },
      { id: 'ta-sec-2', dimension: 'security', tier: 'credit', text: 'Query strings reaching a log-based dashboard are escaped there too.' },
      { id: 'ta-compat-1', dimension: 'compat', tier: 'must', text: 'It is a real ARIA combobox: arrows move, the active option is announced, Escape closes.' },
      { id: 'ta-compat-2', dimension: 'compat', tier: 'credit', text: 'IME composition — a handler firing mid-composition in Japanese or Chinese sends fragments.' },
      { id: 'ta-compat-3', dimension: 'compat', tier: 'credit', text: 'On mobile the on-screen keyboard does not cover the suggestions.' },
      { id: 'ta-obs-1', dimension: 'observability', tier: 'credit', text: 'No-result queries are recorded — they are the highest-value signal the search team gets.' },
    ],
  },

  {
    id: 'shortener',
    title: 'A URL shortener API',
    prompt:
      'An API takes a long URL and returns a short code; a second endpoint resolves the code and redirects. Write the test cases.',
    clarifiers: [
      'Is the same long URL always the same code, or a new one each time?',
      'Custom aliases? Expiry? Deletion?',
      'Which redirect status — and does that choice matter to us?',
      'Is creating authenticated, or open to anyone?',
    ],
    followUps: [
      'Which of these belong in a contract test rather than an end-to-end one?',
      'How would you load-test the resolve path without generating real traffic to real sites?',
      'A code resolves correctly in staging and 404s in production. Where do you look?',
    ],
    expected: [
      { id: 'sh-happy-1', dimension: 'happy', tier: 'must', text: 'POST returns a code; GET of that code redirects to the original, including its query string.' },
      { id: 'sh-eq-1', dimension: 'equivalence', tier: 'must', text: 'http and https; a URL with a port, with a fragment, with unicode, and one that is already short.' },
      { id: 'sh-bound-1', dimension: 'boundary', tier: 'must', text: 'A URL at the maximum accepted length and one character over.' },
      { id: 'sh-bound-2', dimension: 'boundary', tier: 'must', text: 'Expiry exactly at, just before and just after the TTL.' },
      { id: 'sh-bound-3', dimension: 'boundary', tier: 'credit', text: 'The code-space boundary — the first code that needs an extra character.' },
      { id: 'sh-neg-1', dimension: 'negative', tier: 'must', text: 'Not a URL at all; a javascript: or data: URL; an internal address such as localhost or 169.254.169.254.' },
      { id: 'sh-neg-2', dimension: 'negative', tier: 'must', text: 'Missing body, malformed JSON, wrong content type — each with the right status, not a 500.' },
      { id: 'sh-neg-3', dimension: 'negative', tier: 'must', text: 'An unknown code returns 404 rather than a redirect to the home page.' },
      { id: 'sh-state-1', dimension: 'state', tier: 'must', text: 'Shortening the same URL twice: one code or two, but whichever it is must be deliberate and documented.' },
      { id: 'sh-state-2', dimension: 'state', tier: 'credit', text: 'A deleted code stops resolving and is never reissued to someone else.' },
      { id: 'sh-conc-1', dimension: 'concurrency', tier: 'must', text: 'Two requests racing for the same custom alias — exactly one wins.' },
      { id: 'sh-conc-2', dimension: 'concurrency', tier: 'must', text: 'The generator never hands the same code to two callers under load.' },
      { id: 'sh-fail-1', dimension: 'failure', tier: 'must', text: 'The datastore is unavailable: 503 with a retry hint, not a 200 carrying no code.' },
      { id: 'sh-fail-2', dimension: 'failure', tier: 'credit', text: 'A write that lands after the client has timed out leaves no orphaned code.' },
      { id: 'sh-scale-1', dimension: 'scale', tier: 'must', text: 'Resolve latency at p99 under read-heavy traffic — the read path is the one that must be fast.' },
      { id: 'sh-scale-2', dimension: 'scale', tier: 'credit', text: 'A hot key: one link taking most of the traffic.' },
      { id: 'sh-sec-1', dimension: 'security', tier: 'must', text: 'Authorisation — you cannot list, edit or delete someone else’s links.' },
      { id: 'sh-sec-2', dimension: 'security', tier: 'must', text: 'Creation is rate limited, because an open shortener is used to launder phishing links.' },
      { id: 'sh-sec-3', dimension: 'security', tier: 'credit', text: 'Sequential codes let anyone enumerate every link ever created.' },
      { id: 'sh-compat-1', dimension: 'compat', tier: 'credit', text: 'HEAD as well as GET, a client that does not follow redirects, and correct behaviour behind a CDN cache.' },
      { id: 'sh-obs-1', dimension: 'observability', tier: 'credit', text: 'A resolve records the code and referrer without recording the whole request.' },
    ],
  },

  {
    id: 'pagination',
    title: 'A paginated API endpoint',
    prompt:
      'GET /orders returns the signed-in user’s orders, paginated. Give me the test cases.',
    clarifiers: [
      'Offset-based or cursor-based?',
      'Default page size and maximum page size?',
      'What is the sort, and is it stable when two records share a sort key?',
      'Can the underlying data change while a client is paginating?',
    ],
    followUps: [
      'A record was created between page 1 and page 2. What does the client see, and is that a bug?',
      'How would you write the deep-offset performance test so it fails loudly rather than slowly?',
      'Which of these survive as a contract test when the team adds a field?',
    ],
    expected: [
      { id: 'pg-happy-1', dimension: 'happy', tier: 'must', text: 'Page one returns the default size, in the documented order, with a total or a next cursor.' },
      { id: 'pg-eq-1', dimension: 'equivalence', tier: 'must', text: 'A user with zero orders, fewer than one page, exactly one page, and several pages.' },
      { id: 'pg-bound-1', dimension: 'boundary', tier: 'must', text: 'Page size of 1, the default, the maximum, and the maximum plus one.' },
      { id: 'pg-bound-2', dimension: 'boundary', tier: 'must', text: 'Page 0 and page −1, and the page after the last one.' },
      { id: 'pg-bound-3', dimension: 'boundary', tier: 'must', text: 'A last page that is partially full, and one that is exactly full — the off-by-one that hides the “more” link.' },
      { id: 'pg-neg-1', dimension: 'negative', tier: 'must', text: 'page and size as strings, floats, huge integers, or arrays such as ?page[]=1.' },
      { id: 'pg-neg-2', dimension: 'negative', tier: 'credit', text: 'An unknown sort field, and a cursor from a different endpoint.' },
      { id: 'pg-state-1', dimension: 'state', tier: 'must', text: 'A record created between page 1 and page 2 must not cause an item to be skipped or repeated — the classic offset bug and the reason cursors exist.' },
      { id: 'pg-state-2', dimension: 'state', tier: 'credit', text: 'A record deleted mid-walk does not shorten every subsequent page by one.' },
      { id: 'pg-conc-1', dimension: 'concurrency', tier: 'credit', text: 'Two clients paginating while writes land: the contract is either a stable snapshot or explicitly not one.' },
      { id: 'pg-fail-1', dimension: 'failure', tier: 'credit', text: 'A timeout on page 5 can be retried without restarting the walk.' },
      { id: 'pg-scale-1', dimension: 'scale', tier: 'must', text: 'A user with 100,000 orders: deep offsets get slower and slower, cursors do not.' },
      { id: 'pg-scale-2', dimension: 'scale', tier: 'credit', text: 'Response size at the maximum page size, and whether it is compressed.' },
      { id: 'pg-sec-1', dimension: 'security', tier: 'must', text: 'You cannot page through another user’s orders by changing a user id — or by decrementing a cursor that encodes a raw primary key.' },
      { id: 'pg-sec-2', dimension: 'security', tier: 'credit', text: 'A total count can itself leak how much data another tenant holds.' },
      { id: 'pg-compat-1', dimension: 'compat', tier: 'credit', text: 'Adding a field does not break a client that ignores unknown fields — assert on what you need, not on the whole body.' },
      { id: 'pg-obs-1', dimension: 'observability', tier: 'credit', text: 'The p99 is measured at deep pages, where it is bad, rather than as an average across all pages.' },
    ],
  },

  {
    id: 'reset',
    title: 'A password reset flow',
    prompt:
      'A user clicks “Forgot password”, gets an email with a link, and sets a new password. Test the whole flow.',
    clarifiers: [
      'How long is the token good for, and is it single use?',
      'Does resetting sign out other sessions?',
      'What happens for an account that signed up with SSO and has no password?',
      'Are reset requests rate limited per address?',
    ],
    followUps: [
      'How do you assert on the email without a human reading an inbox?',
      'Corporate mail scanners prefetch links. What does that do to your single-use token?',
      'Which parts of this can you test without sending a real email at all?',
    ],
    expected: [
      { id: 'rs-happy-1', dimension: 'happy', tier: 'must', text: 'Request, email arrives, link opens the form, the new password works and the old one no longer does.' },
      { id: 'rs-eq-1', dimension: 'equivalence', tier: 'must', text: 'A registered address, an unregistered one, an unverified one, and an SSO account with no password to reset.' },
      { id: 'rs-bound-1', dimension: 'boundary', tier: 'must', text: 'The token used a minute before expiry, exactly at expiry, and a minute after.' },
      { id: 'rs-bound-2', dimension: 'boundary', tier: 'credit', text: 'The new password at the minimum and maximum accepted length.' },
      { id: 'rs-neg-1', dimension: 'negative', tier: 'must', text: 'A token altered by one character, a token belonging to another account, and a token already used.' },
      { id: 'rs-neg-2', dimension: 'negative', tier: 'must', text: 'The same link opened twice — the second attempt must fail.' },
      { id: 'rs-neg-3', dimension: 'negative', tier: 'credit', text: 'Setting the new password to the current one, per policy.' },
      { id: 'rs-state-1', dimension: 'state', tier: 'must', text: 'Requesting a second reset either invalidates the first link or does not — and it must be deliberate.' },
      { id: 'rs-state-2', dimension: 'state', tier: 'must', text: 'Whether a reset signs out other sessions is a decision, and both branches need a test.' },
      { id: 'rs-state-3', dimension: 'state', tier: 'credit', text: 'A lockout from earlier failed logins is cleared by a successful reset, or is not.' },
      { id: 'rs-conc-1', dimension: 'concurrency', tier: 'credit', text: 'Two tokens requested and both opened at the same time.' },
      { id: 'rs-fail-1', dimension: 'failure', tier: 'must', text: 'The email provider is down: the user is told, and the token is not left unreissuable.' },
      { id: 'rs-fail-2', dimension: 'failure', tier: 'credit', text: 'Delivery to spam is a product problem as much as a test-environment one.' },
      { id: 'rs-scale-1', dimension: 'scale', tier: 'must', text: 'Repeated requests for one address must not turn the feature into an email bomb aimed at that user.' },
      { id: 'rs-sec-1', dimension: 'security', tier: 'must', text: 'The response is identical for a registered and an unregistered address.' },
      { id: 'rs-sec-2', dimension: 'security', tier: 'must', text: 'The email never contains the new password, and the token is long, random and single use.' },
      { id: 'rs-sec-3', dimension: 'security', tier: 'credit', text: 'A token in the URL can leak to third-party scripts on the reset page via the Referer header.' },
      { id: 'rs-compat-1', dimension: 'compat', tier: 'credit', text: 'A link scanner that prefetches URLs must not consume a single-use token before the user clicks.' },
      { id: 'rs-compat-2', dimension: 'compat', tier: 'credit', text: 'Opening the link in a mobile mail client’s in-app browser, which carries no existing session.' },
      { id: 'rs-obs-1', dimension: 'observability', tier: 'credit', text: 'Requests and completions are counted separately, so a drop-off between them is visible.' },
    ],
  },

  {
    id: 'elevator',
    title: 'An elevator',
    prompt:
      'How would you test an elevator? No code and no browser — just tell me your cases.',
    clarifiers: [
      'How many cars, how many floors, is there a basement or an express floor?',
      'What is the weight limit, and what happens at it?',
      'Is there a fire-service mode or locked floors?',
      'Who is the customer here — the riders, or the building owner?',
    ],
    followUps: [
      'You have one building and one week. What do you actually test, and what do you simulate?',
      'How would you test the dispatch algorithm without an elevator?',
      'What is the single failure you would never ship without covering?',
    ],
    expected: [
      { id: 'el-happy-1', dimension: 'happy', tier: 'must', text: 'A call from floor 3 going up brings a car and opens the doors at floor 3.' },
      { id: 'el-happy-2', dimension: 'happy', tier: 'credit', text: 'Panel light, floor indicator and arrival chime all agree with where the car actually is.' },
      { id: 'el-eq-1', dimension: 'equivalence', tier: 'must', text: 'Calls from inside, from outside, while moving, and for the floor you are already on.' },
      { id: 'el-bound-1', dimension: 'boundary', tier: 'must', text: 'Top and bottom floors — “up” from the top floor is not a meaningful request.' },
      { id: 'el-bound-2', dimension: 'boundary', tier: 'must', text: 'Weight at, just under, and just over the limit.' },
      { id: 'el-bound-3', dimension: 'boundary', tier: 'credit', text: 'A call pressed at the exact instant the doors begin to close.' },
      { id: 'el-neg-1', dimension: 'negative', tier: 'must', text: 'Every button pressed at once; a button held down; a floor that is locked or does not exist.' },
      { id: 'el-neg-2', dimension: 'negative', tier: 'must', text: 'The door sensor obstructed continuously — it must not keep retrying forever in silence.' },
      { id: 'el-state-1', dimension: 'state', tier: 'must', text: 'Requests are served in travel order, not press order: 8, then 2, then 7 is a correctness bug.' },
      { id: 'el-state-2', dimension: 'state', tier: 'credit', text: 'Cancelling a selection by double-pressing, if the product supports it.' },
      { id: 'el-state-3', dimension: 'state', tier: 'credit', text: 'The car returns to a home floor after a period idle.' },
      { id: 'el-conc-1', dimension: 'concurrency', tier: 'must', text: 'Two cars and one call: exactly one answers and the other releases it.' },
      { id: 'el-conc-2', dimension: 'concurrency', tier: 'must', text: 'Calls arriving from three floors while the car is already moving.' },
      { id: 'el-fail-1', dimension: 'failure', tier: 'must', text: 'Power loss mid-travel, a door that will not close, and a sensor that fails on rather than off.' },
      { id: 'el-fail-2', dimension: 'failure', tier: 'credit', text: 'The controller reboots with people inside.' },
      { id: 'el-scale-1', dimension: 'scale', tier: 'must', text: 'Morning peak: everyone entering at the lobby going up — the dispatch policy under load is the interesting part.' },
      { id: 'el-scale-2', dimension: 'scale', tier: 'credit', text: 'Mean and worst-case wait time as the number you actually measure.' },
      { id: 'el-sec-1', dimension: 'security', tier: 'must', text: 'Key-locked floors, fire-service mode overriding all calls, and the emergency phone reaching a human.' },
      { id: 'el-compat-1', dimension: 'compat', tier: 'must', text: 'Accessibility: braille, audible floor announcements, button height, and a door-hold long enough for a wheelchair or a stroller.' },
      { id: 'el-obs-1', dimension: 'observability', tier: 'must', text: 'A fault, door-cycle and overload log — otherwise nobody notices the third car has been slow for a week.' },
    ],
  },
];

/** The method to run in the room, before any of the exercises. */
export const METHOD_STEPS: { title: string; body: string }[] = [
  {
    title: 'Ask before you list',
    body: 'Two or three clarifying questions, then stop. What you ask reveals what you know, and every unasked assumption is a case you will get wrong. If the interviewer says “assume anything”, say your assumptions out loud instead.',
  },
  {
    title: 'Walk the dimensions, do not free-associate',
    body: 'Name the dimension, then give cases under it. “Boundaries: minimum length, one under, one over.” This is the difference between an answer that sounds organised and one that sounds like recall — and it is what stops you drying up after six cases.',
  },
  {
    title: 'Say what you would automate first',
    body: 'A list is not an answer; a prioritised list is. Pick three, say why they are the highest risk, and say at which layer each belongs. Nobody is expected to automate all forty.',
  },
  {
    title: 'Say how you would know in production',
    body: 'Close with observability. It is the shortest way to signal you have owned something live rather than only written tests for it.',
  },
];
