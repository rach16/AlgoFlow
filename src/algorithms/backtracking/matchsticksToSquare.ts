import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

const SIDE_LABELS = ['side 1', 'side 2', 'side 3', 'side 4'];

function runMatchsticksToSquare(input: unknown): AlgorithmStep[] {
  const original = input as number[];
  const steps: AlgorithmStep[] = [];
  const STEP_BUDGET = 62;
  let suppressed = 0;

  const total = original.reduce((a, b) => a + b, 0);
  const sticks = [...original].sort((a, b) => b - a);

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  if (total % 4 !== 0) {
    steps.push({
      state: { nums: [...original], dp: [0, 0, 0, 0], dpLabels: SIDE_LABELS, result: false },
      highlights: [],
      message: `Total length ${total} is not divisible by 4 — no square is possible`,
      codeLine: 4,
      action: 'found',
    });
    return steps;
  }

  const side = total / 4;
  const sides = [0, 0, 0, 0];

  steps.push({
    state: {
      nums: [...sticks],
      dp: [...sides],
      dpLabels: SIDE_LABELS,
      dpHighlights: [],
      hashMap: { total, side },
      result: [],
    },
    highlights: [],
    message: `Total ${total} → each side must measure ${side}. Sorted descending to [${sticks.join(', ')}]: placing the awkward long sticks first makes dead ends surface near the root instead of deep in the tree`,
    codeLine: 7,
  });

  if (sticks[0] > side) {
    steps.push({
      state: {
        nums: [...sticks],
        dp: [...sides],
        dpLabels: SIDE_LABELS,
        hashMap: { total, side },
        result: false,
      },
      highlights: [0],
      message: `Longest stick ${sticks[0]} already exceeds the side length ${side} — impossible`,
      codeLine: 9,
      action: 'found',
    });
    return steps;
  }

  function backtrack(i: number): boolean {
    if (i === sticks.length) {
      push({
        state: {
          nums: [...sticks],
          dp: [...sides],
          dpLabels: SIDE_LABELS,
          dpHighlights: [0, 1, 2, 3],
          hashMap: { total, side, placed: sticks.length },
          result: true,
        },
        highlights: [],
        message: `Every stick is used and all four sides read ${side} — the square is built`,
        codeLine: 15,
        action: 'found',
      });
      return true;
    }

    for (let j = 0; j < 4; j++) {
      if (sides[j] + sticks[i] > side) {
        push({
          state: {
            nums: [...sticks],
            dp: [...sides],
            dpLabels: SIDE_LABELS,
            dpHighlights: [j],
            hashMap: { total, side },
            result: [],
          },
          highlights: [i],
          message: `Stick ${sticks[i]} onto ${SIDE_LABELS[j]} would make ${sides[j]} + ${sticks[i]} = ${sides[j] + sticks[i]} > ${side} — overflow, try the next side`,
          codeLine: 18,
        });
        continue;
      }

      if (j > 0 && sides[j] === sides[j - 1]) {
        push({
          state: {
            nums: [...sticks],
            dp: [...sides],
            dpLabels: SIDE_LABELS,
            dpHighlights: [j],
            dpSecondary: [j - 1],
            hashMap: { total, side },
            result: [],
          },
          highlights: [i],
          message: `${SIDE_LABELS[j]} already holds ${sides[j]}, exactly like ${SIDE_LABELS[j - 1]} — the sides are interchangeable, so this branch is a relabelled copy of one already tried. Skip`,
          codeLine: 21,
        });
        continue;
      }

      sides[j] += sticks[i];

      push({
        state: {
          nums: [...sticks],
          dp: [...sides],
          dpLabels: SIDE_LABELS,
          dpHighlights: [j],
          hashMap: { total, side, placing: sticks[i] },
          result: [],
        },
        highlights: [i],
        message: `Lay stick ${sticks[i]} on ${SIDE_LABELS[j]}: ${sides[j] - sticks[i]} → ${sides[j]} of ${side}`,
        codeLine: 24,
        action: 'push',
      });

      if (backtrack(i + 1)) return true;

      sides[j] -= sticks[i];

      push({
        state: {
          nums: [...sticks],
          dp: [...sides],
          dpLabels: SIDE_LABELS,
          dpHighlights: [j],
          hashMap: { total, side },
          result: [],
        },
        highlights: [i],
        message: `That branch died — lift stick ${sticks[i]} back off ${SIDE_LABELS[j]} (${sides[j]})`,
        codeLine: 27,
        action: 'pop',
      });
    }

    return false;
  }

  const ok = backtrack(0);

  steps.push({
    state: {
      nums: [...sticks],
      dp: [...sides],
      dpLabels: SIDE_LABELS,
      dpHighlights: ok ? [0, 1, 2, 3] : [],
      hashMap: { total, side },
      result: ok,
    },
    highlights: [],
    message: `Answer: ${ok}${suppressed > 0 ? ` (${suppressed} branch steps not shown)` : ''}`,
    codeLine: 31,
    action: 'found',
  });

  return steps;
}

