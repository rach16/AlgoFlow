import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface GuessNumberInput {
  n: number;
  pick: number;
}

// The hidden LeetCode API: -1 if our guess is too high, 1 if too low, 0 if correct.
function guessApi(num: number, pick: number): number {
  if (num > pick) return -1;
  if (num < pick) return 1;
  return 0;
}

// Keep the drawn search space to a sane number of cells for large n.
const VIS_CAP = 64;

function guessSpace(n: number): number[] {
  return Array.from({ length: Math.min(n, VIS_CAP) }, (_, i) => i + 1);
}

function rangeIndices(lo: number, hi: number, cap: number = VIS_CAP): number[] {
  const out: number[] = [];
  for (let v = lo; v <= Math.min(hi, cap); v++) out.push(v - 1);
  return out;
}

function runGuessNumber(input: unknown): AlgorithmStep[] {
  const { n, pick } = input as GuessNumberInput;
  const steps: AlgorithmStep[] = [];
  // There is no input array — synthesize the search space 1..n so it can be drawn.
  const space = guessSpace(n);

  steps.push({
    state: { nums: [...space], n },
    highlights: [],
    message: `I picked a number from 1 to ${n}. Each guess only tells us "too high" or "too low" — that single bit is enough to halve the range every time`,
    codeLine: 1,
  });

  let lo = 1;
  let hi = n;

  steps.push({
    state: { nums: [...space], n, lo, hi },
    highlights: rangeIndices(lo, hi, space.length),
    pointers: { lo: lo - 1, hi: hi - 1 },
    message: `Candidates are the whole range [${lo}, ${hi}] — ${hi - lo + 1} numbers still possible`,
    codeLine: 2,
  });

  let answer = -1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const res = guessApi(mid, pick);

    steps.push({
      state: { nums: [...space], n, lo, hi, guess: mid },
      highlights: rangeIndices(lo, hi, space.length),
      secondary: [mid - 1],
      pointers: { lo: lo - 1, mid: mid - 1, hi: hi - 1 },
      message: `Guess the middle of [${lo}, ${hi}]: mid = ${mid}. Calling guess(${mid})...`,
      codeLine: 5,
      action: 'visit',
    });

    if (res === 0) {
      answer = mid;
      steps.push({
        state: { nums: [...space], n, result: mid },
        highlights: [mid - 1],
        pointers: { mid: mid - 1 },
        message: `guess(${mid}) = 0 — correct! The pick is ${mid}`,
        codeLine: 9,
        action: 'found',
      });
      return steps;
    }

    if (res < 0) {
      steps.push({
        state: { nums: [...space], n, lo, hi, guess: mid },
        highlights: rangeIndices(lo, hi, space.length),
        secondary: [mid - 1],
        pointers: { lo: lo - 1, mid: mid - 1, hi: hi - 1 },
        message: `guess(${mid}) = -1 — too high. Everything from ${mid} up is dead: hi = ${mid - 1}`,
        codeLine: 11,
        action: 'compare',
      });
      hi = mid - 1;
    } else {
      steps.push({
        state: { nums: [...space], n, lo, hi, guess: mid },
        highlights: rangeIndices(lo, hi, space.length),
        secondary: [mid - 1],
        pointers: { lo: lo - 1, mid: mid - 1, hi: hi - 1 },
        message: `guess(${mid}) = 1 — too low. Everything from ${mid} down is dead: lo = ${mid + 1}`,
        codeLine: 13,
        action: 'compare',
      });
      lo = mid + 1;
    }
  }

  steps.push({
    state: { nums: [...space], n, result: answer },
    highlights: [],
    message: `Range emptied without a hit — return -1`,
    codeLine: 15,
  });

  return steps;
}

