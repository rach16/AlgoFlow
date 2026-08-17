import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface SqrtInput {
  x: number;
}

// Keep the drawn search space to a sane number of cells for large x.
const VIS_CAP = 64;

// There is no input array — synthesize the candidate-root search space 1..x/2
// (safe upper bound for x >= 2) so the visualizer has cells to light up.
function rootSpace(x: number): number[] {
  const hi = Math.max(1, Math.floor(x / 2));
  return Array.from({ length: Math.min(hi, VIS_CAP) }, (_, i) => i + 1);
}

function spanIndices(lo: number, hi: number, cap: number): number[] {
  const out: number[] = [];
  for (let v = lo; v <= Math.min(hi, cap); v++) out.push(v - 1);
  return out;
}

function runSqrtX(input: unknown): AlgorithmStep[] {
  const { x } = input as SqrtInput;
  const steps: AlgorithmStep[] = [];
  const space = rootSpace(x);

  steps.push({
    state: { nums: [...space], x },
    highlights: [],
    message: `Find floor(sqrt(${x})) without a sqrt call. Cells below are the candidate roots 1..${space.length} — r*r is increasing, so the answer can be binary searched`,
    codeLine: 1,
  });

  if (x < 2) {
    steps.push({
      state: { nums: [...space], x, result: x },
      highlights: [],
      message: `${x} < 2 — sqrt(0) = 0 and sqrt(1) = 1, so return ${x} directly`,
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  let lo = 1;
  let hi = Math.floor(x / 2);
  let ans = 1;

  steps.push({
    state: { nums: [...space], x, lo, hi, ans },
    highlights: spanIndices(lo, hi, space.length),
    pointers: { lo: lo - 1, hi: Math.min(hi, space.length) - 1 },
    message: `For x >= 2 the root never exceeds x/2, so search roots in [${lo}, ${hi}]. Track the best root seen so far in ans`,
    codeLine: 5,
  });

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const sq = mid * mid;

    steps.push({
      state: { nums: [...space], x, lo, hi, mid, sq, ans },
      highlights: spanIndices(lo, hi, space.length),
      secondary: [mid - 1],
      pointers: { lo: lo - 1, mid: mid - 1, hi: Math.min(hi, space.length) - 1 },
      message: `Try root ${mid} from the window [${lo}, ${hi}]: ${mid} * ${mid} = ${sq}`,
      codeLine: 9,
      action: 'visit',
    });

    if (sq === x) {
      steps.push({
        state: { nums: [...space], x, result: mid },
        highlights: mid <= space.length ? [mid - 1] : [],
        pointers: mid <= space.length ? { mid: mid - 1 } : undefined,
        message: `${sq} == ${x} — ${x} is a perfect square, so sqrt(${x}) = ${mid} exactly`,
        codeLine: 13,
        action: 'found',
      });
      return steps;
    }

    if (sq < x) {
      ans = mid;
      steps.push({
        state: { nums: [...space], x, lo, hi, mid, sq, ans },
        highlights: spanIndices(lo, hi, space.length),
        secondary: [mid - 1],
        pointers: { lo: lo - 1, mid: mid - 1, hi: Math.min(hi, space.length) - 1 },
        message: `${sq} < ${x} — ${mid} fits under the root, so remember ans = ${mid} and reach higher: lo = ${mid + 1}`,
        codeLine: 15,
        action: 'compare',
      });
      lo = mid + 1;
    } else {
      steps.push({
        state: { nums: [...space], x, lo, hi, mid, sq, ans },
        highlights: spanIndices(lo, hi, space.length),
        secondary: [mid - 1],
        pointers: { lo: lo - 1, mid: mid - 1, hi: Math.min(hi, space.length) - 1 },
        message: `${sq} > ${x} — ${mid} overshoots, so it and everything above it are out: hi = ${mid - 1}`,
        codeLine: 18,
        action: 'compare',
      });
      hi = mid - 1;
    }
  }

  steps.push({
    state: { nums: [...space], x, result: ans },
    highlights: ans <= space.length ? [ans - 1] : [],
    pointers: ans <= space.length ? { ans: ans - 1 } : undefined,
    message: `Window is empty. The largest root with r*r <= ${x} was ${ans} (${ans * ans} <= ${x} < ${(ans + 1) * (ans + 1)}), so floor(sqrt(${x})) = ${ans}`,
    codeLine: 20,
    action: 'found',
  });

  return steps;
}

function runSqrtXNewton(input: unknown): AlgorithmStep[] {
  const { x } = input as SqrtInput;
  const steps: AlgorithmStep[] = [];
  const space = rootSpace(x);

  steps.push({
    state: { nums: [...space], x },
    highlights: [],
    message: `Newton's method: repeatedly average a guess r with x/r. Each round roughly doubles the number of correct digits`,
    codeLine: 1,
  });

  if (x < 2) {
    steps.push({
      state: { nums: [...space], x, result: x },
      highlights: [],
      message: `${x} < 2 — return ${x} directly`,
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  let r = x;

  steps.push({
    state: { nums: [...space], x, r },
    highlights: [],
    message: `Start from the crudest possible guess: r = ${x}. (Off the chart — the drawn cells only go up to ${space.length})`,
    codeLine: 5,
  });

  let round = 0;
  while (r * r > x) {
    const next = Math.floor((r + Math.floor(x / r)) / 2);
    round++;

    steps.push({
      state: { nums: [...space], x, r: next, prev: r },
      highlights: next <= space.length ? [next - 1] : [],
      pointers: next <= space.length ? { r: next - 1 } : undefined,
      message: `Round ${round}: ${r} * ${r} = ${r * r} > ${x}, so pull the guess in — r = (${r} + ${x}//${r}) // 2 = ${next}`,
      codeLine: 7,
      action: 'visit',
    });

    r = next;
  }

  steps.push({
    state: { nums: [...space], x, result: r },
    highlights: r <= space.length ? [r - 1] : [],
    pointers: r <= space.length ? { r: r - 1 } : undefined,
    message: `${r} * ${r} = ${r * r} <= ${x} — the iteration settled, so floor(sqrt(${x})) = ${r}. Converged in ${round} rounds with no window bookkeeping`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const sqrtX: Algorithm = {
  id: 'sqrt-x',
  name: 'Sqrt(x)',
  category: 'Binary Search',
  difficulty: 'Easy',
  timeComplexity: 'O(log x)',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search on Answer — largest r with r * r <= x',
  description:
    'Given a non-negative integer x, return the square root of x rounded down to the nearest integer. You must not use any built-in exponent function or operator.',
  problemUrl: 'https://leetcode.com/problems/sqrtx/',
  code: {
    python: `def mySqrt(x):
    if x < 2:
        return x

    lo, hi = 1, x // 2
    ans = 1

    while lo <= hi:
        mid = (lo + hi) // 2
        sq = mid * mid

        if sq == x:
            return mid
        elif sq < x:
            ans = mid
            lo = mid + 1
        else:
            hi = mid - 1

    return ans`,
    javascript: `function mySqrt(x) {
    if (x < 2) {
        return x;
    }

    let lo = 1;
    let hi = Math.floor(x / 2);
    let ans = 1;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const sq = mid * mid;

        if (sq === x) {
            return mid;
        } else if (sq < x) {
            ans = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }

    return ans;
}`,
    java: `public static int mySqrt(int x) {
    if (x < 2) {
        return x;
    }

    int lo = 1;
    int hi = x / 2;
    int ans = 1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        long sq = (long) mid * mid;

        if (sq == x) {
            return mid;
        } else if (sq < x) {
            ans = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }

    return ans;
}`,
  },
  defaultInput: { x: 24 },
  run: runSqrtX,
  optimalApproachName: 'Binary Search on Answer',
  approaches: [
    {
      id: 'newtons-method',
      name: "Newton's Method",
      timeComplexity: 'O(log x)',
      spaceComplexity: 'O(1)',
      description:
        'Iterate r = (r + x/r) / 2 until the guess stops overshooting — the same root, reached by numeric convergence instead of by maintaining a search window, and with far fewer rounds in practice.',
      code: {
        python: `def mySqrt(x):
    if x < 2:
        return x

    r = x
    while r * r > x:
        r = (r + x // r) // 2

    return r`,
        javascript: `function mySqrt(x) {
    if (x < 2) {
        return x;
    }

    let r = x;
    while (r * r > x) {
        r = Math.floor((r + Math.floor(x / r)) / 2);
    }

    return r;
}`,
        java: `public static int mySqrt(int x) {
    if (x < 2) {
        return x;
    }

    long r = x;
    while (r * r > x) {
        r = (r + x / r) / 2;
    }

    return (int) r;
}`,
      },
      run: runSqrtXNewton,
      lineExplanations: {
        python: {
          1: 'Define function taking the non-negative integer x',
          2: 'sqrt(0) = 0 and sqrt(1) = 1 need no work',
          3: 'Return x unchanged for those two cases',
          5: 'Seed the iteration with the crudest guess, r = x',
          6: 'Keep going while the guess still overshoots',
          7: 'Average r with x/r — Newton step for f(r) = r² - x',
          9: 'Integer division makes it land exactly on floor(sqrt(x))',
        },
        javascript: {
          1: 'Define function taking the non-negative integer x',
          2: 'sqrt(0) = 0 and sqrt(1) = 1 need no work',
          3: 'Return x unchanged for those two cases',
          6: 'Seed the iteration with the crudest guess, r = x',
          7: 'Keep going while the guess still overshoots',
          8: 'Average r with x/r — Newton step for f(r) = r² - x',
          11: 'Floor division makes it land exactly on floor(sqrt(x))',
        },
        java: {
          1: 'Define method taking the non-negative integer x',
          2: 'sqrt(0) = 0 and sqrt(1) = 1 need no work',
          3: 'Return x unchanged for those two cases',
          6: 'Use long so r * r cannot overflow on the first round',
          7: 'Keep going while the guess still overshoots',
          8: 'Average r with x/r — Newton step for f(r) = r² - x',
          11: 'Narrow back to int once the iteration settles',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the non-negative integer x',
      2: 'sqrt(0) = 0 and sqrt(1) = 1 need no search',
      3: 'Return x unchanged for those two cases',
      5: 'For x >= 2 the root never exceeds x // 2',
      6: 'Best root found so far',
      8: 'Binary search the candidate roots',
      9: 'Midpoint root of the current window',
      10: 'Square it — r * r is monotonically increasing, which is what makes this searchable',
      12: 'Exact hit means x is a perfect square',
      13: 'Return that root',
      14: 'Square is under x — this root is valid',
      15: 'Record it as the best so far',
      16: 'Reach for a larger root',
      17: 'Otherwise the square overshoots x',
      18: 'Drop mid and everything above it',
      20: 'ans is the largest root whose square stays <= x',
    },
    javascript: {
      1: 'Define function taking the non-negative integer x',
      2: 'sqrt(0) = 0 and sqrt(1) = 1 need no search',
      3: 'Return x unchanged for those two cases',
      6: 'Smallest candidate root',
      7: 'For x >= 2 the root never exceeds x / 2',
      8: 'Best root found so far',
      10: 'Binary search the candidate roots',
      11: 'Midpoint root of the current window',
      12: 'Square it — r * r is monotonically increasing',
      14: 'Exact hit means x is a perfect square',
      15: 'Return that root',
      16: 'Square is under x — this root is valid',
      17: 'Record it as the best so far',
      18: 'Reach for a larger root',
      19: 'Otherwise the square overshoots x',
      20: 'Drop mid and everything above it',
      24: 'ans is the largest root whose square stays <= x',
    },
    java: {
      1: 'Define method taking the non-negative integer x',
      2: 'sqrt(0) = 0 and sqrt(1) = 1 need no search',
      3: 'Return x unchanged for those two cases',
      6: 'Smallest candidate root',
      7: 'For x >= 2 the root never exceeds x / 2',
      8: 'Best root found so far',
      10: 'Binary search the candidate roots',
      11: 'Overflow-safe midpoint root of the current window',
      12: 'Cast to long so mid * mid cannot overflow int',
      14: 'Exact hit means x is a perfect square',
      15: 'Return that root',
      16: 'Square is under x — this root is valid',
      17: 'Record it as the best so far',
      18: 'Reach for a larger root',
      19: 'Otherwise the square overshoots x',
      20: 'Drop mid and everything above it',
      24: 'ans is the largest root whose square stays <= x',
    },
  },
};
