import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface LastStoneWeightIIInput {
  stones: number[];
}

function runLastStoneWeightII(input: unknown): AlgorithmStep[] {
  const { stones } = input as LastStoneWeightIIInput;
  const steps: AlgorithmStep[] = [];
  const n = stones.length;
  const total = stones.reduce((a, b) => a + b, 0);
  const half = Math.floor(total / 2);

  // dp2d[i][j] = 1 if some subset of the first i stones sums to exactly j
  const dp2d: number[][] = Array.from({ length: n + 1 }, () => new Array(half + 1).fill(0));

  const snap = (
    hl: [number, number][],
    sec: [number, number][],
    result: number | null,
  ) => ({
    nums: [...stones],
    dp2d: dp2d.map(r => [...r]),
    matrixHighlights: hl,
    matrixSecondary: sec,
    result,
  });

  steps.push({
    state: snap([], [], null),
    highlights: [],
    message: `Smashing two stones x and y leaves |x - y| — so every stone ends up with a + or - sign. The answer is the smallest non-negative |S1 - S2| over all ways to split the stones into two groups`,
    codeLine: 1,
  });

  steps.push({
    state: snap([], [], null),
    highlights: [],
    message: `Total = ${total}. If one group sums to s, the other sums to ${total} - s, and the leftover is ${total} - 2s. To minimize it, push s as CLOSE to ${total} / 2 = ${(total / 2).toFixed(1)} as possible — a subset-sum problem with cap ${half}`,
    codeLine: 3,
  });

  dp2d[0][0] = 1;

  steps.push({
    state: snap([[0, 0]], [], null),
    highlights: [],
    message: `dp[i][j] = 1 means "some subset of the first i stones sums to exactly j". Base case: the empty subset makes 0, so dp[0][0] = 1. Columns are sums 0…${half}`,
    codeLine: 5,
    action: 'insert',
  });

  for (let i = 1; i <= n; i++) {
    const stone = stones[i - 1];

    // Carry the previous row forward.
    for (let j = 0; j <= half; j++) dp2d[i][j] = dp2d[i - 1][j];

    steps.push({
      state: snap(
        Array.from({ length: half + 1 }, (_, j): [number, number] => [i, j]).filter(([, j]) => dp2d[i][j] === 1),
        [],
        null,
      ),
      highlights: [i - 1],
      message: `Stone ${stone}: first copy row ${i - 1} down (the "skip this stone" case), then see which new sums it unlocks`,
      codeLine: 8,
      action: 'visit',
    });

    for (let j = half; j >= stone; j--) {
      if (dp2d[i - 1][j - stone] === 1 && dp2d[i][j] === 0) {
        dp2d[i][j] = 1;
        steps.push({
          state: snap([[i, j]], [[i - 1, j - stone]], null),
          highlights: [i - 1],
          pointers: { sum: j },
          message: `New sum unlocked: ${j - stone} was reachable without stone ${stone}, so ${j - stone} + ${stone} = ${j} is reachable with it. dp[${i}][${j}] = 1`,
          codeLine: 10,
          action: 'insert',
        });
      }
    }
  }

  let best = 0;
  for (let j = half; j >= 0; j--) {
    if (dp2d[n][j] === 1) {
      best = j;
      break;
    }
  }

  steps.push({
    state: snap([[n, best]], [], null),
    highlights: [],
    message: `Scan the last row from the right: the largest reachable sum not exceeding ${half} is ${best}`,
    codeLine: 11,
    action: 'compare',
  });

  const answer = total - 2 * best;

  steps.push({
    state: snap([[n, best]], [], answer),
    highlights: [],
    message: `Split into groups of ${best} and ${total - best}. Smallest possible remaining stone = ${total} - 2 × ${best} = ${answer}`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

function runLastStoneWeightIIReachableSums(input: unknown): AlgorithmStep[] {
  const { stones } = input as LastStoneWeightIIInput;
  const steps: AlgorithmStep[] = [];
  const total = stones.reduce((a, b) => a + b, 0);

  const labels = Array.from({ length: total + 1 }, (_, s) => `${s}`);
  const dp: number[] = new Array(total + 1).fill(0);

  const snap = (hl: number[], sec: number[], result: number | null) => ({
    nums: [...stones],
    dp: [...dp],
    dpLabels: labels,
    dpHighlights: hl,
    dpSecondary: sec,
    result,
  });

  steps.push({
    state: snap([], [], null),
    highlights: [],
    message: `Same insight, no table: just track the SET of sums one group can reach. Start with {0} — the empty group. Total is ${total}`,
    codeLine: 2,
  });

  let sums = new Set<number>([0]);
  dp[0] = 1;

  steps.push({
    state: snap([0], [], null),
    highlights: [],
    message: `A 1 in slot s means "some subset of the stones seen so far adds up to s". Only slot 0 is on right now`,
    codeLine: 3,
    action: 'insert',
  });

  for (let i = 0; i < stones.length; i++) {
    const stone = stones[i];
    const added: number[] = [];
    const next = new Set<number>(sums);
    for (const s of sums) {
      if (!next.has(s + stone)) added.push(s + stone);
      next.add(s + stone);
    }
    added.sort((a, b) => a - b);
    for (const s of added) dp[s] = 1;
    sums = next;

    steps.push({
      state: snap([...added], [...sums].filter(s => !added.includes(s)), null),
      highlights: [i],
      message: `Add stone ${stone}: every old sum s also gives s + ${stone}. New sums light up: {${added.join(', ')}}. The set now holds ${sums.size} reachable sums`,
      codeLine: 5,
      action: 'insert',
    });
  }

  let best = Infinity;
  let bestS = 0;
  for (const s of [...sums].sort((a, b) => a - b)) {
    const leftover = Math.abs(total - 2 * s);
    if (leftover < best) {
      best = leftover;
      bestS = s;
    }
  }

  steps.push({
    state: snap([bestS, total - bestS].filter(s => s >= 0 && s <= total), [], null),
    highlights: [],
    message: `For each reachable s the leftover is |${total} - 2s|. The winner is s = ${bestS}, splitting the stones into ${bestS} and ${total - bestS}`,
    codeLine: 6,
    action: 'compare',
  });

  steps.push({
    state: snap([bestS], [], best),
    highlights: [],
    message: `Smallest possible remaining stone = |${total} - 2 × ${bestS}| = ${best}. Set-based and table-based agree; the set version skips allocating an (n+1) × (total/2) grid`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const lastStoneWeightII: Algorithm = {
  id: 'last-stone-weight-ii',
  name: 'Last Stone Weight II',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n·total)',
  spaceComplexity: 'O(n·total)',
  pattern: 'DP / 0-1 Knapsack — subset sum as close to total / 2 as possible',
  description:
    'You are given an array of stone weights. Each turn you smash the two heaviest stones together; if they differ, a stone of the difference is left behind. Return the smallest possible weight of the remaining stone (0 if none is left).',
  problemUrl: 'https://leetcode.com/problems/last-stone-weight-ii/',
  code: {
    python: `def lastStoneWeightII(stones):
    total = sum(stones)
    half = total // 2
    dp = [[False] * (half + 1) for _ in range(len(stones) + 1)]
    dp[0][0] = True
    for i in range(1, len(stones) + 1):
        for j in range(half + 1):
            dp[i][j] = dp[i-1][j]
            if j >= stones[i-1] and dp[i-1][j - stones[i-1]]:
                dp[i][j] = True
    best = max(j for j in range(half + 1) if dp[len(stones)][j])
    return total - 2 * best`,
    javascript: `function lastStoneWeightII(stones) {
    const total = stones.reduce((a, b) => a + b, 0);
    const half = Math.floor(total / 2);
    const dp = Array.from({length: stones.length + 1},
        () => new Array(half + 1).fill(false));
    dp[0][0] = true;
    for (let i = 1; i <= stones.length; i++) {
        for (let j = 0; j <= half; j++) {
            dp[i][j] = dp[i-1][j];
            if (j >= stones[i-1] && dp[i-1][j - stones[i-1]])
                dp[i][j] = true;
        }
    }
    let best = 0;
    for (let j = half; j >= 0; j--)
        if (dp[stones.length][j]) { best = j; break; }
    return total - 2 * best;
}`,
    java: `public static int lastStoneWeightII(int[] stones) {
    int total = 0;
    for (int s : stones) total += s;
    int half = total / 2;
    boolean[][] dp = new boolean[stones.length + 1][half + 1];
    dp[0][0] = true;
    for (int i = 1; i <= stones.length; i++) {
        for (int j = 0; j <= half; j++) {
            dp[i][j] = dp[i - 1][j];
            if (j >= stones[i - 1] && dp[i - 1][j - stones[i - 1]]) {
                dp[i][j] = true;
            }
        }
    }
    int best = 0;
    for (int j = half; j >= 0; j--) {
        if (dp[stones.length][j]) { best = j; break; }
    }
    return total - 2 * best;
}`,
  },
  defaultInput: { stones: [3, 7, 4, 1] },
  run: runLastStoneWeightII,
  optimalApproachName: 'Subset-Sum Table',
  approaches: [
    {
      id: 'reachable-sums-set',
      name: 'Reachable Sums Set',
      timeComplexity: 'O(n·total)',
      spaceComplexity: 'O(total)',
      description:
        'Instead of a boolean table, grow a single set of every sum one group can reach, then pick the reachable sum whose |total - 2s| is smallest.',
      code: {
        python: `def lastStoneWeightII(stones):
    total = sum(stones)
    sums = {0}
    for stone in stones:
        sums |= {s + stone for s in sums}
    best = min(abs(total - 2 * s) for s in sums)
    return best`,
        javascript: `function lastStoneWeightII(stones) {
    const total = stones.reduce((a, b) => a + b, 0);
    let sums = new Set([0]);
    for (const stone of stones) {
        const next = new Set(sums);
        for (const s of sums) next.add(s + stone);
        sums = next;
    }
    let best = Infinity;
    for (const s of sums)
        best = Math.min(best, Math.abs(total - 2 * s));
    return best;
}`,
        java: `public static int lastStoneWeightII(int[] stones) {
    int total = 0;
    for (int s : stones) total += s;
    Set<Integer> sums = new HashSet<>();
    sums.add(0);
    for (int stone : stones) {
        Set<Integer> next = new HashSet<>(sums);
        for (int s : sums) next.add(s + stone);
        sums = next;
    }
    int best = Integer.MAX_VALUE;
    for (int s : sums) {
        best = Math.min(best, Math.abs(total - 2 * s));
    }
    return best;
}`,
      },
      run: runLastStoneWeightIIReachableSums,
      lineExplanations: {
        python: {
          1: 'Define function taking the stone weights',
          2: 'Total weight of every stone',
          3: 'The empty group reaches sum 0',
          4: 'Fold in one stone at a time',
          5: 'Each old sum s also yields s + stone',
          6: 'Pick the split whose two halves are closest',
          7: 'That smallest gap is the last stone weight',
        },
        javascript: {
          1: 'Define function taking the stone weights',
          2: 'Total weight of every stone',
          3: 'The empty group reaches sum 0',
          4: 'Fold in one stone at a time',
          5: 'Copy so we do not grow the set while iterating it',
          6: 'Each old sum s also yields s + stone',
          7: 'Swap in the expanded set',
          10: 'Try every reachable group sum',
          11: 'Leftover stone weight for this split',
          12: 'Return the smallest leftover found',
        },
        java: {
          1: 'Define method taking the stone weights',
          2: 'Accumulator for the total weight',
          3: 'Sum every stone',
          4: 'Set of sums one group can reach',
          5: 'The empty group reaches sum 0',
          6: 'Fold in one stone at a time',
          7: 'Copy so we do not modify the set while iterating',
          8: 'Each old sum s also yields s + stone',
          9: 'Swap in the expanded set',
          11: 'Track the best (smallest) leftover seen',
          12: 'Try every reachable group sum',
          13: 'Leftover is |total - 2s|; keep the smallest',
          15: 'Return the smallest leftover found',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the stone weights',
      2: 'Total weight of every stone',
      3: 'Aim for a group summing as close to total / 2 as possible',
      4: 'dp[i][j] = can the first i stones make exactly j?',
      5: 'Base case: the empty subset makes 0',
      6: 'Consider stones one at a time',
      7: 'Try every candidate group sum up to the cap',
      8: 'Skipping this stone keeps whatever the previous row had',
      9: 'Or take it, if j - stone was already reachable',
      10: 'Mark this sum reachable',
      11: 'Largest reachable sum at or below half the total',
      12: 'Leftover stone weight is total - 2 * best',
    },
    javascript: {
      1: 'Define function taking the stone weights',
      2: 'Total weight of every stone',
      3: 'Aim for a group summing as close to total / 2 as possible',
      4: 'dp[i][j] = can the first i stones make exactly j?',
      5: 'Continuation of the table initialization',
      6: 'Base case: the empty subset makes 0',
      7: 'Consider stones one at a time',
      8: 'Try every candidate group sum up to the cap',
      9: 'Skipping this stone keeps whatever the previous row had',
      10: 'Or take it, if j - stone was already reachable',
      11: 'Mark this sum reachable',
      15: 'Scan the last row from the right',
      16: 'First hit is the largest reachable sum at or below half',
      17: 'Leftover stone weight is total - 2 * best',
    },
    java: {
      1: 'Define method taking the stone weights',
      2: 'Accumulator for the total weight',
      3: 'Sum every stone',
      4: 'Aim for a group summing as close to total / 2 as possible',
      5: 'dp[i][j] = can the first i stones make exactly j?',
      6: 'Base case: the empty subset makes 0',
      7: 'Consider stones one at a time',
      8: 'Try every candidate group sum up to the cap',
      9: 'Skipping this stone keeps whatever the previous row had',
      10: 'Or take it, if j - stone was already reachable',
      11: 'Mark this sum reachable',
      15: 'Track the best reachable group sum',
      16: 'Scan the last row from the right',
      17: 'First hit is the largest reachable sum at or below half',
      19: 'Leftover stone weight is total - 2 * best',
    },
  },
};