function runGuessNumberTernary(input: unknown): AlgorithmStep[] {
  const { n, pick } = input as GuessNumberInput;
  const steps: AlgorithmStep[] = [];
  const space = guessSpace(n);

  steps.push({
    state: { nums: [...space], n },
    highlights: [],
    message: `Ternary search: cut the range into THIRDS with two probes per round instead of halves with one`,
    codeLine: 1,
  });

  let lo = 1;
  let hi = n;

  steps.push({
    state: { nums: [...space], n, lo, hi },
    highlights: rangeIndices(lo, hi, space.length),
    pointers: { lo: lo - 1, hi: hi - 1 },
    message: `Candidates are [${lo}, ${hi}] — ${hi - lo + 1} numbers`,
    codeLine: 2,
  });

  while (lo <= hi) {
    const m1 = lo + Math.floor((hi - lo) / 3);
    const m2 = hi - Math.floor((hi - lo) / 3);

    steps.push({
      state: { nums: [...space], n, lo, hi, m1, m2 },
      highlights: rangeIndices(lo, hi, space.length),
      secondary: [m1 - 1, m2 - 1],
      pointers: { lo: lo - 1, m1: m1 - 1, m2: m2 - 1, hi: hi - 1 },
      message: `Split [${lo}, ${hi}] at the two third-points: m1 = ${m1}, m2 = ${m2}`,
      codeLine: 5,
      action: 'visit',
    });

    const r1 = guessApi(m1, pick);

    steps.push({
      state: { nums: [...space], n, lo, hi, m1, m2 },
      highlights: rangeIndices(lo, hi, space.length),
      secondary: [m1 - 1],
      pointers: { lo: lo - 1, m1: m1 - 1, hi: hi - 1 },
      message: `guess(${m1}) = ${r1} — ${r1 === 0 ? 'exact hit' : r1 < 0 ? 'too high' : 'too low'}`,
      codeLine: 8,
      action: 'compare',
    });

    if (r1 === 0) {
      steps.push({
        state: { nums: [...space], n, result: m1 },
        highlights: [m1 - 1],
        pointers: { m1: m1 - 1 },
        message: `First probe landed on it — the pick is ${m1}`,
        codeLine: 10,
        action: 'found',
      });
      return steps;
    }

    const r2 = guessApi(m2, pick);

    steps.push({
      state: { nums: [...space], n, lo, hi, m1, m2 },
      highlights: rangeIndices(lo, hi, space.length),
      secondary: [m2 - 1],
      pointers: { lo: lo - 1, m2: m2 - 1, hi: hi - 1 },
      message: `guess(${m2}) = ${r2} — ${r2 === 0 ? 'exact hit' : r2 < 0 ? 'too high' : 'too low'}`,
      codeLine: 12,
      action: 'compare',
    });

    if (r2 === 0) {
      steps.push({
        state: { nums: [...space], n, result: m2 },
        highlights: [m2 - 1],
        pointers: { m2: m2 - 1 },
        message: `Second probe landed on it — the pick is ${m2}`,
        codeLine: 14,
        action: 'found',
      });
      return steps;
    }

    if (r1 < 0) {
      steps.push({
        state: { nums: [...space], n, lo, hi, m1, m2 },
        highlights: rangeIndices(lo, m1 - 1, space.length),
        pointers: { lo: lo - 1, hi: m1 - 2 },
        message: `${m1} is already too high — keep only the first third: [${lo}, ${m1 - 1}]`,
        codeLine: 17,
        action: 'compare',
      });
      hi = m1 - 1;
    } else if (r2 > 0) {
      steps.push({
        state: { nums: [...space], n, lo, hi, m1, m2 },
        highlights: rangeIndices(m2 + 1, hi, space.length),
        pointers: { lo: m2, hi: hi - 1 },
        message: `${m2} is still too low — keep only the last third: [${m2 + 1}, ${hi}]`,
        codeLine: 19,
        action: 'compare',
      });
      lo = m2 + 1;
    } else {
      steps.push({
        state: { nums: [...space], n, lo, hi, m1, m2 },
        highlights: rangeIndices(m1 + 1, m2 - 1, space.length),
        pointers: { lo: m1, hi: m2 - 2 },
        message: `Pick sits strictly between the probes — keep the middle third: [${m1 + 1}, ${m2 - 1}]`,
        codeLine: 21,
        action: 'compare',
      });
      lo = m1 + 1;
      hi = m2 - 1;
    }
  }

  steps.push({
    state: { nums: [...space], n, result: -1 },
    highlights: [],
    message: `Range emptied without a hit — return -1. Two probes per round shrink to 1/3 but cost 2 calls, so binary search is still cheaper overall`,
    codeLine: 24,
  });

  return steps;
}

