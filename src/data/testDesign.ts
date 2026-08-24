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

/**
 * A worked answer, in four parts, because the failure mode of a checklist is producing a candidate
 * who has forty cases and no way to deliver them. Shown only after you have marked your own — an
 * answer read first gets recited, and a recited answer collapses on the first follow-up.
 */
export interface ModelAnswer {
  /** What you actually say before listing anything, clarifiers included. */
  open: string;
  /** How the enumeration sounds out loud. Not the full list — the narration over it. */
  walk: string;
  /** The three you would automate first and at which layer. The part most answers skip. */
  prioritise: string;
  /** The close, which is almost always observability. */
  close: string;
}

export interface FollowUp {
  question: string;
  /** What a strong answer says. Try yours before opening it. */
  answer: string;
}

export interface DesignExercise {
  id: string;
  title: string;
  /** Roughly how the question gets put in the room. */
  prompt: string;
  /** What is unstated and worth asking for. Asking is itself part of what is scored. */
  clarifiers: string[];
  expected: ExpectedCase[];
  /** Where the interviewer takes it once you have produced a list, and what to say. */
  followUps: FollowUp[];
  modelAnswer: ModelAnswer;
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
      {
        question: 'Your login test is flaky in CI once a week. How do you find out why?',
        answer:
          'Get data instead of guessing: run it in a loop in CI, not locally, and see whether it reproduces at all. Then look for what differs between runs — a fixed test user shared with another suite, a session left behind by an earlier test, a wait on a spinner rather than on the request. Print a correlation id so the failure names a server-side log. If it still will not reproduce, quarantine it with an owner and a date; adding a retry is not a fix, it just moves the flake somewhere I cannot see it.',
      },
      {
        question: 'How would you test this if the auth service belonged to another team and had no sandbox?',
        answer:
          'Fake it at our own boundary so the suite never leaves our network — a stub returning the documented responses, including the timeout and the 500, which are the two I most want to cover and the two a real sandbox gives you least reliably. Then one contract test against their real service on its own schedule, so we find out their shape moved without every test we own going red at once. What I would not do is point the suite at their production.',
      },
      {
        question: 'Support wants the lockout removed because it generates tickets. What do you say?',
        answer:
          'That is a real trade-off and not mine alone, but I would want the numbers first: how many lockouts are attacks and how many are a customer with an old password saved. Then I would offer the middle — exponential backoff instead of a hard lock, plus rate limiting per IP so distributed guessing is still covered. And I would name what we lose, because removing it makes credential stuffing cheap, and that shows up as account takeovers rather than as support tickets.',
      },
    ],
    modelAnswer: {
      open:
        'Before I list anything — is password the only path, or is there SSO and 2FA behind this? Is there a lockout, and after how many attempts? And who owns the session: do we set a cookie, or does an auth service hand us a token? I will assume email and password, a lockout at five, and a cookie we set, and I will flag where that assumption changes the answer.',
      walk:
        'I will go in groups rather than at random. Happy path: valid credentials land you on the page you originally asked for, not the home page — the redirect-after-login is where that quietly breaks. Equivalence: wrong password, unknown email, and right-email-wrong-password should be indistinguishable to the user. Boundaries are where the density is — minimum length and either side of it, empty fields, and the lockout at N−1, at N, and a success in between to prove the counter resets. Then hostile input, then state: back button after logout, session expiry, the destination surviving it. And I want to call out concurrency specifically, because a double-click on submit can burn two attempts off the lockout with a correct password.',
      prioritise:
        'If I could automate three: the lockout boundary, because it locks real customers out and it is cheap to test at the service layer; the identical-error-for-every-failure case, because it is a security requirement and a one-line regression; and one end-to-end happy path including the redirect, because that is the journey whose failure means nobody can get in. Only the third needs a browser — the other two are service-level tests, and putting them in a browser would make them slow and flaky for no extra coverage.',
      close:
        'And I would want to know before a customer tells us: failed logins logged with a reason code and no password, and an alert on the failure rate rather than on individual errors — the signal is the rate changing, not any one failure.',
    },
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
      {
        question: 'Stock is decremented at checkout, not at add. Which of your cases changes?',
        answer:
          'Most of them get easier and one gets harder. Add stops being able to oversell, so the two-tabs-last-unit race moves out of add and into checkout — but it does not disappear, it just fails later and in front of someone who has already entered a card, which is worse. So I would keep the race test and point it at checkout, and add a case for the window itself: item in cart, stock goes to zero elsewhere, what does the cart say before you try to pay? Silently failing at payment is the bug this design creates.',
      },
      {
        question: 'How do you test the two-tabs-last-unit case without two real browsers?',
        answer:
          'Drop below the UI. The race lives in the service, so I would fire two concurrent requests at the endpoint with the same item and assert exactly one succeeds and stock never goes below zero — that runs in milliseconds and can run a hundred times to catch a race that shows up one time in twenty. If the guard is a database constraint or a conditional update I would also test it directly, because that is the thing actually enforcing it. Two browsers would test the same logic far more slowly and far less reliably.',
      },
      {
        question: 'Where does each of these live — unit, service, or end-to-end?',
        answer:
          'Quantity validation and the price-comes-from-the-server rule are unit tests on the logic. Stock transitions, the guest-to-account cart merge, the concurrency case and every authorisation case are service tests, because they need a real datastore but not a browser. End-to-end I would keep to one: add an item, see the badge increment, see the line in the cart — the journey whose failure means the shop is broken. Accessibility I would assert in a component test rather than a full journey, so it fails on the component that regressed.',
      },
    ],
    modelAnswer: {
      open:
        'Two things change the whole answer, so I will ask first: is stock reserved at add or at checkout, and does a guest cart survive signing in? I will assume reserved at add and yes, a guest cart merges — and I will say where the other choice would move my tests.',
      walk:
        'Happy path is that the line shows the right price, quantity and seller, and the badge updates without a reload. Equivalence by stock state — in stock, low stock, out of stock, pre-order. Boundaries around quantity: one, the per-order limit, one over, zero, negative, and the last unit in stock against one more than remains. Then invalid input, including a quantity edited into the request rather than typed into the field, which is the version that actually gets exploited. State is heavy here: adding twice increments rather than duplicating, the guest cart merges without losing lines, the cart survives a refresh. And concurrency is the one I would not skip — two tabs taking the last unit, and a double-click adding one rather than two.',
      prioritise:
        'Three first: the double-click, because it is the most common real bug and it is cheap; the two-tabs-last-unit race at the service layer, because overselling costs money and support time; and the authorisation case — you cannot touch another customer’s cart by changing an id — because that class of bug is the most common serious vulnerability in web apps and it is a fast test. All three are service tests. The browser test I would keep is the single happy journey.',
      close:
        'And I would want add-to-cart failures counted separately from checkout failures, because they fail for different reasons and a single "cart errors" number hides which half is broken.',
    },
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
      {
        question: 'How do you generate the malformed files — by hand, or as part of the suite?',
        answer:
          'Both, deliberately. A small fixture directory checked into the repo for the ones that must never change — the zero-byte file, the wrong-magic-bytes jpg, the truncated image — because those are the regression cases and I want them byte-identical every run. Generated at runtime for anything large or parameterised: the exactly-at-the-limit file, the one byte over, the extreme aspect ratio. Committing a 10 MB fixture to test a 10 MB limit punishes everyone who clones the repo.',
      },
      {
        question: 'The upload works locally and fails in CI. Where do you look first?',
        answer:
          'At the differences between the two environments, in order of likelihood: a body-size or timeout limit in the proxy or gateway that is not in front of my local server, missing credentials for the storage bucket, a slower connection making a timeout fire that never fires locally, and a fixture path that resolves differently in the CI working directory. I would get the server-side error rather than the browser-side one first — "it failed" from the client is almost never the useful half.',
      },
      {
        question: 'What would you assert about the resized output without comparing images pixel by pixel?',
        answer:
          'Properties rather than pixels: the dimensions match the target, the aspect ratio is preserved within a pixel, the byte size is under the budget, the format is what we said, EXIF is stripped, and the file actually decodes. If I need to catch visual regressions I would use a perceptual hash with a threshold rather than an exact comparison — an exact pixel comparison across encoder versions is a flake generator, and it fails without telling you what changed.',
      },
    ],
    modelAnswer: {
      open:
        'Which formats and what size limit, is it re-encoded server-side or stored as sent, and is the stored file public or behind authorisation? Those three change what I test most. I will assume JPEG and PNG, a few megabytes, resized on the server, and served publicly from a CDN.',
      walk:
        'Happy path first, and the assertion I care about is that the new picture appears everywhere the avatar is shown, not only on the settings page — a cached avatar elsewhere is the bug people actually report. Equivalence across formats, plus the file with the right extension and the wrong magic bytes. Boundaries on size: exactly the limit, one byte over, one byte, zero. Invalid input is unusually rich here because the file is attacker-controlled — a jpg that is really an archive, a truncated image, a decompression bomb. Then state: cancelling mid-upload leaving no orphan, and storage failing after the row is written, which is how you get a profile pointing at a file that does not exist. Security I would give real weight — served where it cannot execute, content type that cannot be sniffed, EXIF GPS stripped before it is public.',
      prioritise:
        'Three: the wrong-magic-bytes file, because accepting it is the difference between a photo and a payload; the size boundary at one byte over, because it is the single likeliest functional bug and it is instant; and storage-fails-after-the-row-is-written, because it corrupts data rather than just failing. The first two are service tests against the endpoint. The third I would test by injecting a failing storage client, which is only possible if the client is passed in — and if it is not, that is the change I would ask for.',
      close:
        'And every rejection logged with its reason, so "it will not let me upload" is diagnosable from the log instead of needing the customer to send us the file.',
    },
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
      {
        question: 'How do you test the out-of-order response case deterministically?',
        answer:
          'Control the responses rather than hoping for the race. Stub the transport, fire the request for "ca", then the request for "cat", then resolve them in the wrong order — "cat" first, then "ca" — and assert the list still shows the results for "cat". That is deterministic and takes milliseconds. Doing it against a real backend by making one call artificially slow is possible but it is a timing test pretending to be a logic test.',
      },
      {
        question: 'What is the assertion for “relevant”? Relevance is not a boolean.',
        answer:
          'It is not a pass/fail assertion, so I would not pretend it is one. I would hold a judged set of queries with their expected top results and measure precision at 5 or mean reciprocal rank across it, then assert the metric has not dropped below an agreed threshold rather than asserting any single result. Individual cases I would only pin where the business has said so — the brand name that must return that brand. Everything else is a metric with a guard rail, tracked over time.',
      },
      {
        question: 'Which of these can be a unit test on the client?',
        answer:
          'More than people expect: the debounce, the cancellation, the out-of-order guard, the empty-state rendering, escaping of suggestion text, and the keyboard interaction — arrows moving the active option, Escape closing. All of those are the client’s own logic and need no backend at all. What is left for an integration test is the query actually reaching the service and coming back in the agreed shape, plus latency, which is not a client concern.',
      },
    ],
    modelAnswer: {
      open:
        'How many suggestions and from where, is there a debounce and how long, and does Enter search what you typed or the highlighted suggestion? That last one decides a whole group of cases. I will assume ten suggestions, a 200 ms debounce, and Enter taking the highlight when there is one.',
      walk:
        'Happy path, then equivalence over match types — prefix, mid-word, misspelling, synonym — and I would ask which of those we claim to support, because testing a behaviour we never promised is noise. Boundaries: one character, the debounce interval on both sides, maximum query length, and zero results showing a real empty state. Hostile input matters more than it looks — a suggestion is rendered, so HTML in one is a stored-XSS sink. The dimension I would spend most time on is state and concurrency together: responses arriving out of order, where the slower earlier request overwrites the newer one. That is the classic typeahead bug and it looks like flakiness rather than a bug, which is why it survives. Then scale — the per-keystroke latency budget, and how many requests a twenty-character query actually generates.',
      prioritise:
        'Three: the out-of-order guard, because it is the defining bug of this feature and it is a fast client-side unit test; escaping in the suggestion list, because it is a security issue with a one-line regression; and the service-is-down case, because the box must still let you submit a plain search — degrading to useless is worse than degrading to plain. None of these needs a browser journey.',
      close:
        'And I would record the queries that return nothing. Those are the highest-value signal the search team gets, and they are invisible unless somebody deliberately logs them.',
    },
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
      {
        question: 'Which of these belong in a contract test rather than an end-to-end one?',
        answer:
          'The shape, not the behaviour. That the create response carries a code field of the documented type, that the error body has a code and a message, that the redirect status is the one we published — those are contract, verified from both sides without deploying either against the other. Whether the code actually resolves to the right URL is behaviour and belongs in a service test. The distinction matters because a contract test fails with "the field is gone" and an end-to-end test fails with "something went wrong", and the first one is worth ten of the second at 3am.',
      },
      {
        question: 'How would you load-test the resolve path without generating real traffic to real sites?',
        answer:
          'Point the codes at a host we control, or assert on the 302 without following it — the load test cares about our lookup and our response time, not about the destination. Then shape the traffic like production rather than uniformly: mostly reads, a long tail of codes, and one hot key taking a large share, because a uniform load test will miss a caching problem that real traffic finds immediately. And I would run it against something production-shaped, since a benchmark on an empty table measures nothing.',
      },
      {
        question: 'A code resolves correctly in staging and 404s in production. Where do you look?',
        answer:
          'First: does the row exist in production, or is this a data problem rather than a code problem? If it exists, then a CDN or cache in front of production that staging does not have, serving a cached 404 from before the code was created — negative caching is the usual culprit. After that, environment config pointing at a different datastore, and a code-generation difference like case sensitivity that only bites where the two environments differ. I would find out by querying production directly and comparing what the edge returns against what the origin returns.',
      },
    ],
    modelAnswer: {
      open:
        'Is the same long URL always the same code, or a new one each time? Are there custom aliases, expiry, deletion? And is creating authenticated or open to anyone? That last one changes the whole security section, because an open shortener is abused within hours. I will assume a new code each time, optional custom aliases, and authenticated creation.',
      walk:
        'This one splits cleanly in two, and I would say so: create and resolve are different endpoints with different risk profiles. On create — happy path, equivalence across URL kinds including ports, fragments and unicode, the length boundary, and rejection of javascript:, data: and internal addresses like 169.254.169.254, because that last one turns the service into a way to read cloud metadata. On resolve — an unknown code returns 404 rather than redirecting to the home page, expiry at and either side of the TTL, and behaviour behind a CDN cache. Concurrency I would name explicitly: two requests racing for the same custom alias, and the generator never issuing one code to two callers. Then scale, and I would point out the asymmetry — resolve is the path that must be fast, because it carries almost all of the traffic.',
      prioritise:
        'Three: the internal-address and javascript: rejection, because that is a vulnerability rather than a bug; the custom-alias race, because it silently gives two people the same link; and resolve latency at p99 under read-heavy load, because that is the only performance number that matters here. First two are service tests, the third is a load test on its own schedule, not in the pull-request pipeline.',
      close:
        'And the resolve path should record the code and referrer without recording the whole request — enough to see a link being abused, not enough to become a privacy problem of its own.',
    },
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
      {
        question: 'A record was created between page 1 and page 2. What does the client see, and is that a bug?',
        answer:
          'With offset pagination and a newest-first sort, the new record lands on page 1 and pushes everything down by one — so the record that was last on page 1 is now first on page 2 and the client sees it twice. Delete instead of create and the client misses one entirely. Whether it is a bug depends on what we promised: for an activity feed, duplicates are tolerable and skips are not; for anything being reconciled or exported, both are unacceptable and the answer is a cursor over a stable sort key. What is definitely a bug is not having decided.',
      },
      {
        question: 'How would you write the deep-offset performance test so it fails loudly rather than slowly?',
        answer:
          'Assert on a threshold rather than eyeballing a duration, and seed enough data for the problem to exist — a hundred rows will never show it. Then measure the deep page specifically, not an average across pages, and fail the test if p99 for the last page exceeds the budget. Better still, assert on the query plan or the rows-examined count where the datastore exposes it, because that fails deterministically on a slow CI machine where a wall-clock threshold turns into a flake.',
      },
      {
        question: 'Which of these survive as a contract test when the team adds a field?',
        answer:
          'The ones that assert on what we need rather than on the whole body. Asserting the response has an items array of objects each carrying an id and a total or a next cursor survives a new field being added; asserting the body deep-equals a fixture breaks on every addition and trains everybody to update fixtures without reading them. So: assert the fields you consume and their types, assert unknown fields are ignored by the client, and let everything else change.',
      },
    ],
    modelAnswer: {
      open:
        'Offset or cursor? What are the default and maximum page sizes? And is the sort stable when two records share a sort key? I ask that last one because an unstable sort makes pagination non-deterministic no matter how the paging works. I will assume offset, a default of 20, a maximum of 100, and newest-first.',
      walk:
        'Happy path, then equivalence by data volume — a user with none, with fewer than a page, with exactly one page, with several. Boundaries carry most of the value here: size of 1, the default, the maximum, the maximum plus one, page 0, page −1, the page after the last, and the last page both partially full and exactly full. That exactly-full case is the off-by-one that hides the "next" link, and it is missed constantly. Invalid input includes page as a float, a huge integer, or an array. But the case I would lead with is the state one — a record created between page 1 and page 2 causing a client to see something twice or miss it entirely. That is the defining bug of offset pagination and the reason cursors exist. Then scale, because deep offsets get slower with depth and cursors do not, and authorisation, because a cursor encoding a raw primary key can be decremented into somebody else’s data.',
      prioritise:
        'Three: authorisation across users, because it is the most serious and the fastest to write; the exactly-full last page, because it is the likeliest functional bug; and deep-offset latency with a real volume of seeded data, because it is invisible until it is a production incident. The first two are service tests, the third is a seeded performance test asserting a threshold rather than a stopwatch reading.',
      close:
        'And the p99 should be measured at the deep pages where it is bad, not averaged across all pages, which is how this problem stays hidden on a dashboard that looks healthy.',
    },
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
      {
        question: 'How do you assert on the email without a human reading an inbox?',
        answer:
          'A catch-all mailbox the test can query over an API — a local SMTP sink in CI, or a disposable-inbox service against a staging domain. The test triggers the reset, polls the sink for a message to that address, and pulls the link out of the body. That also lets me assert on the content: that it is addressed correctly, that it does not contain the password, that the link points at our domain. Reading it by hand is not a test, it is a demonstration.',
      },
      {
        question: 'Corporate mail scanners prefetch links. What does that do to your single-use token?',
        answer:
          'It burns it. The scanner fetches the URL before the user ever clicks, the token is consumed, and the customer gets "this link has expired" on their first click — and it will be reported as flaky rather than as a bug, because it depends on whose mail server they use. The fix is that a GET must not consume the token: the link opens a form, and the token is spent on the POST that actually sets the password. That is worth a test asserting the token still works after the URL has been fetched once.',
      },
      {
        question: 'Which parts of this can you test without sending a real email at all?',
        answer:
          'Nearly all of it. Token generation, length and randomness, single use, expiry either side of the TTL, what a second request does to the first token, whether other sessions are invalidated, the identical response for registered and unregistered addresses, and the rate limit — all of those are service tests against the endpoints, with the token taken from a test-only hook rather than from a message. What genuinely needs mail is delivery itself and how the message renders, and that is one test, not a suite.',
      },
    ],
    modelAnswer: {
      open:
        'How long is the token good for and is it single use? Does resetting sign out other sessions? And what happens for an account that signed up with SSO and has no password to reset? I will assume an hour, single use, other sessions invalidated, and SSO accounts told they have no password rather than silently succeeding.',
      walk:
        'The thing I want to say first is that this is not one feature, it is a flow across two channels, and the bugs live in the seams. Happy path end to end, then equivalence by account type including the SSO case. Boundaries on the token: a minute before expiry, exactly at, a minute after. Invalid input is where I would spend time — a token altered by one character, a token belonging to another account, a token already used, and the same link opened twice, which must fail the second time. State: what a second reset request does to the first link, whether the earlier lockout is cleared, whether other sessions die. Security has two cases I would not leave out — the response must be identical for a registered and an unregistered address, or the form tells attackers which addresses exist, and repeated requests must not turn the feature into an email bomb aimed at a customer.',
      prioritise:
        'Three: single use actually being single use, because a reusable reset link is an account takeover; the identical response for unknown addresses, because it is an enumeration hole and a one-line regression; and rate limiting per address, because the abuse case here is aimed at a customer rather than at us. All three are service tests with the token pulled from a test hook — none of them needs an inbox.',
      close:
        'And I would count requests and completions separately, because the gap between them is where this feature fails silently — people asking for a reset and never finishing one is what a broken link looks like on a dashboard.',
    },
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
      {
        question: 'You have one building and one week. What do you actually test, and what do you simulate?',
        answer:
          'On the real building: everything physical and everything safety-critical, because those cannot be simulated honestly — door obstruction, the overload sensor, power loss mid-travel, fire-service mode, the emergency phone, and the accessibility timings. In simulation: dispatch policy, queueing, morning-peak behaviour and anything needing thousands of repetitions, because a week is not enough trips to see a scheduling bug. The split is not about difficulty — it is that the simulator is a model, and the failures I would never ship are exactly the ones where trusting a model is the risk.',
      },
      {
        question: 'How would you test the dispatch algorithm without an elevator?',
        answer:
          'It is a state machine over a queue, so it is a unit test. Feed it a sequence of calls with timestamps and assert the order it serves them, that it serves in travel order rather than press order, that no call is dropped, and that no call waits forever under continuous new requests — starvation is the interesting property. Then run randomised traffic against it and assert invariants rather than exact outcomes: every call eventually served, never two cars to one call, never travel past a requested floor without stopping.',
      },
      {
        question: 'What is the single failure you would never ship without covering?',
        answer:
          'The doors opening when the car is not at a floor. Everything else on my list is an inconvenience or a cost; that one kills someone. After that, the overload sensor and the door-obstruction sensor failing on rather than off, because a sensor that always reports clear is worse than one that always reports blocked — the failure has to be safe by default, and that is a test I would want run on the real hardware every release.',
      },
    ],
    modelAnswer: {
      open:
        'How many cars and how many floors, is there a basement or an express floor, what is the weight limit, and is there fire-service mode or are any floors key-locked? And I would ask who the customer is — the riders care about wait time, the building owner cares about throughput and downtime, and those pull the tests in different directions.',
      walk:
        'I would say up front that this is a safety-critical system, so I am going to weight failure and misuse far more heavily than I would for a web form. Happy path: a call from floor 3 going up brings a car and opens the doors there. Equivalence across call types — inside, outside, while moving, for the floor you are already on. Boundaries: the top and bottom floors, where "up" from the top is not a meaningful request, and the weight limit at, under and over. Misuse: every button at once, a button held, a locked floor, and the door sensor obstructed continuously. State is where the real correctness bug lives — requests must be served in travel order, not press order; a lift that goes 8, then 2, then 7 is functionally wrong even though every call gets served. Concurrency is two cars answering one call. Then scale, which here is morning peak, and accessibility, which is a requirement rather than a nicety — audible announcements, braille, and a door-hold long enough for a wheelchair or a stroller.',
      prioritise:
        'The three I would never ship without: doors cannot open when the car is not at a floor; the overload sensor and the door sensor must fail safe rather than fail clear; and the dispatch queue must not starve a call under continuous new requests. The first two are hardware-in-the-loop tests on the real installation. The third is a unit test against the scheduler, because it is a state machine over a queue and needs no elevator at all.',
      close:
        'And I would ask what it logs — faults, door cycles, overload events. Without that, nobody notices the third car has been slow for a week until somebody complains, and by then you have no data about when it started.',
    },
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
