/**
 * Twenty-minute build exercises.
 *
 * WHY THIS EXISTS. The SDET build round is not an algorithm round. Nobody is asking for Dijkstra;
 * they hand you a small piece of test infrastructure — a wait, a retry, a rate limiter, a runner —
 * and watch how you build it. The exercises are small enough that the code is not the signal. What
 * is being read is which edge cases you volunteer before being asked, and whether the thing you
 * wrote is testable without sleeping.
 *
 * That is why every solution here takes its clock or its sleep as a parameter. It is the single
 * habit that most separates people who have maintained a suite from people who have written one.
 *
 * HOW IT IS BUILT. Each solution below is the exact source that passed the assertions listed in
 * its `checks` — extracted from the file that ran, not retyped. If a solution is wrong, its
 * checks were wrong first, which is a much harder mistake to make silently.
 */

export interface BuildExercise {
  id: string;
  title: string;
  /** The task as it is handed to you. */
  prompt: string;
  /** What is actually being read while you write it. */
  assessed: string;
  solution: string;
  /** Assertions this exact source passed. */
  checks: string[];
  /** What they ask once it works. */
  followUps: string[];
  /** The ways it goes wrong, in rough order of how often. */
  mistakes: string[];
}

export const BUILD_EXERCISES: BuildExercise[] = [
  {
    id: "waitfor",
    title: "waitFor(predicate, options)",
    prompt: "Write the polling helper every UI suite has: call a predicate until it returns something truthy, then return that value; give up after a timeout.",
    assessed: "Whether you have written a real wait before. It is four lines of logic and six ways to get it wrong, and the interviewer is watching for the deadline being computed once, the predicate being awaited, and a timeout message that says what was actually happening.",
    solution: "export async function waitFor(predicate, { timeout = 5000, interval = 50 } = {}) {\n  const deadline = Date.now() + timeout;\n  let lastError;\n  for (;;) {\n    try {\n      const value = await predicate();\n      if (value) return value;\n    } catch (err) {\n      lastError = err;\n    }\n    if (Date.now() >= deadline) {\n      throw new Error(\n        `waitFor timed out after ${timeout}ms` +\n          (lastError ? `; last error: ${lastError.message}` : '')\n      );\n    }\n    await new Promise((r) => setTimeout(r, Math.min(interval, deadline - Date.now())));\n  }\n}",
    checks: ["waitFor returns the value once truthy", "waitFor throws on timeout and reports the last error", "waitFor checks once before sleeping"],
    followUps: [
      "Why not just sleep for the timeout and check once at the end?",
      "The predicate throws because the element does not exist yet. What should happen?",
      "How would you test this without your tests taking five seconds?",
      "The caller wants the element, not a boolean. Does your signature allow that?",
    ],
    mistakes: [
      "Recomputing the deadline inside the loop, so a slow predicate makes the timeout unbounded.",
      "Calling the predicate without awaiting it, which makes every async check truthy immediately — a Promise is always truthy.",
      "Sleeping before the first check, which adds a full interval to every single call.",
      "Letting a predicate throw out of the helper, so a not-yet-rendered element becomes an error instead of a retry.",
      "A timeout message that says only \"timed out\", discarding the last error and with it the reason.",
    ],
  },
  {
    id: "retry",
    title: "retry(fn, options)",
    prompt: "Retry a failing operation with exponential backoff and jitter, giving up after a fixed number of attempts.",
    assessed: "Whether you know that retrying the wrong thing is worse than not retrying. The backoff maths is the easy half; the question underneath is which errors are safe to retry, and whether you say the word idempotent without being prompted.",
    solution: "export async function retry(\n  fn,\n  {\n    attempts = 4,\n    baseMs = 100,\n    capMs = 2000,\n    isRetryable = () => true,\n    sleep = (ms) => new Promise((r) => setTimeout(r, ms)),\n  } = {}\n) {\n  for (let attempt = 1; ; attempt++) {\n    try {\n      return await fn(attempt);\n    } catch (err) {\n      if (attempt >= attempts || !isRetryable(err)) throw err;\n      const ceiling = Math.min(capMs, baseMs * 2 ** (attempt - 1));\n      await sleep(Math.random() * ceiling);\n    }\n  }\n}",
    checks: ["retry stops at attempts and rethrows", "retry does not retry a non-retryable error", "retry returns on a later attempt"],
    followUps: [
      "Which errors would you retry, and which would you never retry?",
      "Why jitter? What goes wrong with plain exponential backoff?",
      "The request timed out. Do you know whether it was applied?",
      "How does this interact with the caller’s own timeout?",
    ],
    mistakes: [
      "Retrying everything, so a 400 is attempted four times and a duplicate-charge bug gets four chances.",
      "No jitter, so every client that failed together retries together and the thundering herd knocks the service over again.",
      "Unbounded growth with no cap, which turns the fourth attempt into a two-minute wait.",
      "Retrying a non-idempotent write without an idempotency key — the retry is the bug.",
      "A hardcoded sleep, which makes the function untestable; taking sleep as an option is what lets the checks run instantly.",
    ],
  },
  {
    id: "ratelimit",
    title: "A token-bucket rate limiter",
    prompt: "Allow a burst of N operations, then refill at a steady rate. Return whether the caller may proceed.",
    assessed: "Whether you can hold a small piece of state correctly, and whether you take the clock as a parameter. Injecting now() is the tell — it is the difference between a limiter you can test in microseconds and one whose tests sleep.",
    solution: "export function tokenBucket({ capacity, refillPerSec, now = () => Date.now() }) {\n  let tokens = capacity;\n  let last = now();\n  return function take(count = 1) {\n    const t = now();\n    tokens = Math.min(capacity, tokens + ((t - last) / 1000) * refillPerSec);\n    last = t;\n    if (tokens < count) return false;\n    tokens -= count;\n    return true;\n  };\n}",
    checks: ["token bucket allows a burst then refuses", "token bucket refills over time and never exceeds capacity"],
    followUps: [
      "Why a token bucket rather than counting requests per minute?",
      "What happens at the boundary of a fixed window, and does this avoid it?",
      "How would you test the refill without waiting a second?",
      "Two processes, one limit. What changes?",
    ],
    mistakes: [
      "Reading Date.now() directly, so every test has to sleep and the refill path goes untested.",
      "Refilling on a timer instead of computing tokens lazily on access, which burns a wakeup per bucket per tick.",
      "Forgetting to cap at capacity, so an idle bucket accumulates an unlimited burst.",
      "A fixed window instead of a bucket, which lets twice the limit through across a window boundary.",
    ],
  },
  {
    id: "deepequal",
    title: "deepEqual(a, b)",
    prompt: "Compare two values structurally. This is the core of every assertion library, so you are being asked to build the thing you use all day.",
    assessed: "Edge-case instinct. Anybody can write the recursion; the interesting part is which cases you volunteer before being asked — NaN, -0, Date, differing key counts, and a cycle that would otherwise blow the stack.",
    solution: "export function deepEqual(a, b, seen = new Map()) {\n  if (Object.is(a, b)) return true;\n  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;\n  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;\n  if (a instanceof Date) return a.getTime() === b.getTime();\n  if (seen.get(a) === b) return true;\n  seen.set(a, b);\n  const ka = Reflect.ownKeys(a);\n  const kb = Reflect.ownKeys(b);\n  if (ka.length !== kb.length) return false;\n  return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k], seen));\n}",
    checks: ["deepEqual handles NaN, dates, nesting and cycles"],
    followUps: [
      "What does your function say about NaN, and what should it say?",
      "Is 0 equal to -0 here? Which answer does an assertion library want?",
      "Two objects with the same keys but one has an explicit undefined. Equal?",
      "What happens on a cyclic structure?",
    ],
    mistakes: [
      "Using === at the leaves, which reports NaN as unequal to itself — exactly backwards for an assertion.",
      "Using Object.is everywhere without thinking, which makes 0 and -0 unequal; correct here, but it needs to be a decision rather than an accident.",
      "Comparing only the first object’s keys, so { a: 1 } equals { a: 1, b: 2 }.",
      "No cycle guard, so a self-referencing fixture is a stack overflow rather than a test failure.",
      "Treating an array as equal to an object with the same numeric keys.",
    ],
  },
  {
    id: "runner",
    title: "A minimal test runner",
    prompt: "Implement describe, it and a run() that executes everything and reports what passed. Async tests must work.",
    assessed: "Whether you understand the tool you use every day. The registration-then-execution split is the insight: describe runs immediately to build a tree, and nothing executes until run() is called.",
    solution: "export function createRunner() {\n  const tests = [];\n  const stack = [];\n  const describe = (name, fn) => {\n    stack.push(name);\n    fn();\n    stack.pop();\n  };\n  const it = (name, fn) => tests.push({ name: [...stack, name].join(' > '), fn });\n  async function run() {\n    const results = [];\n    for (const t of tests) {\n      const started = Date.now();\n      try {\n        await t.fn();\n        results.push({ name: t.name, ok: true, ms: Date.now() - started });\n      } catch (err) {\n        results.push({ name: t.name, ok: false, ms: Date.now() - started, error: err.message });\n      }\n    }\n    return {\n      results,\n      passed: results.filter((r) => r.ok).length,\n      failed: results.filter((r) => !r.ok).length,\n    };\n  }\n  return { describe, it, run };\n}",
    checks: ["runner nests names, runs async and counts both sides"],
    followUps: [
      "Why does describe run immediately but it() not?",
      "A test returns a promise that rejects. Does your runner notice?",
      "How would you add beforeEach?",
      "How would you run these in parallel, and what breaks when you do?",
    ],
    mistakes: [
      "Executing tests as they are registered, which makes describe order and execution order the same thing and rules out filtering, retries or parallelism.",
      "Not awaiting the test function, so every async failure is an unhandled rejection and the run reports green.",
      "try/catch without recording the error message, leaving a failure count and no way to know what failed.",
      "A single flat list of names, so two tests called \"works\" in different describes are indistinguishable in the output.",
    ],
  },
  {
    id: "flaky",
    title: "Find the flaky tests",
    prompt: "Given a log of test runs — commit, test name, pass or fail — identify which tests are flaky and rank them.",
    assessed: "Whether you know what flaky means. A test that fails on one commit and passes on another is not flaky, it is a regression that got fixed. Flaky is both outcomes on the same commit, and grouping by the right key is the whole exercise.",
    solution: "export function findFlaky(runs) {\n  const byKey = new Map();\n  for (const r of runs) {\n    const key = `${r.commit} ${r.test}`;\n    if (!byKey.has(key)) byKey.set(key, { commit: r.commit, test: r.test, pass: 0, fail: 0 });\n    byKey.get(key)[r.status === 'pass' ? 'pass' : 'fail']++;\n  }\n  const flaky = new Map();\n  for (const e of byKey.values()) {\n    if (e.pass > 0 && e.fail > 0) {\n      const cur = flaky.get(e.test) ?? { test: e.test, commits: 0, runs: 0, failures: 0 };\n      cur.commits++;\n      cur.runs += e.pass + e.fail;\n      cur.failures += e.fail;\n      flaky.set(e.test, cur);\n    }\n  }\n  return [...flaky.values()]\n    .map((f) => ({ ...f, failureRate: +(f.failures / f.runs).toFixed(3) }))\n    .sort((a, b) => b.failureRate - a.failureRate || a.test.localeCompare(b.test));\n}",
    checks: ["flaky detector needs both outcomes on one commit"],
    followUps: [
      "A test failed yesterday and passes today. Is it flaky?",
      "How would you rank these so somebody knows what to fix first?",
      "How many runs before you trust the rate?",
      "What do you do with the top one — quarantine, delete, or fix?",
    ],
    mistakes: [
      "Grouping by test alone, which labels every fixed regression as flaky and buries the real ones.",
      "Any failure counting as flake, which is the same mistake in a different shape.",
      "Ranking by failure count rather than rate, so the test that runs most often always wins.",
      "Reporting a rate from two runs as though it meant something.",
    ],
  },
  {
    id: "factory",
    title: "A test-data builder",
    prompt: "Build valid fixtures with sensible defaults, letting each test override only the field it cares about.",
    assessed: "Whether your tests read as intent. This is small, and the reason it gets asked is that shared mutable fixtures are the most common cause of order-dependent suites — the interviewer wants to hear you say each call returns a fresh object.",
    solution: "export function defineFactory(defaults) {\n  let seq = 0;\n  return function build(overrides = {}) {\n    seq++;\n    const base = typeof defaults === 'function' ? defaults(seq) : defaults;\n    return { ...base, ...overrides };\n  };\n}",
    checks: ["factory applies overrides and keeps ids unique"],
    followUps: [
      "Two tests use the same fixture and one mutates it. What happens?",
      "How do you keep unique fields unique across a run?",
      "How do you express \"a user with an expired card\" without a second factory?",
      "When does a nested object need a factory of its own?",
    ],
    mistakes: [
      "Exporting a shared object literal, so one test mutating it fails a different test — and only when they run in that order.",
      "Hardcoded emails or ids, which collide the moment two tests run against the same database.",
      "A factory per variant — buildExpiredUser, buildGbUser — instead of overrides, which multiplies without bound.",
      "A shallow spread over nested defaults, where overriding one nested field silently drops its siblings.",
    ],
  },
  {
    id: "percentile",
    title: "p95 latency from a log",
    prompt: "Given request log lines, report count, p50, p95 and max per route, worst first.",
    assessed: "Whether you know that a mean hides everything and that \"p95\" has more than one definition. Saying which definition you used, unprompted, is the answer — most candidates compute one silently and cannot say which.",
    solution: "export function percentile(sorted, p) {\n  if (sorted.length === 0) return null;\n  const rank = Math.ceil((p / 100) * sorted.length);\n  return sorted[Math.min(sorted.length, Math.max(1, rank)) - 1];\n}\n\nexport function summarise(lines) {\n  const byRoute = new Map();\n  for (const line of lines) {\n    if (!byRoute.has(line.route)) byRoute.set(line.route, []);\n    byRoute.get(line.route).push(line.ms);\n  }\n  return [...byRoute.entries()]\n    .map(([route, all]) => {\n      const sorted = [...all].sort((a, b) => a - b);\n      return {\n        route,\n        n: sorted.length,\n        p50: percentile(sorted, 50),\n        p95: percentile(sorted, 95),\n        max: sorted[sorted.length - 1],\n      };\n    })\n    .sort((a, b) => b.p95 - a.p95);\n}",
    checks: ["percentile uses nearest rank and returns a real observation", "summarise groups by route and sorts by p95"],
    followUps: [
      "Which definition of percentile did you use, and does it interpolate?",
      "What is p95 of a single request?",
      "Why not just report the average?",
      "These are per-route. What breaks if you average the per-route p95s to get an overall one?",
    ],
    mistakes: [
      "Reporting the mean, which one 10-second request drags without ever showing up.",
      "Indexing at length * 0.95 without rounding, which is off by one and, at the wrong index, an undefined.",
      "Interpolating between observations, which reports a latency no request ever had — defensible, but only if it is deliberate.",
      "Averaging percentiles across routes or across time buckets, which is not a percentile of anything.",
      "Sorting the caller’s array in place and handing back mutated input.",
    ],
  },
];