export const guessNumber: Algorithm = {
  id: 'guess-number',
  name: 'Guess Number Higher or Lower',
  category: 'Binary Search',
  difficulty: 'Easy',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search — halve the guess range on higher/lower feedback',
  description:
    'We are playing the Guess Game: I pick a number from 1 to n and you guess. After each guess the API guess(num) returns -1 if your guess is too high, 1 if it is too low, and 0 if it is correct. Return the number that I picked.',
  problemUrl: 'https://leetcode.com/problems/guess-number-higher-or-lower/',
  code: {
    python: `def guessNumber(n):
    lo, hi = 1, n

    while lo <= hi:
        mid = (lo + hi) // 2
        res = guess(mid)

        if res == 0:
            return mid
        elif res < 0:
            hi = mid - 1
        else:
            lo = mid + 1

    return -1`,
    javascript: `function guessNumber(n) {
    let lo = 1;
    let hi = n;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const res = guess(mid);

        if (res === 0) {
            return mid;
        } else if (res < 0) {
            hi = mid - 1;
        } else {
            lo = mid + 1;
        }
    }

    return -1;
}`,
    java: `public int guessNumber(int n) {
    int lo = 1;
    int hi = n;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int res = guess(mid);

        if (res == 0) {
            return mid;
        } else if (res < 0) {
            hi = mid - 1;
        } else {
            lo = mid + 1;
        }
    }

    return -1;
}`,
  },
  defaultInput: { n: 16, pick: 13 },
  run: runGuessNumber,
  optimalApproachName: 'Binary Search',
  approaches: [
    {
      id: 'ternary-search-guess',
      name: 'Ternary Search',
      timeComplexity: 'O(log₃ n)',
      spaceComplexity: 'O(1)',
      description:
        'Probe two third-points per round so the range shrinks to a third instead of a half — fewer rounds than binary search, but two API calls each, so it does more total work.',
      code: {
        python: `def guessNumber(n):
    lo, hi = 1, n

    while lo <= hi:
        m1 = lo + (hi - lo) // 3
        m2 = hi - (hi - lo) // 3

        r1 = guess(m1)
        if r1 == 0:
            return m1

        r2 = guess(m2)
        if r2 == 0:
            return m2

        if r1 < 0:
            hi = m1 - 1
        elif r2 > 0:
            lo = m2 + 1
        else:
            lo = m1 + 1
            hi = m2 - 1

    return -1`,
        javascript: `function guessNumber(n) {
    let lo = 1;
    let hi = n;

    while (lo <= hi) {
        const m1 = lo + Math.floor((hi - lo) / 3);
        const m2 = hi - Math.floor((hi - lo) / 3);

        const r1 = guess(m1);
        if (r1 === 0) {
            return m1;
        }

        const r2 = guess(m2);
        if (r2 === 0) {
            return m2;
        }

        if (r1 < 0) {
            hi = m1 - 1;
        } else if (r2 > 0) {
            lo = m2 + 1;
        } else {
            lo = m1 + 1;
            hi = m2 - 1;
        }
    }

    return -1;
}`,
        java: `public int guessNumber(int n) {
    int lo = 1;
    int hi = n;

    while (lo <= hi) {
        int m1 = lo + (hi - lo) / 3;
        int m2 = hi - (hi - lo) / 3;

        int r1 = guess(m1);
        if (r1 == 0) {
            return m1;
        }

        int r2 = guess(m2);
        if (r2 == 0) {
            return m2;
        }

        if (r1 < 0) {
            hi = m1 - 1;
        } else if (r2 > 0) {
            lo = m2 + 1;
        } else {
            lo = m1 + 1;
            hi = m2 - 1;
        }
    }

    return -1;
}`,
      },
      run: runGuessNumberTernary,
      lineExplanations: {
        python: {
          1: 'Define function taking the upper bound n',
          2: 'Candidate range starts as the full 1..n',
          4: 'Keep probing while candidates remain',
          5: 'First third-point of the current range',
          6: 'Second third-point of the current range',
          8: 'Probe the lower third-point',
          9: 'Lucky hit on the first probe?',
          10: 'Return it',
          12: 'Probe the upper third-point',
          13: 'Lucky hit on the second probe?',
          14: 'Return it',
          16: 'm1 too high — the pick is below it',
          17: 'Keep only the first third',
          18: 'm2 too low — the pick is above it',
          19: 'Keep only the last third',
          20: 'Otherwise the pick is strictly between the probes',
          21: 'Trim the left third away',
          22: 'Trim the right third away',
          24: 'Unreachable for a valid pick — return -1',
        },
        javascript: {
          1: 'Define function taking the upper bound n',
          2: 'Low edge of the candidate range',
          3: 'High edge of the candidate range',
          5: 'Keep probing while candidates remain',
          6: 'First third-point of the current range',
          7: 'Second third-point of the current range',
          9: 'Probe the lower third-point',
          10: 'Lucky hit on the first probe?',
          11: 'Return it',
          14: 'Probe the upper third-point',
          15: 'Lucky hit on the second probe?',
          16: 'Return it',
          19: 'm1 too high — the pick is below it',
          20: 'Keep only the first third',
          21: 'm2 too low — the pick is above it',
          22: 'Keep only the last third',
          23: 'Otherwise the pick is strictly between the probes',
          24: 'Trim the left third away',
          25: 'Trim the right third away',
          29: 'Unreachable for a valid pick — return -1',
        },
        java: {
          1: 'Define method taking the upper bound n',
          2: 'Low edge of the candidate range',
          3: 'High edge of the candidate range',
          5: 'Keep probing while candidates remain',
          6: 'First third-point of the current range',
          7: 'Second third-point of the current range',
          9: 'Probe the lower third-point',
          10: 'Lucky hit on the first probe?',
          11: 'Return it',
          14: 'Probe the upper third-point',
          15: 'Lucky hit on the second probe?',
          16: 'Return it',
          19: 'm1 too high — the pick is below it',
          20: 'Keep only the first third',
          21: 'm2 too low — the pick is above it',
          22: 'Keep only the last third',
          23: 'Otherwise the pick is strictly between the probes',
          24: 'Trim the left third away',
          25: 'Trim the right third away',
          29: 'Unreachable for a valid pick — return -1',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the upper bound n',
      2: 'Candidate range starts as the full 1..n',
      4: 'Keep guessing while candidates remain',
      5: 'Guess the middle of the surviving range',
      6: 'Ask the API how our guess compares',
      8: 'Zero means we nailed it',
      9: 'Return the picked number',
      10: '-1 means our guess was too high',
      11: 'Discard mid and everything above it',
      12: 'Otherwise the guess was too low',
      13: 'Discard mid and everything below it',
      15: 'Unreachable for a valid pick — return -1',
    },
    javascript: {
      1: 'Define function taking the upper bound n',
      2: 'Low edge of the candidate range',
      3: 'High edge of the candidate range',
      5: 'Keep guessing while candidates remain',
      6: 'Guess the middle of the surviving range',
      7: 'Ask the API how our guess compares',
      9: 'Zero means we nailed it',
      10: 'Return the picked number',
      11: '-1 means our guess was too high — drop the upper half',
      12: 'Discard mid and everything above it',
      13: 'Otherwise the guess was too low',
      14: 'Discard mid and everything below it',
      18: 'Unreachable for a valid pick — return -1',
    },
    java: {
      1: 'Define method taking the upper bound n',
      2: 'Low edge of the candidate range',
      3: 'High edge of the candidate range',
      5: 'Keep guessing while candidates remain',
      6: 'Overflow-safe midpoint of the surviving range',
      7: 'Ask the API how our guess compares',
      9: 'Zero means we nailed it',
      10: 'Return the picked number',
      11: '-1 means our guess was too high — drop the upper half',
      12: 'Discard mid and everything above it',
      13: 'Otherwise the guess was too low',
      14: 'Discard mid and everything below it',
      18: 'Unreachable for a valid pick — return -1',
    },
  },
};
