import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runJumpGameII(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], result: 'Finding minimum jumps to reach end...' },
    highlights: [],
    message: `BFS/Greedy approach: find minimum number of jumps to reach the last index.`,
    codeLine: 1,
  });

  let jumps = 0;
  let left = 0;
  let right = 0;

  steps.push({
    state: { nums: [...nums], result: `Jumps: ${jumps}` },
    highlights: [0],
    pointers: { left: 0, right: 0 },
    message: `Start at index 0. Current window: [0, 0]. Jumps = 0.`,
    codeLine: 2,
    action: 'visit',
  });

  while (right < nums.length - 1) {
    let farthest = 0;

    // Highlight current BFS level
    const levelHighlights: number[] = [];
    for (let j = left; j <= right; j++) levelHighlights.push(j);

    steps.push({
      state: { nums: [...nums], result: `Jumps: ${jumps}` },
      highlights: levelHighlights,
      pointers: { left, right },
      message: `Jump ${jumps}: exploring window [${left}, ${right}]. Find farthest reachable position.`,
      codeLine: 4,
    });

    for (let i = left; i <= right; i++) {
      const reach = i + nums[i];
      if (reach > farthest) {
        farthest = reach;
      }

      steps.push({
        state: { nums: [...nums], result: `Jumps: ${jumps}, Farthest: ${farthest}` },
        highlights: [i],
        pointers: { i, left, right, farthest: Math.min(farthest, nums.length - 1) },
        message: `From index ${i} (value ${nums[i]}): can reach index ${reach}. Farthest = ${farthest}.`,
        codeLine: 6,
        action: 'compare',
      });
    }

    left = right + 1;
    right = farthest;
    jumps++;

    const newLevelHighlights: number[] = [];
    for (let j = left; j <= Math.min(right, nums.length - 1); j++) newLevelHighlights.push(j);

    steps.push({
      state: { nums: [...nums], result: `Jumps: ${jumps}` },
      highlights: newLevelHighlights,
      pointers: { left, right: Math.min(right, nums.length - 1) },
      message: `Jump! Jumps = ${jumps}. New window: [${left}, ${Math.min(right, nums.length - 1)}].`,
      codeLine: 8,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...nums], result: `Minimum jumps: ${jumps}` },
    highlights: [0, nums.length - 1],
    message: `Done! Minimum number of jumps to reach the end = ${jumps}.`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

function runJumpGameIIDP(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;
  const INF = Number.POSITIVE_INFINITY;
  const dp: number[] = new Array(n).fill(INF);
  dp[0] = 0;

  const fmtDp = () => `dp: [${dp.map((v) => (v === INF ? '∞' : v)).join(', ')}]`;

  steps.push({
    state: { nums: [...nums], result: 'Building dp table...' },
    highlights: [],
    message: `DP formulation: dp[j] = fewest jumps needed to reach index j. Relax every index reachable from each position.`,
    codeLine: 1,
  });

  steps.push({
    state: { nums: [...nums], result: fmtDp() },
    highlights: [0],
    pointers: { i: 0 },
    message: `Base case: dp[0] = 0 (we start there). Every other entry starts at ∞ (unreached).`,
    codeLine: 4,
    action: 'insert',
  });

  for (let i = 0; i < n; i++) {
    if (dp[i] === INF) continue;
    const limit = Math.min(i + nums[i], n - 1);

    if (limit > i && steps.length < 70) {
      steps.push({
        state: { nums: [...nums], result: fmtDp() },
        highlights: [i],
        pointers: { i },
        message: `From index ${i} (reachable in ${dp[i]} jump${dp[i] === 1 ? '' : 's'}, value ${nums[i]}): try to improve indices ${i + 1}..${limit}.`,
        codeLine: 5,
        action: 'visit',
      });
    }

    for (let j = i + 1; j <= limit; j++) {
      if (dp[i] + 1 < dp[j]) {
        dp[j] = dp[i] + 1;
        if (steps.length < 75) {
          steps.push({
            state: { nums: [...nums], result: fmtDp() },
            highlights: [j],
            secondary: [i],
            pointers: { i, j },
            message: `Improve dp[${j}] to ${dp[j]}: index ${j} is now reachable in ${dp[j]} jump${dp[j] === 1 ? '' : 's'} via index ${i}.`,
            codeLine: 7,
            action: 'insert',
          });
        }
      }
    }
  }

  steps.push({
    state: { nums: [...nums], result: `Minimum jumps: ${dp[n - 1]}` },
    highlights: [0, n - 1],
    message: `dp[${n - 1}] = ${dp[n - 1]} — minimum jumps to reach the end. Same answer as the greedy window, but at O(n²) cost.`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

export const jumpGameII: Algorithm = {
  id: 'jump-game-ii',
  name: 'Jump Game II',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy BFS — expand level by level, count jumps',
  description:
    'You are given a 0-indexed array of integers nums of length n. You are initially positioned at nums[0]. Each element nums[i] represents the maximum length of a forward jump from index i. Return the minimum number of jumps to reach nums[n - 1].',
  problemUrl: 'https://leetcode.com/problems/jump-game-ii/',
  code: {
    python: `def jump(nums):
    jumps = 0
    left = right = 0

    while right < len(nums) - 1:
        farthest = 0
        for i in range(left, right + 1):
            farthest = max(farthest, i + nums[i])
        left = right + 1
        right = farthest
        jumps += 1

    return jumps`,
    javascript: `function jump(nums) {
    let jumps = 0;
    let left = 0, right = 0;

    while (right < nums.length - 1) {
        let farthest = 0;
        for (let i = left; i <= right; i++) {
            farthest = Math.max(farthest, i + nums[i]);
        }
        left = right + 1;
        right = farthest;
        jumps++;
    }

    return jumps;
}`,
    java: `public static int jump(int[] nums) {
    int jumps = 0;
    int left = 0, right = 0;

    while (right < nums.length - 1) {
        int farthest = 0;
        for (int i = left; i <= right; i++) {
            farthest = Math.max(farthest, i + nums[i]);
        }
        left = right + 1;
        right = farthest;
        jumps++;
    }

    return jumps;
}`,
  },
  defaultInput: [2, 3, 1, 1, 4],
  run: runJumpGameII,
  optimalApproachName: 'Greedy BFS Window',
  approaches: [
    {
      id: 'dp-min-jumps',
      name: 'Dynamic Programming',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of the O(n) greedy window, fill a dp table where dp[j] is the fewest jumps to reach index j by relaxing every jump edge.',
      code: {
        python: `def jump(nums):
    n = len(nums)
    dp = [float('inf')] * n
    dp[0] = 0
    for i in range(n):
        for j in range(i + 1, min(i + nums[i], n - 1) + 1):
            dp[j] = min(dp[j], dp[i] + 1)
    return dp[n - 1]`,
        javascript: `function jump(nums) {
    const n = nums.length;
    const dp = new Array(n).fill(Infinity);
    dp[0] = 0;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j <= Math.min(i + nums[i], n - 1); j++) {
            dp[j] = Math.min(dp[j], dp[i] + 1);
        }
    }
    return dp[n - 1];
}`,
        java: `public static int jump(int[] nums) {
    int n = nums.length;
    int[] dp = new int[n];
    Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0] = 0;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j <= Math.min(i + nums[i], n - 1); j++) {
            dp[j] = Math.min(dp[j], dp[i] + 1);
        }
    }
    return dp[n - 1];
}`,
      },
      run: runJumpGameIIDP,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'n = number of indices',
          3: 'dp[j] = fewest jumps to reach index j, initially infinity (unreached)',
          4: 'Base case: index 0 takes zero jumps',
          5: 'Consider every launch position i in order',
          6: 'Every index j within jump range of i is one hop away',
          7: 'Relax: reaching j via i costs dp[i] + 1 jumps',
          8: 'Fewest jumps to reach the last index',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'n = number of indices',
          3: 'dp[j] = fewest jumps to reach index j, initially Infinity (unreached)',
          4: 'Base case: index 0 takes zero jumps',
          5: 'Consider every launch position i in order',
          6: 'Every index j within jump range of i is one hop away',
          7: 'Relax: reaching j via i costs dp[i] + 1 jumps',
          10: 'Fewest jumps to reach the last index',
        },
        java: {
          1: 'Define method taking nums array',
          2: 'n = number of indices',
          3: 'Allocate dp: fewest jumps to reach each index',
          4: 'Initialize all entries to MAX_VALUE (unreached)',
          5: 'Base case: index 0 takes zero jumps',
          6: 'Consider every launch position i in order',
          7: 'Every index j within jump range of i is one hop away',
          8: 'Relax: reaching j via i costs dp[i] + 1 jumps',
          11: 'Fewest jumps to reach the last index',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Initialize jump counter to zero',
      3: 'Initialize BFS window bounds (left, right)',
      5: 'Continue while we have not reached the end',
      6: 'Track farthest reachable index in window',
      7: 'Scan all positions in current BFS level',
      8: 'Update farthest reachable from this index',
      9: 'Move left boundary past current window',
      10: 'Set right boundary to farthest reachable',
      11: 'Increment jump count for this level',
      13: 'Return minimum number of jumps',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Initialize jump counter to zero',
      3: 'Initialize BFS window bounds (left, right)',
      5: 'Continue while we have not reached the end',
      6: 'Track farthest reachable index in window',
      7: 'Scan all positions in current BFS level',
      8: 'Update farthest reachable from this index',
      10: 'Move left boundary past current window',
      11: 'Set right boundary to farthest reachable',
      12: 'Increment jump count for this level',
      15: 'Return minimum number of jumps',
    },
    java: {
      1: 'Define method taking nums array',
      2: 'Initialize jump counter to zero',
      3: 'Initialize BFS window bounds (left, right)',
      5: 'Continue while we have not reached the end',
      6: 'Track farthest reachable index in window',
      7: 'Scan all positions in current BFS level',
      8: 'Update farthest reachable from this index',
      10: 'Move left boundary past current window',
      11: 'Set right boundary to farthest reachable',
      12: 'Increment jump count for this level',
      15: 'Return minimum number of jumps',
    },
  },
};