function runMatchsticksToSquareBitmaskDP(input: unknown): AlgorithmStep[] {
  const sticks = input as number[];
  const steps: AlgorithmStep[] = [];
  const STEP_BUDGET = 62;
  let suppressed = 0;

  const n = sticks.length;
  const total = sticks.reduce((a, b) => a + b, 0);

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  if (total % 4 !== 0) {
    steps.push({
      state: { nums: [...sticks], result: false },
      highlights: [],
      message: `Total length ${total} is not divisible by 4 — no square is possible`,
      codeLine: 4,
      action: 'found',
    });
    return steps;
  }

  const side = total / 4;
  const size = 1 << n;
  const dp: number[] = new Array(size).fill(-1);
  const labels = Array.from({ length: size }, (_, m) => m.toString(2).padStart(n, '0'));
  dp[0] = 0;

  steps.push({
    state: {
      nums: [...sticks],
      dp: [...dp],
      dpLabels: labels,
      dpHighlights: [0],
      hashMap: { side, masks: size },
      result: [],
    },
    highlights: [],
    message: `Same problem, no recursion. dp[mask] = how much of the CURRENT side is already laid once the sticks in mask are used, or -1 if that mask is unreachable. dp[0] = 0, and there are 2^${n} = ${size} masks`,
    codeLine: 14,
  });

  if (Math.max(...sticks) > side) {
    steps.push({
      state: { nums: [...sticks], dp: [...dp], dpLabels: labels, result: false },
      highlights: [],
      message: `Longest stick ${Math.max(...sticks)} exceeds the side length ${side} — impossible`,
      codeLine: 9,
      action: 'found',
    });
    return steps;
  }

  for (let mask = 0; mask < size; mask++) {
    if (dp[mask] === -1) continue;

    const added: string[] = [];
    const touched: number[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) continue;
      if (dp[mask] + sticks[i] > side) continue;
      const next = mask | (1 << i);
      dp[next] = (dp[mask] + sticks[i]) % side;
      added.push(`${labels[next]}→${dp[next]}`);
      touched.push(next);
    }

    if (mask === size - 1) continue;

    push({
      state: {
        nums: [...sticks],
        dp: [...dp],
        dpLabels: labels,
        dpHighlights: [mask],
        dpSecondary: touched,
        hashMap: { mask: labels[mask], filled: dp[mask], side },
        result: [],
      },
      highlights: sticks.map((_, i) => i).filter((i) => mask & (1 << i)),
      message:
        added.length > 0
          ? `mask ${labels[mask]}: ${dp[mask]} of ${side} laid on the side in progress. Extend with ${added.length} stick${added.length !== 1 ? 's' : ''} that still fit — ${added.join(', ')}. The mod wraps a completed side back to 0 and silently starts the next one`
          : `mask ${labels[mask]}: ${dp[mask]} of ${side} laid, but no unused stick fits in the remaining ${side - dp[mask]} — this mask expands to nothing`,
      codeLine: 25,
      action: added.length > 0 ? 'insert' : 'visit',
    });
  }

  const ok = dp[size - 1] === 0;

  steps.push({
    state: {
      nums: [...sticks],
      dp: [...dp],
      dpLabels: labels,
      dpHighlights: [size - 1],
      hashMap: { full: labels[size - 1], value: dp[size - 1], side },
      result: ok,
    },
    highlights: [],
    message: `dp[${labels[size - 1]}] = ${dp[size - 1]}: every stick used with the fourth side finishing exactly on the boundary${suppressed > 0 ? ` (${suppressed} mask steps not shown)` : ''}. Answer: ${ok}`,
    codeLine: 27,
    action: 'found',
  });

  return steps;
}

