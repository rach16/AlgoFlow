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

/**
 * What kind of thing you are being asked to test.
 *
 * Loops pull from all five, but not evenly, and not for the same role: an API-platform team asks
 * about endpoints and a consumer team asks about interfaces. Grouping means "drill the API set
 * before Thursday" is one click rather than reading every title.
 */
export type ExerciseCategory = 'ui' | 'api' | 'flow' | 'data' | 'physical';

export interface CategoryMeta {
  id: ExerciseCategory;
  label: string;
  blurb: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'ui',
    label: 'Interface',
    blurb:
      'A single feature on a screen. Accessibility and environment carry real weight here and are the dimensions candidates skip.',
  },
  {
    id: 'api',
    label: 'API',
    blurb:
      'One endpoint, its contract and its failure modes. Concurrency and authorisation are where these are won.',
  },
  {
    id: 'flow',
    label: 'Flow',
    blurb:
      'Several steps, often several channels or several days. The bugs live in the seams between the steps, not in any one step.',
  },
  {
    id: 'data',
    label: 'Data & jobs',
    blurb:
      'Batches, syncs, fan-outs and schedules. Partial failure is the normal case rather than the exception.',
  },
  {
    id: 'physical',
    label: 'Physical',
    blurb:
      'No code and no browser. Asked precisely because you cannot fall back on web knowledge — it is pure enumeration.',
  },
];

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
  category: ExerciseCategory;
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
    category: 'ui',
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
    category: 'ui',
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
    category: 'ui',
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
    category: 'ui',
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
    category: 'api',
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
    category: 'api',
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
    category: 'flow',
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
    category: 'physical',
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

  {
    id: 'autosave',
    category: 'ui',
    title: 'Autosave in an editor',
    prompt:
      'A document editor saves the user’s work automatically as they type. There is no Save button. Test it.',
    clarifiers: [
      'How often does it save — on an interval, on idle, or on every change?',
      'What does the user see: a “saved” indicator, a timestamp, nothing?',
      'Is there version history, or does a save overwrite?',
      'Can the same document be open in two places at once?',
    ],
    followUps: [
      {
        question: 'How would you test that no keystroke is ever lost, without typing by hand?',
        answer:
          'Drive it programmatically and reconcile: generate a known sequence of edits, apply them at a rate faster than the save interval, then assert the persisted document equals the expected result of applying that sequence. The assertion is on the reconstructed document, not on the number of save calls — how many requests it took is an implementation detail, and asserting on it makes the test break every time the debounce is tuned.',
      },
      {
        question: 'The “Saved” indicator says saved, but the server 500ed. How do you catch that?',
        answer:
          'By asserting the indicator is driven by the response rather than by the request. The test stubs the save endpoint to fail, types, and asserts the UI says something honest — retrying, or unsaved — and never says saved. This is worth a dedicated test because it is a lie the user acts on: they close the tab because the app told them it was safe.',
      },
      {
        question: 'Two tabs have the same document open. What is the correct behaviour, and how do you test it?',
        answer:
          'First insist the product decides, because both answers are defensible: last-write-wins, or detect and warn. Then test the decision. For last-write-wins I would assert the later save wins deterministically and the other tab is told it is stale. For conflict detection I would assert the second save is rejected with a version mismatch rather than silently overwriting. What I would not accept is undefined behaviour, because that is data loss that nobody can reproduce.',
      },
    ],
    modelAnswer: {
      open:
        'What triggers a save — an interval, idle, or every change? What does the user see when it works and when it fails? And can the same document be open twice at once? I will assume a debounce on idle, a “saved” indicator with a timestamp, and yes, two tabs are possible.',
      walk:
        'The framing I would start with is that autosave has no explicit user action, so every failure is silent by default — which moves the weight of this onto state and failure rather than onto happy path. Happy path is that typing then stopping persists, and a reload shows the text. Boundaries: an empty document, a very large one, and the debounce interval on both sides. State is the bulk of it — no keystroke lost when typing faster than the save interval, the save that is in flight when the tab closes, and a reload mid-edit. Failure is the dimension I would spend most time on: the server 500s and the indicator must not say saved; the connection drops and edits must queue rather than vanish. Concurrency is two tabs on one document. And I would name the security case, which is that the autosave endpoint is a write endpoint and needs the same authorisation as any other.',
      prioritise:
        'Three: nothing lost when typing faster than the save interval, because that is the core promise; the indicator never claiming saved on a failed request, because it is a lie the user acts on by closing the tab; and the in-flight save when the tab closes, because it is the most common real report. The first two are component tests with a stubbed transport, which makes them fast and deterministic. The third genuinely needs a browser, because it depends on the unload behaviour.',
      close:
        'And I would want the save failure rate tracked as its own metric with an alert, because with no Save button nobody complains until they have already lost a document — the support ticket arrives long after the telemetry could have.',
    },
    expected: [
      { id: 'as-happy-1', dimension: 'happy', tier: 'must', text: 'Type, stop, reload — the text is there, and the indicator showed the transition from saving to saved.' },
      { id: 'as-eq-1', dimension: 'equivalence', tier: 'must', text: 'A text edit, a formatting change, an image paste and a deletion each trigger a save the same way.' },
      { id: 'as-bound-1', dimension: 'boundary', tier: 'must', text: 'An empty document, a single character, and a document at whatever size limit exists.' },
      { id: 'as-bound-2', dimension: 'boundary', tier: 'credit', text: 'Typing that stops exactly at the debounce interval, and typing that never pauses long enough to trigger one.' },
      { id: 'as-neg-1', dimension: 'negative', tier: 'must', text: 'Content that is hostile to the serialiser: script tags, unmatched markup, a null byte, 10,000 emoji.' },
      { id: 'as-neg-2', dimension: 'negative', tier: 'credit', text: 'A paste larger than the request limit — rejected clearly rather than failing every subsequent save.' },
      { id: 'as-state-1', dimension: 'state', tier: 'must', text: 'Typing faster than the save interval loses nothing: the persisted document equals every edit applied in order.' },
      { id: 'as-state-2', dimension: 'state', tier: 'must', text: 'Closing the tab with a save in flight — the edit survives, or the user is warned, but it does not silently vanish.' },
      { id: 'as-state-3', dimension: 'state', tier: 'must', text: 'Reloading mid-edit restores the last saved state and does not resurrect older content.' },
      { id: 'as-state-4', dimension: 'state', tier: 'credit', text: 'Undo after an autosave still works, and does not undo past the point the document was opened.' },
      { id: 'as-conc-1', dimension: 'concurrency', tier: 'must', text: 'The same document open in two tabs: one wins deterministically and the other is told it is stale.' },
      { id: 'as-conc-2', dimension: 'concurrency', tier: 'credit', text: 'Two saves in flight at once cannot land out of order and persist the older one.' },
      { id: 'as-fail-1', dimension: 'failure', tier: 'must', text: 'The save endpoint 500s and the indicator never says “saved” — it says retrying, or unsaved.' },
      { id: 'as-fail-2', dimension: 'failure', tier: 'must', text: 'The connection drops: edits queue and flush on reconnect rather than being discarded.' },
      { id: 'as-fail-3', dimension: 'failure', tier: 'credit', text: 'Repeated failures back off rather than retrying every 200 ms and burying the server.' },
      { id: 'as-scale-1', dimension: 'scale', tier: 'credit', text: 'A long document where each save sends the whole body — the request size and the typing latency at 50 pages.' },
      { id: 'as-sec-1', dimension: 'security', tier: 'must', text: 'The autosave endpoint is a write: it authorises the document id rather than trusting whatever the client sends.' },
      { id: 'as-compat-1', dimension: 'compat', tier: 'must', text: 'The indicator is announced to a screen reader, since a silent visual change is the only feedback the feature has.' },
      { id: 'as-compat-2', dimension: 'compat', tier: 'credit', text: 'IME composition: a save firing mid-composition must not persist a half-composed character.' },
      { id: 'as-obs-1', dimension: 'observability', tier: 'must', text: 'The save failure rate is its own metric with an alert — nobody reports this until their work is already gone.' },
    ],
  },

  {
    id: 'datepicker',
    category: 'ui',
    title: 'A date picker',
    prompt:
      'A date picker on a booking form. The user picks a date and a time. Test it.',
    clarifiers: [
      'Whose timezone is the displayed time in — the user’s, the venue’s, or UTC?',
      'Is there a range, a minimum notice period, or blackout dates?',
      'Can the user type a date as well as pick one, and in which format?',
      'Is the stored value a timestamp or a local date and time plus a zone?',
    ],
    followUps: [
      {
        question: 'How do you test the daylight-saving cases without waiting for October?',
        answer:
          'Inject the clock and the timezone rather than depending on the machine. The test sets the zone to one that observes DST, sets now to the day before the transition, and asserts the booking an hour after the change lands where it should. Both directions matter: the hour that happens twice, and the hour that never exists — booking 02:30 on a spring-forward morning has to fail or be adjusted deliberately, not throw.',
      },
      {
        question: 'The picker works for you and a user in Auckland says it is off by a day. Where do you look?',
        answer:
          'At the boundary between date and timestamp. Almost always the code takes a local date, converts it to UTC at midnight, and a zone far from UTC crosses a day boundary in the process — so a booking on the 5th is stored as the 4th. I would check what is actually persisted for their booking, then work backwards. The test that catches it is one that runs the whole flow in a zone deliberately far from the server’s, which is why zone should be a test parameter rather than an environment default.',
      },
      {
        question: 'Which of these belong in a unit test rather than a browser test?',
        answer:
          'All the date arithmetic: DST transitions, leap days, the min-notice rule, the range validation, formatting per locale. Those are pure functions of a date, a zone and a clock, and they run in milliseconds — which matters because there are dozens of them. The browser test is that the calendar renders, the keyboard reaches it, and the picked value reaches the form. Testing leap years by clicking a calendar is slow and covers less.',
      },
    ],
    modelAnswer: {
      open:
        'The question I would ask first is whose timezone the displayed time is in — the user’s, the venue’s, or UTC — because almost every bug in this feature comes from that being unclear. Then: is there a minimum notice or blackout dates, can the user type as well as pick, and is the stored value a timestamp or a local date plus a zone?',
      walk:
        'I would say up front that a date picker looks like a UI question and is really a data question, so I will spend most of the time on time arithmetic. Happy path: pick a date and time, and the confirmation shows the same instant the user believed they picked. Equivalence: picking versus typing, and each accepted input format. Boundaries carry unusual weight — today versus tomorrow against a minimum notice rule, the first and last selectable date, month and year rollovers, 29 February, and the end of a month with 30 days. Then the two transitions that break everything: the hour that happens twice in autumn and the hour that does not exist in spring. Invalid input is typing 31 April, or a date in a format the parser guesses at — 03/04 is two different days depending on locale. State: changing the date after picking a time, and whether the time survives. And accessibility, because a calendar grid that only works with a mouse excludes people outright.',
      prioritise:
        'Three: the spring-forward hour that does not exist, because it either throws or silently books the wrong time; a booking made in a zone far from the server’s crossing a day boundary, because that is the “off by one day” report that reaches support; and keyboard reachability of the calendar, because it is a legal requirement and it is usually broken. The first two are unit tests over an injected clock and zone. Only the third needs a browser.',
      close:
        'And I would log the timezone the booking was made in alongside the timestamp, because without it every report of “the time is wrong” is unreproducible — you cannot tell whether the bug is in storage, in display, or in the customer’s expectation.',
    },
    expected: [
      { id: 'dp-happy-1', dimension: 'happy', tier: 'must', text: 'Picking a date and time produces a confirmation showing the same instant the user believed they picked.' },
      { id: 'dp-eq-1', dimension: 'equivalence', tier: 'must', text: 'Typing a date and picking one from the calendar produce identical stored values.' },
      { id: 'dp-eq-2', dimension: 'equivalence', tier: 'credit', text: 'Each accepted input format, and a rejection for one that is ambiguous rather than a guess.' },
      { id: 'dp-bound-1', dimension: 'boundary', tier: 'must', text: 'Today versus tomorrow against a minimum-notice rule, and the first and last selectable dates.' },
      { id: 'dp-bound-2', dimension: 'boundary', tier: 'must', text: 'Month and year rollovers: 31 December to 1 January, and the end of a 30-day month.' },
      { id: 'dp-bound-3', dimension: 'boundary', tier: 'must', text: '29 February in a leap year, and 29 February in a year that has none.' },
      { id: 'dp-bound-4', dimension: 'boundary', tier: 'must', text: 'The hour that happens twice on a clocks-back morning, and the hour that never exists on a clocks-forward one.' },
      { id: 'dp-neg-1', dimension: 'negative', tier: 'must', text: 'Typed dates that cannot exist — 31 April, 32 January, the year 0 — rejected rather than silently rolled forward.' },
      { id: 'dp-neg-2', dimension: 'negative', tier: 'credit', text: 'A blackout date reachable by typing even though the calendar greys it out.' },
      { id: 'dp-state-1', dimension: 'state', tier: 'must', text: 'Changing the date after choosing a time: the time is kept, or cleared, but deliberately either way.' },
      { id: 'dp-state-2', dimension: 'state', tier: 'credit', text: 'Reopening the picker shows the current selection rather than resetting to today.' },
      { id: 'dp-conc-1', dimension: 'concurrency', tier: 'credit', text: 'Two people booking the last slot at the same instant — one wins and the other is told, before payment.' },
      { id: 'dp-fail-1', dimension: 'failure', tier: 'credit', text: 'The availability service is slow: the calendar does not show every date as bookable while it waits.' },
      { id: 'dp-scale-1', dimension: 'scale', tier: 'credit', text: 'A venue with a year of availability loaded at once, versus fetching per month as the user navigates.' },
      { id: 'dp-sec-1', dimension: 'security', tier: 'must', text: 'A blacked-out or past date submitted directly in the request is rejected server-side, not only in the calendar.' },
      { id: 'dp-compat-1', dimension: 'compat', tier: 'must', text: 'Full keyboard operation of the calendar grid, with the focused date announced — a mouse-only calendar excludes people.' },
      { id: 'dp-compat-2', dimension: 'compat', tier: 'must', text: 'A user in a zone far from the server’s: the stored date must not shift by a day.' },
      { id: 'dp-compat-3', dimension: 'compat', tier: 'credit', text: 'Locales where the week starts on a different day, and formats where 03/04 means a different date.' },
      { id: 'dp-obs-1', dimension: 'observability', tier: 'credit', text: 'The booking records the timezone it was made in, or every “the time is wrong” report is unreproducible.' },
    ],
  },

  {
    id: 'ratelimit',
    category: 'api',
    title: 'A rate limiter',
    prompt:
      'An API allows 100 requests per minute per API key. Design the tests for the limiter.',
    clarifiers: [
      'Fixed window, sliding window, or token bucket? The boundary cases differ for each.',
      'Limited per key, per IP, per endpoint, or some combination?',
      'What does a limited request return — 429 with a Retry-After, or something else?',
      'Is the counter shared across servers, or does each instance count on its own?',
    ],
    followUps: [
      {
        question: 'It is a fixed window. What is the case you would insist on testing?',
        answer:
          'The window edge, because a fixed window allows double the limit across it: 100 requests at 11:59:59 and another 100 at 12:00:00 is 200 in one second, all within policy. I would write that test explicitly and show the number, because it usually reads as a bug to whoever specified it, and the conversation it starts — move to a sliding window, or accept the burst — is more valuable than the test itself.',
      },
      {
        question: 'The counter is per instance and there are ten servers. What is the real limit?',
        answer:
          'Ten times the intended one, in the worst case, because each instance lets 100 through independently. Whether that matters depends on why the limit exists: if it protects a downstream database, the real limit is what matters and the policy is a fiction. I would test the actual enforced limit across the fleet rather than against a single instance, since a single-instance test passes while production allows ten times the traffic.',
      },
      {
        question: 'How do you test this without making 100 real requests in every test?',
        answer:
          'Make the limit and the clock injectable. Set the limit to 3 for the test, advance the clock rather than sleeping, and the whole boundary suite runs in milliseconds. If the limit is a hard-coded constant, that is the change I would ask for first — otherwise every test either takes a minute of wall-clock or quietly tests something other than the boundary.',
      },
    ],
    modelAnswer: {
      open:
        'Which algorithm — fixed window, sliding window, or token bucket? They fail differently at the edges, so the answer changes. And is the counter shared across instances or per instance, is the limit per key or per IP, and what does a rejected request return? I will assume a fixed window, per key, shared, returning 429 with Retry-After.',
      walk:
        'This is a boundary and concurrency problem more than anything else, so I would say that and structure around it. Happy path: 99 requests succeed and the 100th does too. Boundaries are the substance — the 100th succeeds, the 101st gets a 429, and the counter resets when the window rolls. And with a fixed window I would name the edge explicitly: 100 requests at the end of one window and 100 at the start of the next is 200 in barely any time at all, entirely within policy. Concurrency: 100 simultaneous requests must allow exactly 100, not 103 because of a read-modify-write race on the counter. Failure: if the counter store is down, does the limiter fail open and let everything through, or fail closed and reject everyone? Both are defensible and the choice must be deliberate, because failing open under an attack is how the limiter disappears exactly when it is needed. Then the response shape, which is part of the contract: 429, Retry-After, and headers that let a well-behaved client back off.',
      prioritise:
        'Three: the exact boundary at limit and limit-plus-one; the concurrent burst, because a race in the counter is the bug that makes the limit approximate; and the datastore-down behaviour, because it decides what happens during the incident the limiter exists for. All three are service tests with the limit set low and the clock injected — testing a limit of 100 by making 100 real requests is slow and no more convincing than testing a limit of 3.',
      close:
        'And I would want the rejection rate visible per key, because a customer suddenly hitting the limit is either an integration bug on their side or an attack, and both need someone to notice quickly.',
    },
    expected: [
      { id: 'rl-happy-1', dimension: 'happy', tier: 'must', text: 'Requests under the limit succeed, and the response carries the remaining-quota headers the contract promises.' },
      { id: 'rl-eq-1', dimension: 'equivalence', tier: 'must', text: 'Two different keys have independent budgets — one exhausting its quota does not limit the other.' },
      { id: 'rl-eq-2', dimension: 'equivalence', tier: 'credit', text: 'Requests that fail for other reasons — 404, 500 — count or do not count against the quota, deliberately.' },
      { id: 'rl-bound-1', dimension: 'boundary', tier: 'must', text: 'Request 99, 100 and 101: the 100th succeeds and the 101st is rejected.' },
      { id: 'rl-bound-2', dimension: 'boundary', tier: 'must', text: 'The counter resets when the window rolls: rejected at 101, allowed again one tick into the next window.' },
      { id: 'rl-bound-3', dimension: 'boundary', tier: 'must', text: 'The fixed-window edge — 100 at the end of one window and 100 at the start of the next is 200 in a second, within policy.' },
      { id: 'rl-neg-1', dimension: 'negative', tier: 'must', text: 'A missing, malformed or revoked key — limited, rejected outright, and never treated as one shared anonymous bucket by accident.' },
      { id: 'rl-neg-2', dimension: 'negative', tier: 'credit', text: 'A client that ignores Retry-After and hammers: it stays limited rather than resetting the window by trying.' },
      { id: 'rl-state-1', dimension: 'state', tier: 'must', text: 'Quota is consumed by request count, not by response status — a retry of a failed call still costs one.' },
      { id: 'rl-state-2', dimension: 'state', tier: 'credit', text: 'A key upgraded to a higher tier mid-window: the new limit applies without wiping usage or granting a free window.' },
      { id: 'rl-conc-1', dimension: 'concurrency', tier: 'must', text: '100 simultaneous requests allow exactly 100 — a read-modify-write race lets 103 through.' },
      { id: 'rl-conc-2', dimension: 'concurrency', tier: 'credit', text: 'The same key hitting several instances at once still totals to one shared budget.' },
      { id: 'rl-fail-1', dimension: 'failure', tier: 'must', text: 'The counter store is unavailable: fail open or fail closed, but deliberately — failing open loses the limiter during an attack.' },
      { id: 'rl-fail-2', dimension: 'failure', tier: 'credit', text: 'Counter-store latency does not add itself to every request’s response time.' },
      { id: 'rl-scale-1', dimension: 'scale', tier: 'must', text: 'The limiter’s own cost per request, since it runs on every call and is pure overhead.' },
      { id: 'rl-scale-2', dimension: 'scale', tier: 'credit', text: 'Memory when a million distinct keys each hold a counter, and how those counters are ever evicted.' },
      { id: 'rl-sec-1', dimension: 'security', tier: 'must', text: 'The limit cannot be bypassed with a forged header — an X-Forwarded-For trusted blindly is a bypass.' },
      { id: 'rl-sec-2', dimension: 'security', tier: 'credit', text: 'Limiting per IP alone punishes everyone behind one NAT and stops nobody with a botnet.' },
      { id: 'rl-obs-1', dimension: 'observability', tier: 'must', text: 'The 429 rate is visible per key — a customer newly hitting it is either an integration bug or an attack.' },
    ],
  },

  {
    id: 'webhook',
    category: 'api',
    title: 'A webhook receiver',
    prompt:
      'We receive webhooks from a payment provider telling us an order was paid. Design the tests for our receiving endpoint.',
    clarifiers: [
      'How is the payload signed, and do we verify it?',
      'What does the provider do when we do not respond in time — retry, and how many times?',
      'Are events ordered, and do they carry a sequence number or a timestamp?',
      'Is processing synchronous in the request, or queued?',
    ],
    followUps: [
      {
        question: 'The provider retries on any non-2xx. What does that mean for your error handling?',
        answer:
          'That the status code is a control signal, not just information. A payload we can never process — a malformed body, an unknown event type — must return 2xx and be recorded, or the provider retries it forever. A transient failure like our database being down must return non-2xx so the retry actually helps. Getting these the wrong way round produces either an infinite retry loop or a silently dropped payment, and both are worth an explicit test.',
      },
      {
        question: 'How do you test that processing is idempotent?',
        answer:
          'Send the identical event twice and assert the side effects happened once — one order marked paid, one confirmation email, one ledger entry. Then send it twice concurrently, because the sequential case usually passes on a naive check-then-write while the concurrent one does not. The assertion is on the effects, not on the handler returning early, since the handler can return early and still have written twice.',
      },
      {
        question: 'Events can arrive out of order. Which case do you write first?',
        answer:
          'Refund arriving before the payment it refunds. It is the case that produces the worst outcome — an order that reads as paid when it has been refunded — and it is realistic, because retries reorder events by construction. The general fix is to order by the provider’s sequence or timestamp rather than by arrival, and to reject an event older than the state we already hold. I would test both the reordering and the stale-event rejection.',
      },
    ],
    modelAnswer: {
      open:
        'Four things: how is the payload signed and do we verify it; what does the provider do when we are slow or return an error; do events carry a sequence number or only a timestamp; and do we process inside the request or queue it? I will assume an HMAC signature, retries with backoff on any non-2xx, timestamps but no sequence, and queued processing.',
      walk:
        'The framing I would open with is that we do not control the caller, so every dimension that is usually about a well-behaved client becomes adversarial here. Happy path: a valid signed event marks the order paid. Equivalence over event types, including one we do not know about. Invalid input is heavy — a bad signature, a replayed body, a payload for an order that does not exist, malformed JSON — and every one has to produce the right status code, because the status code decides whether the provider retries. State and idempotency are the core: the same event twice must have its effects once, and a refund arriving before its payment must not leave the order reading as paid. Concurrency is the same event delivered twice at once, which is where a naive check-then-write fails. Failure: our database is down and we must return a non-2xx so the retry helps, versus a payload we can never process, which must return 2xx or be retried forever. Security is signature verification, replay windows and the endpoint being public by definition.',
      prioritise:
        'Three: signature verification rejecting a forged payload, because without it anyone can mark any order paid; idempotency under concurrent duplicate delivery, because duplicates are guaranteed by the retry policy; and returning the right status code for a permanent failure versus a transient one, because getting that backwards yields either an infinite retry loop or a lost payment. All three are service tests posting crafted bodies at the endpoint — no provider needed.',
      close:
        'And I would want every received event recorded raw with its signature result and outcome, because when the provider says they sent it and we say we did not get it, that log is the only thing that settles the argument.',
    },
    expected: [
      { id: 'wh-happy-1', dimension: 'happy', tier: 'must', text: 'A valid signed payment event marks the order paid and returns 2xx quickly.' },
      { id: 'wh-eq-1', dimension: 'equivalence', tier: 'must', text: 'Each event type we handle, plus one we do not recognise — acknowledged and recorded, not 500.' },
      { id: 'wh-bound-1', dimension: 'boundary', tier: 'must', text: 'An event at the edge of the accepted timestamp window, and one outside it.' },
      { id: 'wh-bound-2', dimension: 'boundary', tier: 'credit', text: 'A payload at the maximum size the provider can send, and an empty body.' },
      { id: 'wh-neg-1', dimension: 'negative', tier: 'must', text: 'An invalid signature, a missing signature, and a valid signature over a modified body — all rejected.' },
      { id: 'wh-neg-2', dimension: 'negative', tier: 'must', text: 'Malformed JSON and a payload referencing an order that does not exist — handled, with the correct status.' },
      { id: 'wh-state-1', dimension: 'state', tier: 'must', text: 'The same event delivered twice has its effects once: one order paid, one email, one ledger entry.' },
      { id: 'wh-state-2', dimension: 'state', tier: 'must', text: 'A refund arriving before the payment it refunds does not leave the order reading as paid.' },
      { id: 'wh-state-3', dimension: 'state', tier: 'credit', text: 'An event older than the state we already hold is rejected rather than reverting it.' },
      { id: 'wh-conc-1', dimension: 'concurrency', tier: 'must', text: 'The same event delivered twice simultaneously — the sequential case passes where the concurrent one exposes check-then-write.' },
      { id: 'wh-fail-1', dimension: 'failure', tier: 'must', text: 'Our datastore is down: return non-2xx so the provider’s retry is useful, rather than swallowing the event.' },
      { id: 'wh-fail-2', dimension: 'failure', tier: 'must', text: 'A permanently unprocessable payload returns 2xx and is recorded, or the provider retries it forever.' },
      { id: 'wh-fail-3', dimension: 'failure', tier: 'credit', text: 'Processing that exceeds the provider’s timeout: acknowledge first, work afterwards.' },
      { id: 'wh-scale-1', dimension: 'scale', tier: 'must', text: 'A retry storm after an outage — thousands of queued events arriving at once when we come back.' },
      { id: 'wh-scale-2', dimension: 'scale', tier: 'credit', text: 'Response time under load, since being slow is what triggers more retries and makes it worse.' },
      { id: 'wh-sec-1', dimension: 'security', tier: 'must', text: 'The endpoint is public by definition, so signature verification is the only authentication it has.' },
      { id: 'wh-sec-2', dimension: 'security', tier: 'credit', text: 'A captured valid payload replayed later is rejected by a timestamp window or an event-id check.' },
      { id: 'wh-compat-1', dimension: 'compat', tier: 'credit', text: 'The provider adds a field: we ignore unknown fields rather than failing to parse.' },
      { id: 'wh-obs-1', dimension: 'observability', tier: 'must', text: 'Every event stored raw with its signature result and outcome — the only way to settle “we sent it”, “we never got it”.' },
    ],
  },

  {
    id: 'charge',
    category: 'api',
    title: 'A payment charge endpoint',
    prompt:
      'POST /charge takes an amount and a card token and charges the customer. Design the tests.',
    clarifiers: [
      'Is there an idempotency key, and is it required or optional?',
      'Do we hold funds and capture later, or charge immediately?',
      'Which currencies, and how is the amount represented — minor units, or a decimal?',
      'What do we do when the provider times out and we do not know whether it charged?',
    ],
    followUps: [
      {
        question: 'The provider times out. You do not know whether the customer was charged. What do you test?',
        answer:
          'That we never guess. The test asserts we do not blindly retry, because a retry after a successful charge we never heard about is a double charge. Instead the correct behaviour is to reconcile: retry with the same idempotency key so the provider deduplicates, or query the charge status before deciding. I would test all three branches — the provider charged, the provider did not, the provider is still unreachable — and assert the customer is charged exactly once in every one.',
      },
      {
        question: 'Why is amount as a floating-point number a bug rather than a style preference?',
        answer:
          'Because 0.1 + 0.2 is not 0.3 in binary floating point, and money that is summed, split or converted accumulates error that eventually shows up as a penny that does not reconcile. It is not theoretical — it turns into an audit finding rather than a crash, which is worse because nobody notices for months. I would test with amounts that expose it, assert the stored representation is integer minor units, and treat a float in the API contract as a defect to raise.',
      },
      {
        question: 'How would you test this without hitting the real payment provider?',
        answer:
          'A fake at our boundary implementing the provider’s documented responses — approved, declined, insufficient funds, timeout, 500 — because those failure branches are exactly what I want to cover and the real sandbox gives them unreliably. Then a small contract test against the real sandbox on its own schedule, so we learn if their shape changed. Pointing the suite at the real provider makes it slow, flaky, and dependent on someone else’s uptime for our pull requests.',
      },
    ],
    modelAnswer: {
      open:
        'Is there an idempotency key and is it required? Do we authorise and capture separately or charge immediately? How is the amount represented — minor units or a decimal? And what is the intended behaviour when the provider times out and we genuinely do not know whether the money moved? That last one is the whole question, really.',
      walk:
        'I would open by saying that the defining property here is exactly-once, and that everything I list ladders up to it. Happy path: a valid charge succeeds, the customer is charged the amount shown, and the order moves state once. Equivalence over the provider’s outcomes — approved, declined, insufficient funds, expired card, fraud hold — each mapping to a distinct, honest message. Boundaries: the minimum chargeable amount, zero, a negative, the maximum, and the currency’s smallest unit, since not every currency has two decimal places. Invalid input includes an amount as a float, which I would flag as a bug rather than a test case. State and idempotency are the core: the same key twice charges once, and a retry after a timeout does not become a second charge. Concurrency is two identical requests at the same instant. Failure is the richest dimension — provider timeout, provider 500, our own write failing after their charge succeeded, which is the one that loses money quietly.',
      prioritise:
        'Three: idempotent replay under concurrent duplicate requests, because a double charge is the failure that ends up on social media; the timeout-with-unknown-outcome path, because it is guaranteed to happen and the naive handling of it is a retry that double charges; and our write failing after their charge succeeded, because the money moved and our records say it did not. All three are service tests against a fake provider — which means the provider client has to be injectable, and if it is not, that is the change I would ask for first.',
      close:
        'And every attempt logged with its idempotency key and the provider’s reference, because when a customer says they were charged twice, that mapping is the only thing that tells you whether they were.',
    },
    expected: [
      { id: 'ch-happy-1', dimension: 'happy', tier: 'must', text: 'A valid charge succeeds, the amount matches what the customer was shown, and the order moves state exactly once.' },
      { id: 'ch-eq-1', dimension: 'equivalence', tier: 'must', text: 'Approved, declined, insufficient funds, expired card and fraud hold each map to a distinct, honest message.' },
      { id: 'ch-eq-2', dimension: 'equivalence', tier: 'credit', text: 'Currencies with no minor unit and with three decimal places, not only two.' },
      { id: 'ch-bound-1', dimension: 'boundary', tier: 'must', text: 'The minimum chargeable amount, one under it, zero, and a negative amount.' },
      { id: 'ch-bound-2', dimension: 'boundary', tier: 'must', text: 'The maximum amount, and one over — including whether it overflows the provider’s own limit.' },
      { id: 'ch-neg-1', dimension: 'negative', tier: 'must', text: 'An amount sent as a float, or as a string, or with more precision than the currency has.' },
      { id: 'ch-neg-2', dimension: 'negative', tier: 'must', text: 'A card token that is expired, belongs to another customer, or has already been consumed.' },
      { id: 'ch-state-1', dimension: 'state', tier: 'must', text: 'The same idempotency key twice charges once and returns the original result, not a new charge.' },
      { id: 'ch-state-2', dimension: 'state', tier: 'must', text: 'The same key reused with a different amount is rejected rather than silently charging the new one.' },
      { id: 'ch-state-3', dimension: 'state', tier: 'credit', text: 'A charge on an order already paid, or already cancelled, is refused.' },
      { id: 'ch-conc-1', dimension: 'concurrency', tier: 'must', text: 'Two identical requests at the same instant produce one charge — the sequential case passes where this one does not.' },
      { id: 'ch-fail-1', dimension: 'failure', tier: 'must', text: 'The provider times out and the outcome is unknown: we reconcile rather than retry blindly into a double charge.' },
      { id: 'ch-fail-2', dimension: 'failure', tier: 'must', text: 'Our own write fails after their charge succeeded — the money moved and our records must not say otherwise.' },
      { id: 'ch-fail-3', dimension: 'failure', tier: 'credit', text: 'The provider returns a malformed or unexpected response body.' },
      { id: 'ch-scale-1', dimension: 'scale', tier: 'credit', text: 'Behaviour when the provider is degraded and every call takes ten seconds — do our own threads exhaust?' },
      { id: 'ch-sec-1', dimension: 'security', tier: 'must', text: 'Amount and currency come from the server’s order record, never from the client’s payload.' },
      { id: 'ch-sec-2', dimension: 'security', tier: 'must', text: 'Card details never reach our logs, our error tracker, or an analytics payload.' },
      { id: 'ch-sec-3', dimension: 'security', tier: 'credit', text: 'You cannot charge against another customer’s order by changing an id.' },
      { id: 'ch-obs-1', dimension: 'observability', tier: 'must', text: 'Every attempt logged with its idempotency key and the provider’s reference — the only way to answer “was I charged twice?”.' },
    ],
  },

  {
    id: 'cache',
    category: 'api',
    title: 'A cached read endpoint',
    prompt:
      'A product detail endpoint is now served from a cache to cut load. Test the caching.',
    clarifiers: [
      'What is the TTL, and is there explicit invalidation on write?',
      'Is the cache per instance, shared, or at the CDN as well?',
      'Is any of the response personalised, or is it identical for every caller?',
      'What is the acceptable staleness — seconds, minutes, or must a price change be instant?',
    ],
    followUps: [
      {
        question: 'What is the worst bug caching can introduce, and how do you test for it?',
        answer:
          'Serving one user’s personalised response to another. If any part of the payload varies by user — a price tier, a saved flag, a name — and the cache key does not include the user, the cache leaks data across accounts. The test is to request as user A, then as user B, and assert B never sees A’s values; and to assert the cache key or Vary header actually includes whatever the response varies on. It is the only bug here that is a security incident rather than a staleness annoyance.',
      },
      {
        question: 'How do you test that an update actually invalidates?',
        answer:
          'Read to populate the cache, write through the normal path, then read again and assert the new value — not by waiting for the TTL, which would pass even with no invalidation at all. Then the harder case: assert it invalidated everywhere, since a per-instance cache means the instance that took the write is fresh and the other nine are not. Hitting one instance repeatedly is the test that gives false confidence.',
      },
      {
        question: 'Everything is cached and the origin goes down. What should happen?',
        answer:
          'That depends on a decision the team needs to make explicitly: serve stale indefinitely and stay up with old data, or start failing. For a product page, stale-while-revalidate is almost always right — an old price beats a dead site — but for anything with a legal or safety meaning, stale is worse than absent. I would test whichever was chosen, and I would test the thundering herd too: when the cache expires under load, one request should refill it, not ten thousand hitting a dead origin at once.',
      },
    ],
    modelAnswer: {
      open:
        'What is the TTL and is there explicit invalidation on write? Is the cache per instance, shared, or also at the CDN? Is any part of the response personalised? And what staleness is acceptable — because “a few minutes” and “a price change must be instant” are different features.',
      walk:
        'I would frame it as: caching does not add behaviour, it adds ways for correct behaviour to be wrong, so almost all of my cases are about staleness, keys and failure rather than about the payload. Happy path is a miss then a hit, with identical bodies and the second one faster. Boundaries are around the TTL — just before expiry, at it, just after. State is the bulk: an update invalidates rather than waiting out the TTL, a delete does not leave the item readable, and invalidation reaches every instance rather than only the one that took the write. Concurrency gives the thundering herd, where an expiry under load sends every request to the origin at once. Failure: the cache itself is down, which must degrade to the origin rather than to an error; and the origin is down, where serving stale is usually right but has to be a decision. Security is the one I would lead with, though — if anything in the response varies by user and the key does not, the cache serves one customer’s data to another.',
      prioritise:
        'Three: the personalisation leak, because it is a data breach rather than a bug; invalidation actually reaching every instance, because the single-instance test passes while production serves stale for an hour; and the cache-is-down path, because a cache outage must not become a total outage. All three are service tests, though the invalidation one needs more than one instance running, which is worth the setup.',
      close:
        'And I would want hit rate and origin load on a dashboard, because a cache that silently stops working looks exactly like normal operation until the database falls over.',
    },
    expected: [
      { id: 'ca-happy-1', dimension: 'happy', tier: 'must', text: 'A miss then a hit: identical bodies, and the second is served without touching the origin.' },
      { id: 'ca-eq-1', dimension: 'equivalence', tier: 'must', text: 'Cacheable and non-cacheable responses — a 404 or a 500 must not be cached like a 200.' },
      { id: 'ca-bound-1', dimension: 'boundary', tier: 'must', text: 'A read just before the TTL expires, exactly at it, and just after.' },
      { id: 'ca-bound-2', dimension: 'boundary', tier: 'credit', text: 'A payload larger than the cache’s per-item limit — passed through rather than silently truncated.' },
      { id: 'ca-neg-1', dimension: 'negative', tier: 'must', text: 'Query parameters in a different order, or with junk added, do not fragment the cache into a million keys.' },
      { id: 'ca-state-1', dimension: 'state', tier: 'must', text: 'An update is visible on the next read, by invalidation rather than by waiting out the TTL.' },
      { id: 'ca-state-2', dimension: 'state', tier: 'must', text: 'A deleted item stops being readable — a cached copy outliving a delete is the classic version of this bug.' },
      { id: 'ca-state-3', dimension: 'state', tier: 'must', text: 'Invalidation reaches every instance, not only the one that handled the write.' },
      { id: 'ca-conc-1', dimension: 'concurrency', tier: 'must', text: 'Thundering herd: an expiry under load sends one refill to the origin, not every in-flight request.' },
      { id: 'ca-conc-2', dimension: 'concurrency', tier: 'credit', text: 'A write landing during a refill does not leave the stale value cached for another full TTL.' },
      { id: 'ca-fail-1', dimension: 'failure', tier: 'must', text: 'The cache is down: requests fall through to the origin rather than erroring.' },
      { id: 'ca-fail-2', dimension: 'failure', tier: 'must', text: 'The origin is down: serve stale or fail, but as a deliberate decision with a test behind it.' },
      { id: 'ca-scale-1', dimension: 'scale', tier: 'must', text: 'Hit rate under realistic traffic, including a long tail — a uniform load test flatters any cache.' },
      { id: 'ca-scale-2', dimension: 'scale', tier: 'credit', text: 'Eviction under memory pressure, and what the hit rate does when the working set exceeds the cache.' },
      { id: 'ca-sec-1', dimension: 'security', tier: 'must', text: 'If any part of the response varies by user, the cache key includes the user — or one customer sees another’s data.' },
      { id: 'ca-sec-2', dimension: 'security', tier: 'credit', text: 'An authenticated response is not cached by a shared proxy because the headers permit it.' },
      { id: 'ca-compat-1', dimension: 'compat', tier: 'credit', text: 'Behaviour behind a CDN as well as the application cache — two layers, two TTLs, two invalidations.' },
      { id: 'ca-obs-1', dimension: 'observability', tier: 'must', text: 'Hit rate and origin load are visible: a cache that quietly stops working looks normal until the database falls over.' },
    ],
  },

  {
    id: 'checkout',
    category: 'flow',
    title: 'A checkout flow',
    prompt:
      'Cart, address, payment, confirmation. Test the whole purchase flow, not just one step.',
    clarifiers: [
      'Guest checkout, or account required?',
      'When is stock actually reserved — at cart, at payment, or at confirmation?',
      'Is payment on our page or redirected to the provider and back?',
      'What happens to the cart if the customer abandons at payment?',
    ],
    followUps: [
      {
        question: 'The customer pays and the confirmation page never loads. What do you test?',
        answer:
          'That the order exists and the customer finds out. The order must be created from the payment result server-side, never from the browser reaching the confirmation page — if the page is what creates it, a closed laptop means a charge with no order. So I would assert the order exists after killing the browser at that exact point, that the confirmation email still goes out, and that returning to the site shows the completed order rather than the cart still full.',
      },
      {
        question: 'Where in this flow would you spend the least testing effort, and why?',
        answer:
          'Address form validation. It is the step people over-test because it is easy to test — dozens of cases about postcode formats — and it is the step whose failure is cheapest: the customer sees an error and fixes it. I would cover it at the unit level and move on. The effort belongs where a failure is silent and costs money: payment, stock and order creation. Saying that out loud is part of the answer, because prioritisation is what is actually being assessed.',
      },
      {
        question: 'How do you keep an end-to-end checkout test from being flaky?',
        answer:
          'Own the data and the dependencies. Each run creates its own customer and its own product rather than sharing a fixture, so parallel runs cannot collide. The payment provider is a fake at our boundary with deterministic outcomes. Waits are on state — the order exists, the status changed — rather than on spinners or fixed sleeps. And one test covers the journey; every variation goes to a lower layer, because ten end-to-end variants is ten times the flake for very little more coverage.',
      },
    ],
    modelAnswer: {
      open:
        'Guest or account? When is stock actually reserved — cart, payment, or confirmation? Is payment on our page or a redirect out and back? And what happens to the cart on abandonment? The reservation answer decides where the hardest bugs are, so I would want that one first.',
      walk:
        'The thing I would say at the start is that this is a flow, so I am going to test the seams between the steps rather than the steps individually — each step probably has its own tests already, and the money is lost between them. Happy path end to end, once. Then the transitions: back button from payment to address, refresh mid-flow, resuming an abandoned checkout, and the cart changing in another tab while checkout is open. Boundaries are around stock and totals — the last unit, a price change between cart and payment, a discount code expiring while the customer types their card. Failure is where I would spend most of the time, because the expensive cases live there: payment succeeds and order creation fails, payment succeeds and the confirmation page never loads, the provider redirects back with an ambiguous status. Concurrency is two customers buying the last unit, and a double-click on Pay. Security is that the price and the shipping cost come from the server, and that you cannot see another customer’s order by changing the id on the confirmation page.',
      prioritise:
        'Three: payment succeeded but order creation failed, because the customer is charged and has nothing; the double-click on Pay, because it is the most common real double-charge; and the last-unit race at whichever step reserves stock, because overselling costs money and trust. The first two need a fake payment provider and can run below the browser. I would keep exactly one full browser journey and push every variation down a layer.',
      close:
        'And I would want a funnel — how many customers reach each step and how many complete — because a checkout that breaks for one browser or one country shows up as a drop-off long before anyone files a bug.',
    },
    expected: [
      { id: 'co-happy-1', dimension: 'happy', tier: 'must', text: 'A full purchase end to end: order created, payment taken once, confirmation shown and emailed.' },
      { id: 'co-eq-1', dimension: 'equivalence', tier: 'must', text: 'Guest versus signed-in checkout, and a saved card versus a new one.' },
      { id: 'co-bound-1', dimension: 'boundary', tier: 'must', text: 'Buying the last unit in stock, and the unit that sells out while the customer is on the payment step.' },
      { id: 'co-bound-2', dimension: 'boundary', tier: 'must', text: 'A discount code that expires between the cart and the payment, and one that takes the total to zero.' },
      { id: 'co-bound-3', dimension: 'boundary', tier: 'credit', text: 'The free-shipping threshold at, just under, and just over.' },
      { id: 'co-neg-1', dimension: 'negative', tier: 'must', text: 'A declined card, an expired card, and a 3-D Secure challenge the customer abandons.' },
      { id: 'co-neg-2', dimension: 'negative', tier: 'credit', text: 'An address the shipping provider rejects after the order is placed.' },
      { id: 'co-state-1', dimension: 'state', tier: 'must', text: 'Back button from payment to address and forward again does not duplicate the order or lose the cart.' },
      { id: 'co-state-2', dimension: 'state', tier: 'must', text: 'Refresh at each step resumes rather than restarting or double-submitting.' },
      { id: 'co-state-3', dimension: 'state', tier: 'must', text: 'The cart changed in another tab while checkout is open — the total charged matches what was displayed.' },
      { id: 'co-state-4', dimension: 'state', tier: 'credit', text: 'An abandoned checkout resumed a day later reprices rather than honouring a stale total silently.' },
      { id: 'co-conc-1', dimension: 'concurrency', tier: 'must', text: 'Double-clicking Pay charges once — the most common real double-charge.' },
      { id: 'co-conc-2', dimension: 'concurrency', tier: 'must', text: 'Two customers buying the last unit simultaneously: one order, one clear failure, stock never negative.' },
      { id: 'co-fail-1', dimension: 'failure', tier: 'must', text: 'Payment succeeds and order creation fails — the customer is charged with nothing to show, so this must reconcile.' },
      { id: 'co-fail-2', dimension: 'failure', tier: 'must', text: 'The browser dies before the confirmation page loads: the order still exists and the email still goes.' },
      { id: 'co-fail-3', dimension: 'failure', tier: 'credit', text: 'The provider redirects back with an ambiguous or missing status.' },
      { id: 'co-sec-1', dimension: 'security', tier: 'must', text: 'Price, shipping and discount are computed server-side; a modified client payload changes nothing.' },
      { id: 'co-sec-2', dimension: 'security', tier: 'must', text: 'The confirmation page cannot show another customer’s order by changing the id in the URL.' },
      { id: 'co-compat-1', dimension: 'compat', tier: 'credit', text: 'Mobile, an in-app browser from a social link, and a returning redirect that loses the session cookie.' },
      { id: 'co-obs-1', dimension: 'observability', tier: 'must', text: 'A step-by-step funnel, so a checkout broken for one browser or country shows up before anyone reports it.' },
    ],
  },

  {
    id: 'deletion',
    category: 'flow',
    title: 'Delete my account',
    prompt:
      'A user asks to delete their account and all their data. Test it.',
    clarifiers: [
      'Is deletion immediate, or is there a grace period where it can be undone?',
      'What are we legally required to keep — invoices, fraud records, tax data?',
      'Does data exist in backups, analytics, logs and third-party tools as well as the database?',
      'What happens to content they created that other people depend on?',
    ],
    followUps: [
      {
        question: 'What is the case most candidates miss here?',
        answer:
          'Everywhere the data is that is not the database: backups, analytics warehouses, log lines, search indexes, the email provider, the support tool, the CRM. Deleting the row is the easy part, and a test that only checks the database will pass while the person’s email address is still sitting in five other systems. I would enumerate the destinations first and write a case per destination, because that list is the actual scope of the feature.',
      },
      {
        question: 'They deleted their account and their comments are still on other people’s posts. Bug?',
        answer:
          'Not necessarily — it is a product decision, and both options are defensible: anonymise the comment and keep the thread coherent, or delete it and leave holes in other people’s conversations. What is definitely a bug is not having decided, or deciding one thing and implementing another. So the test asserts whichever was chosen, and I would specifically check that anonymisation is real rather than cosmetic — the display name hidden while the author id still resolves is not anonymisation.',
      },
      {
        question: 'How would you test that deletion is actually irreversible after the grace period?',
        answer:
          'By trying to reverse it through every path that could: signing up again with the same email and asserting a clean account rather than the old one restored, asking support tooling to restore and asserting it cannot, and confirming the tokens and sessions from before are dead. And I would check the export path too — asking for a data export after deletion must return nothing, since an export that still finds the data proves the deletion did not happen.',
      },
    ],
    modelAnswer: {
      open:
        'Is deletion immediate or is there a grace period? What are we legally required to retain — invoices and fraud records usually survive deletion, and that is a requirement rather than a bug. Where else does this data live: backups, analytics, logs, third-party tools? And what happens to content other people depend on?',
      walk:
        'The framing I would open with is that the interesting question is not whether the row disappears — it is enumerating everywhere the data is, because that list is the real scope. So I would list the destinations out loud: primary database, replicas, backups, the analytics warehouse, the search index, log lines, the email provider, the support tool, the payment provider. Then happy path, then the grace period boundaries: cancelling on the last day works, cancelling a day after does not, and logging in during the window either restores or is refused, deliberately. State is heavy — active subscriptions, pending orders, content other users reference, and shared resources they own. Failure matters because deletion is a multi-system operation: if the third system fails halfway, we must not report success, and it must be resumable. Security is the one I would insist on: deletion must be authenticated and confirmed, because an unauthenticated delete is the most destructive possible vulnerability, and it must not become a way to enumerate which addresses have accounts.',
      prioritise:
        'Three: the data actually being gone from every destination and not only the primary database, because that is the whole promise; the partial-failure case, since a half-deleted account is worse than either outcome and must be resumable; and authorisation on the delete itself, because letting one user delete another is unrecoverable. The first two need integration tests spanning the systems — which is exactly the kind of test people skip and exactly where this feature fails.',
      close:
        'And every deletion needs an audit record — who asked, when, what was retained and why — kept deliberately, because proving you deleted the data is a legal requirement and the record proving it cannot itself contain the data.',
    },
    expected: [
      { id: 'de-happy-1', dimension: 'happy', tier: 'must', text: 'Request deletion, confirm, and the account is gone: sign-in fails and the profile is unreachable.' },
      { id: 'de-eq-1', dimension: 'equivalence', tier: 'must', text: 'An account with nothing on it, an active subscriber, and a user with orders in flight each behave per policy.' },
      { id: 'de-bound-1', dimension: 'boundary', tier: 'must', text: 'Cancelling on the last day of the grace period works; a day after, it does not.' },
      { id: 'de-bound-2', dimension: 'boundary', tier: 'credit', text: 'Signing in during the grace period either restores the account or is refused — deliberately, and the same way every time.' },
      { id: 'de-neg-1', dimension: 'negative', tier: 'must', text: 'Deleting an already-deleted account, and confirming with an expired confirmation token.' },
      { id: 'de-state-1', dimension: 'state', tier: 'must', text: 'Data is gone from every destination — backups, analytics, search index, logs, email provider, support tool — not only the database.' },
      { id: 'de-state-2', dimension: 'state', tier: 'must', text: 'Legally retained records — invoices, tax, fraud — survive by design, and that is asserted rather than assumed.' },
      { id: 'de-state-3', dimension: 'state', tier: 'must', text: 'Content other users depend on is anonymised or removed per the decision, and anonymisation is real rather than a hidden display name.' },
      { id: 'de-state-4', dimension: 'state', tier: 'credit', text: 'Signing up again with the same email gives a clean account, not the old one resurrected.' },
      { id: 'de-conc-1', dimension: 'concurrency', tier: 'credit', text: 'An order or a payment landing while deletion is in progress does not resurrect the account.' },
      { id: 'de-fail-1', dimension: 'failure', tier: 'must', text: 'A third-party deletion call fails halfway: we do not report success, and the job is resumable rather than leaving a half-deleted account.' },
      { id: 'de-fail-2', dimension: 'failure', tier: 'credit', text: 'A destination that is permanently unreachable is escalated rather than silently skipped.' },
      { id: 'de-scale-1', dimension: 'scale', tier: 'credit', text: 'A user with a decade of data — deletion completes within the promised window rather than timing out.' },
      { id: 'de-sec-1', dimension: 'security', tier: 'must', text: 'Deletion is authenticated and confirmed — an unauthenticated delete is the most destructive vulnerability there is.' },
      { id: 'de-sec-2', dimension: 'security', tier: 'must', text: 'You cannot delete another user’s account by changing an id.' },
      { id: 'de-sec-3', dimension: 'security', tier: 'credit', text: 'The flow does not reveal whether an address has an account, the same as password reset.' },
      { id: 'de-compat-1', dimension: 'compat', tier: 'credit', text: 'Active sessions and API tokens issued before deletion stop working immediately.' },
      { id: 'de-obs-1', dimension: 'observability', tier: 'must', text: 'An audit record of who asked, when, and what was retained — proving deletion is a legal requirement, and the proof cannot contain the data.' },
    ],
  },

  {
    id: 'subscription',
    category: 'flow',
    title: 'Subscription renewal and cancellation',
    prompt:
      'A monthly subscription renews automatically, and the customer can upgrade, downgrade or cancel. Test the billing.',
    clarifiers: [
      'Is an upgrade prorated, and does a downgrade take effect now or at the period end?',
      'What happens when the renewal payment fails — retries, a grace period, immediate suspension?',
      'Does cancelling end access immediately or at the end of the paid period?',
      'How are trials handled, and can someone start a second one?',
    ],
    followUps: [
      {
        question: 'A customer subscribes on the 31st of January. When does it renew?',
        answer:
          'That is the question, and the answer must be a decision rather than whatever the date library does. Most billing systems clamp to the last day of the shorter month, so 31 January renews on 28 February and then either returns to the 31st or stays on the 28th — and those two choices differ by three days of revenue per customer per year. I would test the whole sequence across several months rather than one renewal, because the bug is usually in whether it drifts.',
      },
      {
        question: 'The renewal payment fails. What sequence do you test?',
        answer:
          'The whole dunning sequence with the clock injected: first failure, retry schedule, each notification actually sent, the grace period boundary, and suspension at the end of it. Then the recovery path — the customer updates their card on day three and the subscription must resume without losing the days they paid for and without double-charging them. The recovery path is the one that gets skipped, and it is the one where an angry customer is on the phone.',
      },
      {
        question: 'What is the case that costs the company money if it is wrong?',
        answer:
          'Cancellation not stopping the billing. A customer who cancels and is charged again produces a chargeback, a refund, a support ticket and a public complaint — it is the most expensive failure in the flow. The mirror case costs money too: access continuing after the paid period ends, which is quieter but is revenue given away. I would test both with the clock advanced past the period boundary rather than assuming the scheduler is right.',
      },
    ],
    modelAnswer: {
      open:
        'Is an upgrade prorated, and does a downgrade apply now or at period end? What is the dunning policy when a renewal fails? Does cancelling end access immediately or at the end of the paid period? And can somebody start a second trial? Each of those is a different set of cases, so I would not guess.',
      walk:
        'I would say up front that this is a time-driven flow, so the clock has to be injectable or none of it is testable — and I would make that a testability ask rather than a case. Happy path is a renewal charging the right amount on the right date. Boundaries are calendar arithmetic: subscribing on the 31st and renewing into a 30-day month, into February, and across a leap year; and the last day of a trial versus the first day of billing. State is the transitions — upgrade, downgrade, cancel, resubscribe, and cancel-then-resubscribe within the same period, which must not charge twice. Failure is the dunning sequence: retries, notifications, the grace boundary, suspension, and the recovery when the card is fixed mid-sequence. Concurrency is a cancellation landing at the same moment as the renewal job. And I would name the money-losing pair explicitly: billing after cancellation, and access continuing after the period ends.',
      prioritise:
        'Three: cancellation actually stopping the next charge, because billing a cancelled customer is the most expensive failure here; the renewal date arithmetic across short months, because it is silently wrong for months before anyone notices; and the dunning recovery path, where the customer fixes their card and must resume without a double charge. All three are service tests over an injected clock and a fake payment provider — waiting a month for a renewal is not a test strategy.',
      close:
        'And I would want involuntary churn tracked separately from voluntary — customers lost to a failed card rather than to a decision — because a broken dunning sequence looks identical to people simply leaving unless somebody separates the two.',
    },
    expected: [
      { id: 'sb-happy-1', dimension: 'happy', tier: 'must', text: 'A renewal charges the right amount on the right date and extends access without interruption.' },
      { id: 'sb-eq-1', dimension: 'equivalence', tier: 'must', text: 'Monthly and annual plans, a trial converting to paid, and a plan with a discount applied.' },
      { id: 'sb-bound-1', dimension: 'boundary', tier: 'must', text: 'Subscribing on the 31st and renewing into a 30-day month, into February, and across a leap year.' },
      { id: 'sb-bound-2', dimension: 'boundary', tier: 'must', text: 'The last day of a trial versus the first day of billing — and cancelling on exactly that boundary.' },
      { id: 'sb-bound-3', dimension: 'boundary', tier: 'credit', text: 'A renewal falling on a daylight-saving change, where the day is 23 or 25 hours long.' },
      { id: 'sb-neg-1', dimension: 'negative', tier: 'must', text: 'Cancelling an already-cancelled subscription, and upgrading one that is suspended for non-payment.' },
      { id: 'sb-neg-2', dimension: 'negative', tier: 'credit', text: 'Starting a second free trial on the same account, or the same card under a new email.' },
      { id: 'sb-state-1', dimension: 'state', tier: 'must', text: 'Cancellation stops the next charge — billing a cancelled customer is the most expensive failure in the flow.' },
      { id: 'sb-state-2', dimension: 'state', tier: 'must', text: 'Access ends exactly when the paid period ends, not sooner and not indefinitely later.' },
      { id: 'sb-state-3', dimension: 'state', tier: 'must', text: 'Upgrade prorates correctly mid-period; downgrade applies when policy says, not immediately by accident.' },
      { id: 'sb-state-4', dimension: 'state', tier: 'credit', text: 'Cancel then resubscribe within the same period does not charge twice for overlapping days.' },
      { id: 'sb-conc-1', dimension: 'concurrency', tier: 'must', text: 'A cancellation landing at the same instant as the renewal job — one wins, and it is not a charge plus a cancellation.' },
      { id: 'sb-fail-1', dimension: 'failure', tier: 'must', text: 'The full dunning sequence: retries on schedule, each notification sent, grace boundary, then suspension.' },
      { id: 'sb-fail-2', dimension: 'failure', tier: 'must', text: 'The customer fixes their card mid-sequence: service resumes without losing paid days or double-charging.' },
      { id: 'sb-fail-3', dimension: 'failure', tier: 'credit', text: 'The billing job crashes halfway through the day’s renewals and reruns without charging anyone twice.' },
      { id: 'sb-scale-1', dimension: 'scale', tier: 'credit', text: 'Renewal day for a hundred thousand subscribers — does the job finish inside the window it has?' },
      { id: 'sb-sec-1', dimension: 'security', tier: 'must', text: 'You cannot change or cancel another account’s subscription, or upgrade yourself by editing a plan id.' },
      { id: 'sb-obs-1', dimension: 'observability', tier: 'must', text: 'Involuntary churn tracked separately from voluntary, or broken dunning looks exactly like customers choosing to leave.' },
    ],
  },

  {
    id: 'chat',
    category: 'flow',
    title: 'Sending a chat message',
    prompt:
      'A messaging app. The user types a message and hits send. Test it.',
    clarifiers: [
      'Are there delivery and read receipts?',
      'What happens when the sender is offline — queue locally, or refuse?',
      'Is ordering guaranteed, and by whose clock — the sender’s or the server’s?',
      'One-to-one only, or group chats where a member can leave mid-conversation?',
    ],
    followUps: [
      {
        question: 'Two people send at the same moment. What order do the messages appear in?',
        answer:
          'Whatever order we defined, and the point is that it must be defined. Ordering by the sender’s device clock means anyone with a wrong clock can post a message that appears an hour ago; ordering by server receipt time means the two participants can see different orders if their clients sort locally. I would establish which one we promise, then test that both participants see the same sequence — because the real bug is not the order itself, it is the two people seeing different orders and arguing about it.',
      },
      {
        question: 'How do you test the offline queue without turning off wifi by hand?',
        answer:
          'Control the transport rather than the network. The test stubs the send channel to fail, sends three messages, asserts they show as pending in the right order, then restores the channel and asserts all three send exactly once and in that order. The two cases that actually break are duplicates on reconnect and the queue flushing out of order — and both are deterministic at this level while being nearly impossible to reproduce by toggling wifi.',
      },
      {
        question: 'The message shows a tick but never arrived. What is the underlying bug class?',
        answer:
          'A receipt driven by the wrong event — the tick set when the request was sent rather than when the server acknowledged, or when the server stored it rather than when the recipient’s device received it. Each tick has to mean one specific thing, and the test asserts that meaning: the sent tick only after the server acknowledges, the delivered tick only after the recipient’s device confirms. Anything looser is the app lying about something the user relies on.',
      },
    ],
    modelAnswer: {
      open:
        'Are there delivery and read receipts? What happens when the sender is offline — do we queue or refuse? Is ordering guaranteed, and by whose clock? And is this one-to-one or are there groups, where somebody can leave halfway through the conversation? I will assume receipts, a local queue, server ordering, and groups.',
      walk:
        'I would frame it as: sending looks like one action and is really a distributed system with an unreliable client on one end, so state and failure carry most of the weight. Happy path: the message appears for the sender immediately, reaches the recipient, and the receipts progress in order. Equivalence over content types — text, emoji, a link that generates a preview, an attachment. Boundaries: an empty message, one at the length limit, one over, and a message sent at the moment the recipient leaves the group. State is the core — the offline queue flushing in order and exactly once, a message sent while the app is backgrounded, and the same conversation open on two devices staying consistent. Concurrency is two people sending simultaneously and both seeing the same order. Failure: the send fails and the message shows as failed with a retry rather than silently vanishing, and a receipt never lies about a state that has not happened. Then security, because message content is the most private thing the product holds.',
      prioritise:
        'Three: the offline queue flushing exactly once and in order, because duplicates and reordering are the most reported real bugs; receipts meaning exactly what they claim, because the user acts on a tick; and both participants seeing the same order, because divergent order turns into an argument between two people. All three are testable below the UI with a controlled transport, which is what makes them worth automating at all.',
      close:
        'And I would want send-failure and delivery-latency metrics per platform, because “messages are slow” is otherwise unfalsifiable, and it is almost always slow on one platform rather than everywhere.',
    },
    expected: [
      { id: 'cm-happy-1', dimension: 'happy', tier: 'must', text: 'The message appears instantly for the sender, arrives for the recipient, and the receipts progress in order.' },
      { id: 'cm-eq-1', dimension: 'equivalence', tier: 'must', text: 'Plain text, emoji, a link that generates a preview, and an attachment each send and render correctly.' },
      { id: 'cm-bound-1', dimension: 'boundary', tier: 'must', text: 'An empty message, one at the length limit, and one over it.' },
      { id: 'cm-bound-2', dimension: 'boundary', tier: 'credit', text: 'A message sent at the instant the recipient leaves the group, or blocks the sender.' },
      { id: 'cm-neg-1', dimension: 'negative', tier: 'must', text: 'Content hostile to rendering: HTML, control characters, right-to-left overrides, ten thousand combining marks.' },
      { id: 'cm-neg-2', dimension: 'negative', tier: 'credit', text: 'Sending to a conversation that has been deleted, or to a user who has blocked you.' },
      { id: 'cm-state-1', dimension: 'state', tier: 'must', text: 'Offline: messages queue, show as pending, then send exactly once and in order on reconnect.' },
      { id: 'cm-state-2', dimension: 'state', tier: 'must', text: 'Each receipt means one specific thing — sent on server acknowledgement, delivered on the recipient’s device, not on hope.' },
      { id: 'cm-state-3', dimension: 'state', tier: 'must', text: 'The same conversation open on two devices converges to the same messages in the same order.' },
      { id: 'cm-state-4', dimension: 'state', tier: 'credit', text: 'Sending while the app is backgrounded or being killed does not lose the message.' },
      { id: 'cm-conc-1', dimension: 'concurrency', tier: 'must', text: 'Two people sending simultaneously: both see the same order, whatever that order is.' },
      { id: 'cm-fail-1', dimension: 'failure', tier: 'must', text: 'A failed send shows as failed with a retry — never silently vanishing, and never showing a tick it has not earned.' },
      { id: 'cm-fail-2', dimension: 'failure', tier: 'credit', text: 'A retry after an ambiguous timeout does not post the message twice.' },
      { id: 'cm-scale-1', dimension: 'scale', tier: 'credit', text: 'A conversation with a hundred thousand messages still opens and scrolls, and a group with a thousand members fans out.' },
      { id: 'cm-sec-1', dimension: 'security', tier: 'must', text: 'You cannot read or post into a conversation you are not a member of by changing an id.' },
      { id: 'cm-sec-2', dimension: 'security', tier: 'credit', text: 'Message content stays out of logs, crash reports and analytics payloads.' },
      { id: 'cm-compat-1', dimension: 'compat', tier: 'must', text: 'Screen reader announces incoming messages, and the timestamp is readable rather than only a relative colour cue.' },
      { id: 'cm-obs-1', dimension: 'observability', tier: 'credit', text: 'Send-failure rate and delivery latency per platform — “messages are slow” is otherwise unfalsifiable.' },
    ],
  },

  {
    id: 'import',
    category: 'data',
    title: 'A bulk CSV import',
    prompt:
      'Customers upload a CSV of products to import into their catalogue. Test it.',
    clarifiers: [
      'Is it all-or-nothing, or does it import the valid rows and report the rest?',
      'How large can the file be, and is the import synchronous or a background job?',
      'Does an import create only, or update existing rows by some key?',
      'What does the customer see while it runs, and how do they learn what failed?',
    ],
    followUps: [
      {
        question: 'Row 4,000 of 10,000 is invalid. What should happen?',
        answer:
          'Whichever the product chose, but the choice must be explicit and the customer must be able to act on the result. All-or-nothing is simpler to reason about and infuriating at 10,000 rows, since one typo wastes the whole upload. Partial import needs a downloadable report of exactly which rows failed and why, with the original line numbers — a summary saying “6,000 succeeded” with no way to find the other 4,000 is unusable. I would test the report as carefully as the import, because it is the part the customer actually works with.',
      },
      {
        question: 'What CSV-specific cases do people forget?',
        answer:
          'The ones that come from CSV being barely a format: commas inside quoted fields, escaped quotes, newlines inside a quoted field, a UTF-8 byte-order mark on the first header, Windows versus Unix line endings, and a file that is really semicolon-separated because it was exported in a European locale. Then Excel’s contributions — leading zeros stripped from postcodes and product codes turned into dates. Those are the ones that reach support, because the customer’s file looks perfect in Excel.',
      },
      {
        question: 'The same file is uploaded twice by accident. What do you assert?',
        answer:
          'That the catalogue does not double. If import updates by a key, the second run should be a no-op rather than creating duplicates — and I would test that explicitly with a file containing rows that already exist. If it only creates, then the product needs to say so and I would test that the customer is warned before running, because "I uploaded it twice and now every product exists twice" is a data-cleanup job, not a bug report anyone enjoys.',
      },
    ],
    modelAnswer: {
      open:
        'Is it all-or-nothing or partial? How large can the file be, and is it processed in the request or as a background job? Does it create only, or update by a key? And how does the customer learn which rows failed? The partial-versus-atomic answer reshapes most of my cases, so I would want it first.',
      walk:
        'The framing I would use is that a bulk import is defined by partial failure — the interesting behaviour is what happens when most of it works — so I will weight failure and state over happy path. Happy path is a clean file importing every row with the values landing in the right columns. Equivalence: a file with only new rows, only updates, and a mix. Boundaries: zero data rows, one row, the maximum file size, one row over the row limit, and the longest permitted value in each column. Invalid input is unusually rich because CSV is barely a format — quoted commas, escaped quotes, newlines inside fields, a byte-order mark, Windows line endings, semicolon separators from a European export, and Excel having stripped leading zeros from postcodes. State is the duplicate upload, the resumed job after a crash, and whether a failed import leaves half the rows in. Concurrency is two imports from the same customer at once, and an edit through the UI while an import is running. Scale is a hundred thousand rows against timeouts and memory. Security matters more than it looks: the file is untrusted input, and a formula cell is a CSV-injection vector when the data is exported again.',
      prioritise:
        'Three: partial failure producing a usable per-row report with original line numbers, because that is what the customer works with; the same file uploaded twice not doubling the catalogue, because it is a data-cleanup incident; and the job crashing halfway being resumable without duplicating what it already wrote. All three are service-level tests over crafted files, and the fixtures are cheap to keep in the repo.',
      close:
        'And I would want per-import metrics — rows in, rows accepted, rows rejected by reason — because the same rejection reason spiking across many customers is a parser bug, and it is invisible if you only ever look at one import at a time.',
    },
    expected: [
      { id: 'im-happy-1', dimension: 'happy', tier: 'must', text: 'A clean file imports every row, with values in the right columns and types.' },
      { id: 'im-eq-1', dimension: 'equivalence', tier: 'must', text: 'A file of only new rows, only updates to existing ones, and a mix of both.' },
      { id: 'im-bound-1', dimension: 'boundary', tier: 'must', text: 'Zero data rows with a header, one row, the maximum row count, and one over it.' },
      { id: 'im-bound-2', dimension: 'boundary', tier: 'must', text: 'The maximum file size and one byte over, plus the longest permitted value in each column.' },
      { id: 'im-neg-1', dimension: 'negative', tier: 'must', text: 'CSV realities: commas inside quoted fields, escaped quotes, newlines inside a field, a UTF-8 BOM on the header.' },
      { id: 'im-neg-2', dimension: 'negative', tier: 'must', text: 'Windows versus Unix line endings, and a semicolon-separated file exported from a European locale.' },
      { id: 'im-neg-3', dimension: 'negative', tier: 'must', text: 'Missing columns, extra columns, columns in a different order, and a duplicated header name.' },
      { id: 'im-neg-4', dimension: 'negative', tier: 'credit', text: 'Excel damage: leading zeros stripped from postcodes, product codes converted to dates.' },
      { id: 'im-state-1', dimension: 'state', tier: 'must', text: 'Row 4,000 of 10,000 is invalid: the outcome matches the stated policy, and the customer gets a per-row report with original line numbers.' },
      { id: 'im-state-2', dimension: 'state', tier: 'must', text: 'The same file uploaded twice does not double the catalogue.' },
      { id: 'im-state-3', dimension: 'state', tier: 'credit', text: 'A cancelled import stops cleanly and says how much it had already applied.' },
      { id: 'im-conc-1', dimension: 'concurrency', tier: 'must', text: 'Two imports from the same customer at once, and a UI edit to a row an import is about to overwrite.' },
      { id: 'im-fail-1', dimension: 'failure', tier: 'must', text: 'The job crashes halfway and resumes without duplicating the rows it already wrote.' },
      { id: 'im-fail-2', dimension: 'failure', tier: 'credit', text: 'The datastore rejects a batch mid-import — the report is still produced rather than the customer seeing nothing.' },
      { id: 'im-scale-1', dimension: 'scale', tier: 'must', text: 'A hundred thousand rows against every timeout in the path, and memory that does not grow with file size.' },
      { id: 'im-sec-1', dimension: 'security', tier: 'must', text: 'The file is untrusted: a customer cannot import into another tenant’s catalogue by putting an id in a column.' },
      { id: 'im-sec-2', dimension: 'security', tier: 'credit', text: 'A cell beginning with = is a CSV-injection vector when the data is exported and opened again.' },
      { id: 'im-obs-1', dimension: 'observability', tier: 'must', text: 'Rows in, accepted and rejected by reason — one reason spiking across customers is a parser bug, invisible one import at a time.' },
    ],
  },

  {
    id: 'sync',
    category: 'data',
    title: 'Offline sync on mobile',
    prompt:
      'A notes app works offline and syncs when the device reconnects. Test the sync.',
    clarifiers: [
      'What is the conflict rule — last write wins, merge, or ask the user?',
      'Does sync operate on whole documents or on individual edits?',
      'How long can a device stay offline before its queued changes are considered stale?',
      'Are deletions synced as deletions, or as tombstones that expire?',
    ],
    followUps: [
      {
        question: 'The same note is edited on two devices while both are offline. What do you test?',
        answer:
          'That the rule is applied and that nothing is silently lost. For last-write-wins I would assert the later edit wins deterministically by a defined clock, and — more importantly — that the losing edit is recoverable somewhere, because silently discarding a user’s writing is the failure people never forgive. For a merge I would assert both edits survive when they touch different parts, and that a genuine overlap surfaces to the user rather than being resolved by luck.',
      },
      {
        question: 'Why is "last write wins" using the device clock a problem?',
        answer:
          'Because device clocks are wrong. A phone whose clock is a day fast makes every edit from that device win forever, including over edits made afterwards on a correct device — and the user experiences it as their changes randomly reverting. The fix is a server-assigned ordering or a logical clock, and the test is to set one device’s clock deliberately wrong and assert the ordering still reflects what actually happened.',
      },
      {
        question: 'How do you test a device that has been offline for a month?',
        answer:
          'Construct the state rather than living it: seed a queue of a month’s changes, advance the clock, and sync. That surfaces the cases that only appear at that scale — a queue larger than one request, tombstones for notes deleted on the server since, edits to notes that no longer exist, and a schema that changed while the device was away. That last one is the real risk and it needs an old client version deliberately kept around to test against.',
      },
    ],
    modelAnswer: {
      open:
        'What is the conflict rule — last write wins, merge, or ask? Does sync move whole documents or individual edits? How long can a device be offline before its queue is stale? And are deletions tombstones? Without the conflict rule I cannot say what correct even means here, so that is the first question.',
      walk:
        'I would open by saying the hard part is not the network, it is that two divergent copies must converge without losing anybody’s writing — so I will weight state and concurrency heavily and treat connectivity as the easy half. Happy path: edit offline, reconnect, and the change is on the server and on the other device. Boundaries: a device offline for a minute, for a month, and a queue larger than one request. State is the bulk — edits queue in order and apply exactly once, a delete on one device against an edit on another, an edit to a note deleted on the server, and a device restored from a backup that is behind. Concurrency is the same note edited on two devices offline, resolved by the stated rule, with the losing version recoverable. Failure: sync interrupted halfway must not leave a partial document, and a repeated failure must not spin the battery flat. Compatibility is the one people forget — an old client version and a schema that changed while the device was away. And I would flag the device clock explicitly, because ordering by it means a wrong clock makes one device always win.',
      prioritise:
        'Three: no edit ever silently lost when two devices diverge, because that is the promise the whole feature makes; exactly-once application of a queued change, since duplicates are what a naive retry produces; and the month-offline queue, because it is where the schema and tombstone cases live. All three are testable against a controlled transport with a seeded queue — none of them requires actually turning wifi off.',
      close:
        'And I would want conflict counts and sync failure rates reported from the device, because the failure mode here is a user whose notes quietly stopped syncing weeks ago, and nobody finds that out from the server side.',
    },
    expected: [
      { id: 'sy-happy-1', dimension: 'happy', tier: 'must', text: 'Edit offline, reconnect, and the change reaches the server and the user’s other device.' },
      { id: 'sy-eq-1', dimension: 'equivalence', tier: 'must', text: 'Create, edit and delete each sync correctly — deletes are the ones that come back from the dead.' },
      { id: 'sy-bound-1', dimension: 'boundary', tier: 'must', text: 'Offline for a minute, for a month, and with a queue too large for one request.' },
      { id: 'sy-bound-2', dimension: 'boundary', tier: 'credit', text: 'A note at the maximum size, and a queue at whatever local storage limit exists.' },
      { id: 'sy-neg-1', dimension: 'negative', tier: 'must', text: 'An edit to a note deleted on the server, and a delete of a note already deleted elsewhere.' },
      { id: 'sy-neg-2', dimension: 'negative', tier: 'credit', text: 'A corrupted local queue — recovered or discarded with a warning, never crashing on every launch.' },
      { id: 'sy-state-1', dimension: 'state', tier: 'must', text: 'Queued changes apply in order and exactly once — a retry must not duplicate a note.' },
      { id: 'sy-state-2', dimension: 'state', tier: 'must', text: 'No edit is ever silently lost: the losing side of a conflict is recoverable, not discarded.' },
      { id: 'sy-state-3', dimension: 'state', tier: 'must', text: 'A device restored from an old backup does not resurrect deleted notes or overwrite newer ones.' },
      { id: 'sy-state-4', dimension: 'state', tier: 'credit', text: 'Signing out with unsynced changes warns rather than discarding them.' },
      { id: 'sy-conc-1', dimension: 'concurrency', tier: 'must', text: 'The same note edited on two offline devices resolves by the stated rule, deterministically.' },
      { id: 'sy-conc-2', dimension: 'concurrency', tier: 'credit', text: 'A device with a wrong clock cannot win every conflict forever — ordering is not the device’s to decide.' },
      { id: 'sy-fail-1', dimension: 'failure', tier: 'must', text: 'Sync interrupted halfway leaves no partial document, and resumes rather than restarting.' },
      { id: 'sy-fail-2', dimension: 'failure', tier: 'credit', text: 'Repeated failures back off instead of retrying in a loop that drains the battery.' },
      { id: 'sy-scale-1', dimension: 'scale', tier: 'credit', text: 'Ten thousand notes on a first sync, over a slow connection, without blocking the app.' },
      { id: 'sy-sec-1', dimension: 'security', tier: 'must', text: 'The local queue is a copy of the user’s data on the device — it must be protected and cleared on sign-out.' },
      { id: 'sy-compat-1', dimension: 'compat', tier: 'must', text: 'A client version from before a schema change syncs without corrupting data or being permanently stuck.' },
      { id: 'sy-obs-1', dimension: 'observability', tier: 'must', text: 'Conflict counts and sync failures reported from the device — nobody finds a stalled sync from the server side.' },
    ],
  },

  {
    id: 'notify',
    category: 'data',
    title: 'A notification fan-out',
    prompt:
      'When someone posts in a group, every member gets a notification — push, email, or both. Test it.',
    clarifiers: [
      'Who decides the channel — a per-user preference, or the type of event?',
      'Are notifications batched or digested, or is it one per event?',
      'How large can a group be, and is the fan-out synchronous with the post?',
      'What are the unsubscribe and quiet-hours rules, and are they legally binding?',
    ],
    followUps: [
      {
        question: 'The job crashes halfway through a group of 10,000. What happens on the retry?',
        answer:
          'Either the first 5,000 get a second notification, or the last 5,000 never get one — and which of those you get depends on whether progress is recorded per recipient rather than per job. So the test seeds a group, fails the job deliberately partway, reruns it, and asserts every member has exactly one notification. That is the single most valuable test here, because at fan-out scale the partial failure is not an edge case, it is Tuesday.',
      },
      {
        question: 'Why is unsubscribe worth more test effort than it looks?',
        answer:
          'Because it is legally binding in most jurisdictions and the failure is a fine rather than a bug report. It also has a delivery race: someone unsubscribes while a batch is already queued, and the check has to happen at send time rather than at queue time or they get one more after opting out. I would test the unsubscribe link on an old email, opting out mid-batch, and the preference actually being honoured per channel rather than globally.',
      },
      {
        question: 'How do you test that nobody gets notified about content they cannot see?',
        answer:
          'By making the permission check part of the fan-out test rather than assuming the group membership list is right. Remove a member, post, and assert they get nothing — including the case where the removal lands after the post but before the send. And check the payload itself: a push notification preview showing message content on a lock screen leaks it to anyone holding the phone, which is a real disclosure even when the recipient was legitimate.',
      },
    ],
    modelAnswer: {
      open:
        'Who chooses the channel — a per-user preference or the event type? Is it one notification per event or batched into a digest? How big can a group get, and is the fan-out inside the request that creates the post? And what are the unsubscribe and quiet-hours rules, since those are usually legal rather than optional.',
      walk:
        'I would frame this as a job rather than a feature: one input event becomes ten thousand side effects, so partial failure is the normal case and that is where I would spend the time. Happy path is a post producing exactly one notification per eligible member on their chosen channel. Equivalence over preferences — push only, email only, both, none, and quiet hours active. Boundaries: a group of one, a group at the maximum size, the poster themselves who should not be notified, and a member who joined a second before the post. State and failure together are the core — the job crashing halfway must not double-notify the first half or drop the second, so progress has to be per recipient. Concurrency is two posts at once and a member leaving mid-fan-out. Scale is the real constraint: a large group cannot fan out inside the request that created the post, and the notification burst must not overwhelm the mail provider. Security is that nobody is notified about content they cannot see, and that a push preview does not put private content on a lock screen.',
      prioritise:
        'Three: exactly-once delivery across a job that fails halfway, because duplicates and drops are both guaranteed otherwise; unsubscribe and quiet hours honoured at send time rather than at queue time, because that one is legal; and a removed member receiving nothing, including when the removal races the post. All three are integration tests around the job with a fake channel provider, and they need a seeded group large enough for the partial-failure case to be real.',
      close:
        'And I would want sent, delivered, bounced and unsubscribed as separate numbers per channel, because a channel that silently stopped delivering looks identical to a quiet week unless somebody is watching the ratio.',
    },
    expected: [
      { id: 'nt-happy-1', dimension: 'happy', tier: 'must', text: 'A post produces exactly one notification per eligible member, on the channel they chose.' },
      { id: 'nt-eq-1', dimension: 'equivalence', tier: 'must', text: 'Push only, email only, both, and none — plus a member with quiet hours currently active.' },
      { id: 'nt-bound-1', dimension: 'boundary', tier: 'must', text: 'A group of one, a group at the maximum size, and the poster themselves, who should not be notified.' },
      { id: 'nt-bound-2', dimension: 'boundary', tier: 'credit', text: 'A member who joined a second before the post, and one who joined a second after.' },
      { id: 'nt-neg-1', dimension: 'negative', tier: 'must', text: 'An invalid or bounced email address, and a stale push token — one bad recipient must not fail the batch.' },
      { id: 'nt-neg-2', dimension: 'negative', tier: 'credit', text: 'Post content that breaks the template: very long text, emoji, right-to-left, an unescaped placeholder.' },
      { id: 'nt-state-1', dimension: 'state', tier: 'must', text: 'The job fails halfway and reruns: every member ends with exactly one notification, not two and not none.' },
      { id: 'nt-state-2', dimension: 'state', tier: 'must', text: 'Unsubscribe and quiet hours are honoured at send time, not at queue time — the difference is one unwanted message.' },
      { id: 'nt-state-3', dimension: 'state', tier: 'credit', text: 'Batching or digesting collapses several events into one message without dropping any of them.' },
      { id: 'nt-conc-1', dimension: 'concurrency', tier: 'must', text: 'A member removed from the group while the fan-out is running receives nothing.' },
      { id: 'nt-conc-2', dimension: 'concurrency', tier: 'credit', text: 'Two posts at the same instant do not interleave into one confusing digest.' },
      { id: 'nt-fail-1', dimension: 'failure', tier: 'must', text: 'The push or mail provider is down: notifications queue and retry rather than being lost.' },
      { id: 'nt-fail-2', dimension: 'failure', tier: 'credit', text: 'A provider rate-limiting us causes backoff rather than a cascade of failed sends.' },
      { id: 'nt-scale-1', dimension: 'scale', tier: 'must', text: 'A group of ten thousand does not fan out inside the request that created the post.' },
      { id: 'nt-scale-2', dimension: 'scale', tier: 'credit', text: 'A burst across many groups at once stays within the provider’s throughput.' },
      { id: 'nt-sec-1', dimension: 'security', tier: 'must', text: 'Nobody is notified about content they are not allowed to see.' },
      { id: 'nt-sec-2', dimension: 'security', tier: 'must', text: 'A push preview does not put private message content on a locked screen.' },
      { id: 'nt-obs-1', dimension: 'observability', tier: 'must', text: 'Sent, delivered, bounced and unsubscribed tracked per channel — a dead channel looks like a quiet week otherwise.' },
    ],
  },

  {
    id: 'recurring',
    category: 'data',
    title: 'Recurring calendar events',
    prompt:
      'A calendar supports repeating events — every Tuesday, monthly on the 30th, every weekday. Test it.',
    clarifiers: [
      'Can a single occurrence be edited or deleted without affecting the series?',
      'What happens to future occurrences when the series rule is changed?',
      'Are attendees in different timezones, and does the event follow the organiser’s zone?',
      'Is there an end condition — a date, a count, or forever?',
    ],
    followUps: [
      {
        question: 'A weekly 9am meeting, organiser in London, attendee in New York. The clocks change a week apart. What happens?',
        answer:
          'For a week the gap between the two zones is four hours instead of five, so the meeting moves for one of them — it is 9am London and 4am or 5am New York depending on the week. That is correct behaviour, not a bug, and the test asserts the event stays anchored to the organiser’s local 9am while the other attendee’s displayed time shifts. Getting it backwards — anchoring to UTC — makes the organiser’s recurring meeting drift by an hour twice a year, which is the version people actually report.',
      },
      {
        question: 'Monthly on the 31st. What do you assert for February?',
        answer:
          'Whatever the rule says, explicitly, because there are three defensible answers: skip the month entirely, clamp to the 28th or 29th, or move to 1 March. They produce visibly different calendars, and the common bug is a date library silently rolling 31 February forward to the 3rd. I would test all twelve months of a year plus a leap year, since that is a cheap loop and it catches the drift where the series clamps once and then never returns to the 31st.',
      },
      {
        question: 'Which of these could you test without a UI at all?',
        answer:
          'Essentially all of the hard ones. Expanding a recurrence rule into occurrences over a range is a pure function of the rule, a window and a timezone — so DST, leap days, month clamping, end conditions and exception handling are all unit tests running in milliseconds. What needs a browser is that the grid renders the occurrences and that editing one offers the this-versus-all choice. The ratio matters here: dozens of arithmetic cases below, two or three journeys above.',
      },
    ],
    modelAnswer: {
      open:
        'Can one occurrence be edited or deleted on its own? What happens to future occurrences when the rule changes? Are attendees in other timezones, and does the event follow the organiser’s zone? And is there an end — a date, a count, or forever? I would ask all four, because each one adds a whole family of cases.',
      walk:
        'The framing is that this is date arithmetic wearing a UI, so I would say that and put nearly all the weight on boundaries and state. Happy path: a weekly event appears on the right days for the right span. Equivalence over rule types — daily, weekly on several days, monthly by date, monthly by weekday, yearly, every weekday. Boundaries are the substance: monthly on the 31st in a 30-day month and in February, 29 February yearly in a non-leap year, and the end condition landing exactly on or one short of an occurrence. Then the two clock transitions — an event during the hour that does not exist, and one during the hour that happens twice — plus the case where two zones change on different dates, which shifts the gap for a week. State is exceptions: editing one occurrence, then changing the series, and whether that edit survives; deleting one occurrence versus the series; and moving the series after some occurrences have already happened. Scale is an event repeating forever, which cannot be materialised. Accessibility and locale matter because week start and date format vary.',
      prioritise:
        'Three: monthly-on-the-31st across a full year including February, because it is silently wrong and drifts; the DST-transition occurrences in both directions, because the meeting simply happens at the wrong time; and an edited single occurrence surviving a change to the series, because that is user data being destroyed by a bulk operation. All three are unit tests over an expansion function with an injected clock and zone — fast, and there should be dozens of them.',
      close:
        'And I would want the rule stored with the timezone it was created in rather than expanded to timestamps, because otherwise the first DST change silently rewrites everyone’s calendar and there is no record of what the user actually asked for.',
    },
    expected: [
      { id: 'rc-happy-1', dimension: 'happy', tier: 'must', text: 'A weekly event appears on exactly the right days across several months.' },
      { id: 'rc-eq-1', dimension: 'equivalence', tier: 'must', text: 'Daily, weekly on several days, monthly by date, monthly by weekday, yearly, and every weekday.' },
      { id: 'rc-bound-1', dimension: 'boundary', tier: 'must', text: 'Monthly on the 31st through a 30-day month and February — skip, clamp or roll, but by the stated rule.' },
      { id: 'rc-bound-2', dimension: 'boundary', tier: 'must', text: 'A clamped series does not then drift: after February it returns to the 31st rather than staying on the 28th.' },
      { id: 'rc-bound-3', dimension: 'boundary', tier: 'must', text: '29 February yearly in a non-leap year, and the last day of the month rule versus the 30th.' },
      { id: 'rc-bound-4', dimension: 'boundary', tier: 'must', text: 'An occurrence in the hour that does not exist on a clocks-forward morning, and in the hour that happens twice.' },
      { id: 'rc-bound-5', dimension: 'boundary', tier: 'credit', text: 'An end condition landing exactly on an occurrence, and one occurrence short of it.' },
      { id: 'rc-neg-1', dimension: 'negative', tier: 'must', text: 'A rule with no valid occurrences, an end date before the start, and an interval of zero.' },
      { id: 'rc-state-1', dimension: 'state', tier: 'must', text: 'Editing one occurrence then changing the series: the exception survives, or is discarded, by the stated rule.' },
      { id: 'rc-state-2', dimension: 'state', tier: 'must', text: 'Deleting one occurrence versus the whole series, with the this-or-all choice offered every time.' },
      { id: 'rc-state-3', dimension: 'state', tier: 'must', text: 'Moving a series after some occurrences have already happened does not rewrite the past ones.' },
      { id: 'rc-state-4', dimension: 'state', tier: 'credit', text: 'An attendee declining one occurrence stays declined for that one only.' },
      { id: 'rc-conc-1', dimension: 'concurrency', tier: 'credit', text: 'Two people editing the same series at once — one wins, and the other is told rather than overwritten.' },
      { id: 'rc-fail-1', dimension: 'failure', tier: 'credit', text: 'A timezone database update changing a zone’s rules does not corrupt series already created.' },
      { id: 'rc-scale-1', dimension: 'scale', tier: 'must', text: 'An event repeating forever is expanded over a window rather than materialised, and a decade view still renders.' },
      { id: 'rc-sec-1', dimension: 'security', tier: 'credit', text: 'Editing a series you were only invited to is refused, rather than changing it for everyone.' },
      { id: 'rc-compat-1', dimension: 'compat', tier: 'must', text: 'Two attendees whose zones change on different dates: the gap between them shifts for a week, and that is correct.' },
      { id: 'rc-compat-2', dimension: 'compat', tier: 'credit', text: 'Locales where the week starts on a different day, and non-Gregorian calendar display.' },
      { id: 'rc-obs-1', dimension: 'observability', tier: 'credit', text: 'The rule and its timezone are stored, not just expanded timestamps — otherwise a DST change silently rewrites calendars.' },
    ],
  },

  {
    id: 'atm',
    category: 'physical',
    title: 'An ATM',
    prompt:
      'How would you test a cash machine? Take the whole thing — card in, cash out.',
    clarifiers: [
      'Which functions — withdrawal only, or deposits, transfers and balance too?',
      'Is it online to the bank for every transaction, or can it operate offline with limits?',
      'Which denominations does it hold, and can it dispense partial amounts?',
      'Is it in a branch lobby or on a street, which changes the security cases entirely?',
    ],
    followUps: [
      {
        question: 'The account was debited but no cash came out. Walk me through it.',
        answer:
          'That is the case the whole system exists to get right. The order of operations has to be that cash is dispensed before the debit is committed, or that an undispensed transaction is automatically reversed — and there must be a reconciliation between what the cash counter says it handed out and what the ledger says it debited. I would test it by making the dispenser fail after authorisation and asserting the customer’s balance is restored without them phoning anyone, then assert the discrepancy appears in the reconciliation report either way.',
      },
      {
        question: 'What do you test about the card being taken back?',
        answer:
          'The timeout and what happens around it. If a customer walks away, the machine must retain the card rather than leaving it hanging out for the next person — and the retention has to be logged so the branch can return it. Then the boundary: a card grabbed at the exact moment retention begins must not be torn or half-retained. And I would test the cash equivalent, since money left uncollected has the same problem and a worse consequence.',
      },
      {
        question: 'Which failure would you never ship without covering?',
        answer:
          'Dispensing more than was requested or more than was debited, because it is unrecoverable money and it scales — a note-counting error repeats for every customer until someone notices the till is short. Right behind it is the PIN reaching anywhere it should not: a log, a screen visible to the queue, or a receipt. Those two are the ones I would want tested on real hardware every release rather than only in simulation.',
      },
    ],
    modelAnswer: {
      open:
        'Which functions are in scope — withdrawal only, or deposits and transfers too? Is it online for every transaction or can it work offline with limits? What denominations, and can it dispense partial amounts? And is it a lobby machine or a street one, because the physical security cases are completely different.',
      walk:
        'I would say first that this is a system where a bug moves money, so I am going to weight failure, reconciliation and security far above the interface. Happy path: card in, correct PIN, request an amount it can make from the notes it holds, cash out, balance debited once, card returned. Equivalence across card types and account states — a valid card, expired, foreign, blocked, an account overdrawn or frozen. Boundaries are dense: the minimum and maximum withdrawal, an amount the denominations cannot make, the daily limit at and just over, the balance to the penny, and the last note in the cassette. Misuse: wrong PIN to the retry limit, a card left behind, cash left uncollected, buttons pressed during dispensing. Failure is the heart of it — the dispenser jamming after authorisation, the network dropping mid-transaction, power loss with the cassette open — and every one of those has to reconcile so the customer is not out of pocket. Security spans PIN handling, card skimming, shoulder surfing on the screen, and the machine being physically attacked.',
      prioritise:
        'Three, all of them money-or-safety: debited-but-not-dispensed reversing automatically; never dispensing more than requested or debited; and the PIN never reaching a log, a receipt or a screen anyone else can read. The first two need hardware-in-the-loop tests with a dispenser that can be made to fail on demand — which means the dispenser has to be controllable from a test rig, and that is a design ask I would make early.',
      close:
        'And end-to-end reconciliation as the standing check: what the cassette counted out against what the ledger debited, per machine per day. A machine that is quietly a hundred short every day is invisible in any single transaction and obvious in that report.',
    },
    expected: [
      { id: 'at-happy-1', dimension: 'happy', tier: 'must', text: 'Card in, correct PIN, cash out, balance debited exactly once, card and receipt returned.' },
      { id: 'at-eq-1', dimension: 'equivalence', tier: 'must', text: 'Valid, expired, foreign, and blocked cards; accounts that are overdrawn, frozen, or newly opened.' },
      { id: 'at-bound-1', dimension: 'boundary', tier: 'must', text: 'The minimum and maximum withdrawal, and one either side of each.' },
      { id: 'at-bound-2', dimension: 'boundary', tier: 'must', text: 'An amount the machine cannot make from the notes it holds — £35 from £20s and £50s.' },
      { id: 'at-bound-3', dimension: 'boundary', tier: 'must', text: 'The daily limit at, just under and just over, including across midnight.' },
      { id: 'at-bound-4', dimension: 'boundary', tier: 'must', text: 'A withdrawal equal to the balance to the penny, and one a penny over.' },
      { id: 'at-neg-1', dimension: 'negative', tier: 'must', text: 'Wrong PIN up to and beyond the retry limit, and whether the counter resets on a correct entry.' },
      { id: 'at-neg-2', dimension: 'negative', tier: 'must', text: 'A card left in, cash left uncollected, and buttons pressed while the machine is dispensing.' },
      { id: 'at-neg-3', dimension: 'negative', tier: 'credit', text: 'A damaged or foreign card the reader cannot parse, and a card inserted the wrong way round.' },
      { id: 'at-state-1', dimension: 'state', tier: 'must', text: 'A cancelled transaction leaves the balance untouched and returns the card.' },
      { id: 'at-state-2', dimension: 'state', tier: 'must', text: 'The machine returns to a clean state for the next customer — no session, balance or receipt carried over.' },
      { id: 'at-state-3', dimension: 'state', tier: 'credit', text: 'The card is retained on timeout rather than left protruding, and the retention is logged.' },
      { id: 'at-conc-1', dimension: 'concurrency', tier: 'must', text: 'The same account used at two machines at once cannot exceed the daily limit between them.' },
      { id: 'at-fail-1', dimension: 'failure', tier: 'must', text: 'Debited but not dispensed: the transaction reverses automatically, without the customer having to phone anyone.' },
      { id: 'at-fail-2', dimension: 'failure', tier: 'must', text: 'Network loss mid-transaction, and power loss while the cassette is open — both must reconcile.' },
      { id: 'at-fail-3', dimension: 'failure', tier: 'must', text: 'Never dispense more than requested or more than debited — a counting error repeats for every customer.' },
      { id: 'at-scale-1', dimension: 'scale', tier: 'credit', text: 'The cassette emptying on a Friday night: refuse cleanly and report low cash before it runs out.' },
      { id: 'at-sec-1', dimension: 'security', tier: 'must', text: 'The PIN never reaches a log, a receipt, or a screen the queue can read.' },
      { id: 'at-sec-2', dimension: 'security', tier: 'must', text: 'Physical attack and tampering: skimmers on the reader, a camera over the keypad, the safe itself.' },
      { id: 'at-compat-1', dimension: 'compat', tier: 'must', text: 'Accessibility: audio jack for blind users, keypad height and contrast, and a language choice before the PIN.' },
      { id: 'at-obs-1', dimension: 'observability', tier: 'must', text: 'Daily reconciliation of cash counted out against the ledger — a machine quietly short is invisible transaction by transaction.' },
    ],
  },

  {
    id: 'vending',
    category: 'physical',
    title: 'A vending machine',
    prompt:
      'A vending machine takes coins, notes and cards, and dispenses a snack with change. Test it.',
    clarifiers: [
      'Which payment methods, and can they be combined in one purchase?',
      'Does it give change, and what happens when it runs out of a coin?',
      'Is it network-connected for card payment, and what happens when the network drops?',
      'Can it hold different prices per slot, and are prices changed remotely?',
    ],
    followUps: [
      {
        question: 'It cannot make the right change. What should it do?',
        answer:
          'Refuse before taking the money, not after. The correct behaviour is to know its own coin stock and either display exact-change-only or decline the selection up front — taking a note and then discovering it cannot give change leaves the customer arguing with a machine. So the test is to load a coin stock that cannot make change for a given purchase and assert the machine refuses at selection time, then assert the money is returned intact if it somehow got that far.',
      },
      {
        question: 'The item gets stuck on the spiral. What do you test?',
        answer:
          'Detection and refund. A machine that has taken payment and delivered nothing must know it: a drop sensor is the usual mechanism, and the test is to block delivery and assert the machine refunds or credits rather than counting the sale. Then the mirror case, which is the sensor failing so that every purchase reads as undelivered and the machine refunds everyone — a sensor that fails open is more expensive than one that fails closed, so I would test both failure directions.',
      },
      {
        question: 'What is the equivalent of a security test here?',
        answer:
          'Everything that gets you free product or free money: a coin on a string, a slug the same weight as a real coin, forcing the flap, tilting or shaking the machine into dispensing, and the maintenance keypad code being a default. On the card side, tampering with the reader. It is worth saying out loud that the attacker for a vending machine is physically present and unhurried, which is a different threat model from anything on the web.',
      },
    ],
    modelAnswer: {
      open:
        'Which payment methods, and can they be mixed in one purchase? Does it give change, and what happens when it runs out of a particular coin? Is it network-connected for cards, and what does it do when the network drops? And are prices per slot, set remotely?',
      walk:
        'I would say up front that this is a state machine attached to money and to moving parts, so my cases cluster around transitions, change-making and physical failure rather than around the interface. Happy path: insert exact money, select, item drops, no change owed. Equivalence across payment types and slot states — stocked, empty, disabled. Boundaries are largely about money: paying exactly, a penny under, a penny over, the largest note accepted, and the coin stock at the point where change becomes impossible. Misuse is where this one gets interesting: two selections at once, selecting before paying, pressing during dispensing, and the classic coin-on-a-string. State: money inserted then cancelled must return in full, a partial amount left in the machine before the next customer, and the machine returning to idle after every path. Failure is the item stuck on the spiral, the dispenser detecting nothing dropped, and power loss mid-vend with money taken. Then security, which here is physical — slugs, forcing the flap, a default maintenance code — and the customer standing in front of the machine with all the time in the world.',
      prioritise:
        'Three: money taken and nothing dispensed, because it is theft from the customer’s point of view; change calculated or refused correctly against actual coin stock, because it is the most common real failure; and cancel returning the full amount, because it is the most common customer action after a mistake. The first two need a rig where the dispenser and the coin hopper can be made to fail deliberately, which is worth building rather than testing by hand.',
      close:
        'And telemetry per machine — stock levels, coin stock, failed vends, refunds — because the operator’s real question is which machine to visit, and a machine that has been refusing every purchase for three days is otherwise found only when someone complains.',
    },
    expected: [
      { id: 've-happy-1', dimension: 'happy', tier: 'must', text: 'Exact money in, select, item drops, no change owed, machine returns to idle.' },
      { id: 've-eq-1', dimension: 'equivalence', tier: 'must', text: 'Coins, notes and card; a stocked slot, an empty slot and a disabled one.' },
      { id: 've-bound-1', dimension: 'boundary', tier: 'must', text: 'Paying exactly, a penny under, and a penny over, with change owed to the penny.' },
      { id: 've-bound-2', dimension: 'boundary', tier: 'must', text: 'The coin stock at exactly the point where change becomes impossible.' },
      { id: 've-bound-3', dimension: 'boundary', tier: 'credit', text: 'The largest note accepted, and buying the last item in a slot.' },
      { id: 've-neg-1', dimension: 'negative', tier: 'must', text: 'A slug, a foreign coin, a coin on a string, and a torn or folded note.' },
      { id: 've-neg-2', dimension: 'negative', tier: 'must', text: 'Selecting before paying, selecting an empty slot, and two selections at once.' },
      { id: 've-neg-3', dimension: 'negative', tier: 'credit', text: 'Buttons pressed continuously, and a selection made while the spiral is still turning.' },
      { id: 've-state-1', dimension: 'state', tier: 'must', text: 'Cancel returns the full amount inserted, in usable denominations.' },
      { id: 've-state-2', dimension: 'state', tier: 'must', text: 'Money left in the machine by one customer is not silently spent by the next.' },
      { id: 've-state-3', dimension: 'state', tier: 'must', text: 'The machine returns to idle after every path — success, cancel, failure, timeout.' },
      { id: 've-conc-1', dimension: 'concurrency', tier: 'credit', text: 'A card payment authorising at the same moment the customer presses cancel.' },
      { id: 've-fail-1', dimension: 'failure', tier: 'must', text: 'The item sticks on the spiral: the machine detects it and refunds rather than counting the sale.' },
      { id: 've-fail-2', dimension: 'failure', tier: 'must', text: 'The drop sensor fails the other way and reports nothing delivered every time — refunding everyone is expensive too.' },
      { id: 've-fail-3', dimension: 'failure', tier: 'must', text: 'Power loss mid-vend with money taken: on restart, the customer is not simply out of pocket.' },
      { id: 've-fail-4', dimension: 'failure', tier: 'credit', text: 'The network drops during a card payment — authorised but not captured, or captured with no item.' },
      { id: 've-scale-1', dimension: 'scale', tier: 'credit', text: 'A busy machine at lunchtime: does the coin hopper run out of small change before the stock runs out?' },
      { id: 've-sec-1', dimension: 'security', tier: 'must', text: 'Free-product attacks: forcing the flap, tilting, and a default maintenance keypad code.' },
      { id: 've-compat-1', dimension: 'compat', tier: 'credit', text: 'Reachability of the keypad and coin slot from a wheelchair, and readable labels in low light.' },
      { id: 've-obs-1', dimension: 'observability', tier: 'must', text: 'Per-machine telemetry — stock, coin stock, failed vends, refunds — so the operator knows which machine to visit.' },
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