export const matchsticksToSquare: Algorithm = {
  id: 'matchsticks-to-square',
  name: 'Matchsticks to Square',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(4ⁿ)',
  spaceComplexity: 'O(n)',
  pattern: 'Backtracking — assign each item to a bucket, prune early',
  description:
    'Given an array of matchstick lengths, decide whether all of them can be used, without breaking any, to form the four equal sides of a square. Each stick must be assigned to exactly one side.',
  problemUrl: 'https://leetcode.com/problems/matchsticks-to-square/',
  code: {
    python: `def makesquare(matchsticks):
    total = sum(matchsticks)
    if total % 4 != 0:
        return False

    side = total // 4
    matchsticks.sort(reverse=True)
    if matchsticks[0] > side:
        return False

    sides = [0] * 4

    def backtrack(i):
        if i == len(matchsticks):
            return True

        for j in range(4):
            if sides[j] + matchsticks[i] > side:
                continue
            # Equal sides are interchangeable
            if j > 0 and sides[j] == sides[j - 1]:
                continue

            sides[j] += matchsticks[i]
            if backtrack(i + 1):
                return True
            sides[j] -= matchsticks[i]

        return False

    return backtrack(0)`,
    javascript: `function makesquare(matchsticks) {
    const total = matchsticks.reduce((a, b) => a + b, 0);
    if (total % 4 !== 0) return false;

    const side = total / 4;
    matchsticks.sort((a, b) => b - a);
    if (matchsticks[0] > side) return false;

    const sides = [0, 0, 0, 0];

    function backtrack(i) {
        if (i === matchsticks.length) return true;

        for (let j = 0; j < 4; j++) {
            if (sides[j] + matchsticks[i] > side) continue;
            // Equal sides are interchangeable
            if (j > 0 && sides[j] === sides[j - 1]) continue;

            sides[j] += matchsticks[i];
            if (backtrack(i + 1)) return true;
            sides[j] -= matchsticks[i];
        }

        return false;
    }

    return backtrack(0);
}`,
    java: `public static boolean makesquare(int[] matchsticks) {
    int total = 0;
    for (int m : matchsticks) total += m;
    if (total % 4 != 0) return false;

    int side = total / 4;
    Arrays.sort(matchsticks);
    reverse(matchsticks);
    if (matchsticks[0] > side) return false;

    return backtrack(0, new int[4], side, matchsticks);
}

private static boolean backtrack(int i, int[] sides, int side, int[] matchsticks) {
    if (i == matchsticks.length) return true;

    for (int j = 0; j < 4; j++) {
        if (sides[j] + matchsticks[i] > side) continue;
        // Equal sides are interchangeable
        if (j > 0 && sides[j] == sides[j - 1]) continue;

        sides[j] += matchsticks[i];
        if (backtrack(i + 1, sides, side, matchsticks)) return true;
        sides[j] -= matchsticks[i];
    }

    return false;
}

private static void reverse(int[] a) {
    for (int l = 0, r = a.length - 1; l < r; l++, r--) {
        int tmp = a[l]; a[l] = a[r]; a[r] = tmp;
    }
}`,
  },
  defaultInput: [1, 1, 2, 2, 2],
  run: runMatchsticksToSquare,
  optimalApproachName: 'Backtracking over 4 Sides',
  approaches: [
    {
      id: 'bitmask-dp',
      name: 'Bitmask DP over Subsets',
      timeComplexity: 'O(n·2ⁿ)',
      spaceComplexity: 'O(2ⁿ)',
      description:
        'Replaces the search tree with one sweep over all 2^n subsets: dp[mask] stores how far along the current side you are after using exactly the sticks in mask, so every ordering that reaches the same subset is collapsed into a single entry.',
      code: {
        python: `def makesquare(matchsticks):
    total = sum(matchsticks)
    if total % 4 != 0:
        return False

    side = total // 4
    n = len(matchsticks)
    if max(matchsticks) > side:
        return False

    # dp[mask] = length already laid on the side
    # in progress, or -1 if mask is unreachable
    dp = [-1] * (1 << n)
    dp[0] = 0

    for mask in range(1 << n):
        if dp[mask] == -1:
            continue
        for i in range(n):
            if mask & (1 << i):
                continue
            if dp[mask] + matchsticks[i] > side:
                continue
            nxt = mask | (1 << i)
            dp[nxt] = (dp[mask] + matchsticks[i]) % side

    return dp[(1 << n) - 1] == 0`,
        javascript: `function makesquare(matchsticks) {
    const total = matchsticks.reduce((a, b) => a + b, 0);
    if (total % 4 !== 0) return false;

    const side = total / 4;
    const n = matchsticks.length;
    if (Math.max(...matchsticks) > side) return false;

    // dp[mask] = length already laid on the side
    // in progress, or -1 if mask is unreachable
    const dp = new Array(1 << n).fill(-1);
    dp[0] = 0;

    for (let mask = 0; mask < (1 << n); mask++) {
        if (dp[mask] === -1) continue;
        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) continue;
            if (dp[mask] + matchsticks[i] > side) continue;
            const next = mask | (1 << i);
            dp[next] = (dp[mask] + matchsticks[i]) % side;
        }
    }

    return dp[(1 << n) - 1] === 0;
}`,
        java: `public static boolean makesquare(int[] matchsticks) {
    int total = 0, maxStick = 0;
    for (int m : matchsticks) { total += m; maxStick = Math.max(maxStick, m); }
    if (total % 4 != 0) return false;

    int side = total / 4;
    int n = matchsticks.length;
    if (maxStick > side) return false;

    // dp[mask] = length already laid on the side
    // in progress, or -1 if mask is unreachable
    int[] dp = new int[1 << n];
    Arrays.fill(dp, -1);
    dp[0] = 0;

    for (int mask = 0; mask < (1 << n); mask++) {
        if (dp[mask] == -1) continue;
        for (int i = 0; i < n; i++) {
            if ((mask & (1 << i)) != 0) continue;
            if (dp[mask] + matchsticks[i] > side) continue;
            int next = mask | (1 << i);
            dp[next] = (dp[mask] + matchsticks[i]) % side;
        }
    }

    return dp[(1 << n) - 1] == 0;
}`,
      },
      run: runMatchsticksToSquareBitmaskDP,
      lineExplanations: {
        python: {
          1: 'Define function taking matchstick lengths',
          2: 'Perimeter of the candidate square',
          3: 'A square needs four equal sides',
          4: 'Not divisible by 4, so give up immediately',
          6: 'Target length of one side',
          7: 'Number of sticks — the mask width',
          8: 'A single stick longer than a side can never fit',
          9: 'Reject it up front',
          11: 'The whole trick: one number per subset',
          12: '-1 marks a subset no valid packing can produce',
          13: 'One slot per subset of the sticks',
          14: 'Using nothing leaves the first side empty',
          16: 'Visit subsets in increasing order so sub-subsets are ready',
          17: 'Unreachable subsets cannot extend anything',
          18: 'Skip them',
          19: 'Try appending each unused stick',
          20: 'Bit already set means the stick is spent',
          21: 'Skip it',
          22: 'The stick would overflow the side in progress',
          23: 'Skip it',
          24: 'Mark the stick as used',
          25: 'Modulo closes a finished side and starts the next at 0',
          27: 'All sticks used AND the last side closed exactly',
        },
        javascript: {
          1: 'Define function taking matchstick lengths',
          2: 'Perimeter of the candidate square',
          3: 'Not divisible by 4, so give up immediately',
          5: 'Target length of one side',
          6: 'Number of sticks — the mask width',
          7: 'A single stick longer than a side can never fit',
          9: 'The whole trick: one number per subset',
          10: '-1 marks a subset no valid packing can produce',
          11: 'One slot per subset of the sticks',
          12: 'Using nothing leaves the first side empty',
          14: 'Visit subsets in increasing order so sub-subsets are ready',
          15: 'Unreachable subsets cannot extend anything',
          16: 'Try appending each unused stick',
          17: 'Bit already set means the stick is spent',
          18: 'The stick would overflow the side in progress',
          19: 'Mark the stick as used',
          20: 'Modulo closes a finished side and starts the next at 0',
          24: 'All sticks used AND the last side closed exactly',
        },
        java: {
          1: 'Define method taking matchstick lengths',
          2: 'Track the perimeter and the longest stick together',
          3: 'One pass over the input',
          4: 'Not divisible by 4, so give up immediately',
          6: 'Target length of one side',
          7: 'Number of sticks — the mask width',
          8: 'A single stick longer than a side can never fit',
          10: 'The whole trick: one number per subset',
          11: '-1 marks a subset no valid packing can produce',
          12: 'One slot per subset of the sticks',
          13: 'Start every subset as unreachable',
          14: 'Using nothing leaves the first side empty',
          16: 'Visit subsets in increasing order so sub-subsets are ready',
          17: 'Unreachable subsets cannot extend anything',
          18: 'Try appending each unused stick',
          19: 'Bit already set means the stick is spent',
          20: 'The stick would overflow the side in progress',
          21: 'Mark the stick as used',
          22: 'Modulo closes a finished side and starts the next at 0',
          26: 'All sticks used AND the last side closed exactly',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking matchstick lengths',
      2: 'Perimeter of the candidate square',
      3: 'A square needs four equal sides',
      4: 'Not divisible by 4, so give up immediately',
      6: 'Target length of one side',
      7: 'Descending order front-loads the hard decisions',
      8: 'A single stick longer than a side can never fit',
      9: 'Reject it up front',
      11: 'Running length of each of the four sides',
      13: 'Place matchsticks[i] and recurse on the rest',
      14: 'Base case: every stick has a home',
      15: 'The lengths must be equal — nothing ever exceeded side',
      17: 'Try this stick on each of the four sides',
      18: 'Placing it here would overshoot the target length',
      19: 'Try the next side instead',
      20: 'Symmetry pruning, the line that makes this fast',
      21: 'Two sides holding the same length are indistinguishable',
      22: 'Trying both just re-explores the same shape twice',
      24: 'Commit the stick to side j',
      25: 'If the rest of the sticks fit, we are done',
      26: 'Propagate success straight up the call stack',
      27: 'Otherwise undo the placement',
      29: 'No side worked for this stick — this branch is dead',
      31: 'Start with stick 0 and four empty sides',
    },
    javascript: {
      1: 'Define function taking matchstick lengths',
      2: 'Perimeter of the candidate square',
      3: 'Not divisible by 4, so give up immediately',
      5: 'Target length of one side',
      6: 'Descending order front-loads the hard decisions',
      7: 'A single stick longer than a side can never fit',
      9: 'Running length of each of the four sides',
      11: 'Place matchsticks[i] and recurse on the rest',
      12: 'Base case: every stick has a home',
      14: 'Try this stick on each of the four sides',
      15: 'Placing it here would overshoot the target length',
      16: 'Symmetry pruning, the line that makes this fast',
      17: 'Two sides holding the same length are indistinguishable',
      19: 'Commit the stick to side j',
      20: 'If the rest of the sticks fit, we are done',
      21: 'Otherwise undo the placement',
      24: 'No side worked for this stick — this branch is dead',
      27: 'Start with stick 0 and four empty sides',
    },
    java: {
      1: 'Define method taking matchstick lengths',
      2: 'Perimeter accumulator',
      3: 'Sum every stick',
      4: 'Not divisible by 4, so give up immediately',
      6: 'Target length of one side',
      7: 'Sort ascending, then flip to descending',
      8: 'Descending order front-loads the hard decisions',
      9: 'A single stick longer than a side can never fit',
      11: 'Start with stick 0 and four empty sides',
      14: 'Helper places matchsticks[i] and recurses',
      15: 'Base case: every stick has a home',
      17: 'Try this stick on each of the four sides',
      18: 'Placing it here would overshoot the target length',
      19: 'Symmetry pruning, the line that makes this fast',
      20: 'Two sides holding the same length are indistinguishable',
      22: 'Commit the stick to side j',
      23: 'If the rest of the sticks fit, we are done',
      24: 'Otherwise undo the placement',
      27: 'No side worked for this stick — this branch is dead',
      30: 'Helper to reverse the sorted array in place',
      31: 'Walk two pointers toward each other',
      32: 'Swap the pair',
    },
  },
};
