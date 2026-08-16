import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runPartitionEqualSubsetSum(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  const totalSum = nums.reduce((a, b) => a + b, 0);

  steps.push({
    state: { nums: [...nums], result: null },
    highlights: [],
    message: `Can [${nums.join(', ')}] be partitioned into two subsets with equal sum? Total sum = ${totalSum}`,
    codeLine: 1,
  });

  if (totalSum % 2 !== 0) {
    steps.push({
      state: { nums: [...nums], result: false },
      highlights: [],
      message: `Sum ${totalSum} is odd, cannot partition equally. Result: false`,
      codeLine: 2,
      action: 'found',
    });
    return steps;
  }

  const target = totalSum / 2;

  steps.push({
    state: { nums: [...nums], result: null },
    highlights: [],
    message: `Need to find a subset that sums to ${target} (half of ${totalSum})`,
    codeLine: 3,
  });

  // dp[j] = can we make sum j?
  const dp: (string | null)[] = new Array(target + 1).fill(null);
  const dpLabels = Array.from({ length: target + 1 }, (_, i) => `${i}`);

  dp[0] = 'T';
  for (let i = 1; i <= target; i++) dp[i] = 'F';

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [0], result: null },
    highlights: [],
    message: `Initialize: dp[0] = true (empty subset sums to 0), rest false`,
    codeLine: 4,
    action: 'insert',
  });

  for (let i = 0; i < n; i++) {
    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, result: null },
      highlights: [i],
      pointers: { num: i },
      message: `Processing nums[${i}] = ${nums[i]}`,
      codeLine: 6,
      action: 'visit',
    });

    // Iterate backwards to avoid using same element twice
    for (let j = target; j >= nums[i]; j--) {
      if (dp[j - nums[i]] === 'T' && dp[j] === 'F') {
        steps.push({
          state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [j - nums[i]], dpSecondary: [j], result: null },
          highlights: [i],
          pointers: { num: i, sum: j },
          message: `dp[${j}] = dp[${j}] || dp[${j} - ${nums[i]}] = dp[${j}] || dp[${j - nums[i]}] = F || T = T`,
          codeLine: 8,
          action: 'compare',
        });

        dp[j] = 'T';

        steps.push({
          state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [j], result: null },
          highlights: [i],
          pointers: { num: i, sum: j },
          message: `dp[${j}] = true (can make sum ${j} by including ${nums[i]})`,
          codeLine: 8,
          action: 'insert',
        });

        if (j === target) {
          steps.push({
            state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [target], result: true },
            highlights: [],
            message: `Found! dp[${target}] = true. Can partition into two equal subsets.`,
            codeLine: 10,
            action: 'found',
          });
          return steps;
        }
      }
    }
  }

  const result = dp[target] === 'T';
  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [target], result },
    highlights: [],
    message: `dp[${target}] = ${dp[target]}. ${result ? 'Can' : 'Cannot'} partition into two equal subsets.`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

function runPartitionSumSet(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  const totalSum = nums.reduce((a, b) => a + b, 0);

  steps.push({
    state: { nums: [...nums], result: null },
    highlights: [],
    message: `Set-based view: grow the set of ALL sums buildable from the numbers seen so far. If ${'target'} ever appears in the set, an equal partition exists`,
    codeLine: 2,
  });

  if (totalSum % 2 !== 0) {
    steps.push({
      state: { nums: [...nums], result: false },
      highlights: [],
      message: `Total sum ${totalSum} is odd — two equal halves are impossible. Result: false`,
      codeLine: 4,
      action: 'found',
    });
    return steps;
  }

  const target = totalSum / 2;
  const dpLabels = Array.from({ length: target + 1 }, (_, i) => `${i}`);
  const dp: (string | null)[] = new Array(target + 1).fill('F');
  dp[0] = 'T';

  let sums = new Set<number>([0]);

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [0], result: null },
    highlights: [],
    message: `Target = ${totalSum} / 2 = ${target}. Start with the reachable-sums set {0} (the empty subset)`,
    codeLine: 6,
    action: 'insert',
  });

  for (let i = 0; i < n; i++) {
    const num = nums[i];
    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, result: null },
      highlights: [i],
      pointers: { num: i },
      message: `Include nums[${i}] = ${num}: every existing sum s spawns a new sum s + ${num}. Current set: {${[...sums].sort((a, b) => a - b).join(', ')}}`,
      codeLine: 7,
      action: 'visit',
    });

    const nextSums = new Set(sums);
    const added: number[] = [];

    for (const s of sums) {
      const withNum = s + num;
      if (withNum === target) {
        dp[target] = 'T';
        steps.push({
          state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [target], result: true },
          highlights: [i],
          pointers: { num: i, sum: withNum },
          message: `${s} + ${num} = ${target} — the target sum is reachable! One subset sums to ${target}, the rest must too. Result: true`,
          codeLine: 11,
          action: 'found',
        });
        return steps;
      }
      if (withNum < target && !nextSums.has(withNum)) {
        nextSums.add(withNum);
        added.push(withNum);
        dp[withNum] = 'T';
      }
    }

    if (added.length > 0) {
      steps.push({
        state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: added.sort((a, b) => a - b), result: null },
        highlights: [i],
        pointers: { num: i },
        message: `New reachable sums with ${num}: {${added.join(', ')}}. Set is now {${[...nextSums].sort((a, b) => a - b).join(', ')}}`,
        codeLine: 13,
        action: 'insert',
      });
    } else {
      steps.push({
        state: { nums: [...nums], dp: [...dp], dpLabels, result: null },
        highlights: [i],
        pointers: { num: i },
        message: `${num} produced no new sums below the target — set unchanged`,
        codeLine: 14,
      });
    }

    sums = nextSums;
  }

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [target], result: false },
    highlights: [],
    message: `All numbers processed and ${target} never appeared in the set. Cannot partition equally. Result: false`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

export const partitionEqualSubsetSum: Algorithm = {
  id: 'partition-equal-subset-sum',
  name: 'Partition Equal Subset Sum',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n·sum)',
  spaceComplexity: 'O(sum)',
  pattern: 'DP / 0-1 Knapsack — can subset sum to total/2?',
  description:
    'Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal.',
  problemUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/',
  code: {
    python: `def canPartition(nums):
    total = sum(nums)
    if total % 2 != 0:
        return False
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for j in range(target, num - 1, -1):
            dp[j] = dp[j] or dp[j - num]
    return dp[target]`,
    javascript: `function canPartition(nums) {
    const total = nums.reduce((a, b) => a + b, 0);
    if (total % 2 !== 0) return false;
    const target = total / 2;
    const dp = new Array(target + 1).fill(false);
    dp[0] = true;
    for (const num of nums) {
        for (let j = target; j >= num; j--) {
            dp[j] = dp[j] || dp[j - num];
        }
    }
    return dp[target];
}`,
    java: `public boolean canPartition(int[] nums) {
    int total = 0;
    for (int num : nums) total += num;
    if (total % 2 != 0) return false;
    int target = total / 2;
    boolean[] dp = new boolean[target + 1];
    dp[0] = true;
    for (int num : nums) {
        for (int j = target; j >= num; j--) {
            dp[j] = dp[j] || dp[j - num];
        }
    }
    return dp[target];
}`,
  },
  defaultInput: [1, 5, 11, 5],
  run: runPartitionEqualSubsetSum,
  optimalApproachName: '1-D Knapsack DP',
  approaches: [
    {
      id: 'reachable-sums-set',
      name: 'Reachable Sums Set',
      timeComplexity: 'O(n·sum)',
      spaceComplexity: 'O(sum)',
      description:
        'Instead of a boolean array swept backwards, grow a hash set of every subset sum buildable so far — each number doubles the candidates, and we stop the moment the target appears.',
      code: {
        python: `def canPartition(nums):
    total = sum(nums)
    if total % 2 != 0:
        return False
    target = total // 2
    sums = {0}
    for num in nums:
        nextSums = set(sums)
        for s in sums:
            if s + num == target:
                return True
            if s + num < target:
                nextSums.add(s + num)
        sums = nextSums
    return False`,
        javascript: `function canPartition(nums) {
    const total = nums.reduce((a, b) => a + b, 0);
    if (total % 2 !== 0) return false;
    const target = total / 2;
    let sums = new Set([0]);
    for (const num of nums) {
        const nextSums = new Set(sums);
        for (const s of sums) {
            if (s + num === target) return true;
            if (s + num < target) nextSums.add(s + num);
        }
        sums = nextSums;
    }
    return false;
}`,
        java: `public boolean canPartition(int[] nums) {
    int total = 0;
    for (int num : nums) total += num;
    if (total % 2 != 0) return false;
    int target = total / 2;
    Set<Integer> sums = new HashSet<>();
    sums.add(0);
    for (int num : nums) {
        Set<Integer> nextSums = new HashSet<>(sums);
        for (int s : sums) {
            if (s + num == target) return true;
            if (s + num < target) nextSums.add(s + num);
        }
        sums = nextSums;
    }
    return false;
}`,
      },
      run: runPartitionSumSet,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'Compute the total sum of all elements',
          3: 'An odd total cannot split into two equal halves',
          4: 'Bail out early',
          5: 'Each subset must sum to half the total',
          6: 'Set of reachable subset sums — starts with just 0 (empty subset)',
          7: 'Fold in one number at a time',
          8: 'Copy the set: each old sum survives (subsets that skip num)',
          9: 'Extend every existing sum with the new number',
          10: 'Hit the target exactly?',
          11: 'A subset sums to half — the rest is the other half',
          12: 'Keep only sums below target (larger ones are useless)',
          13: 'Add the new reachable sum',
          14: 'Swap in the grown set',
          15: 'Target never appeared: no equal partition',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'Compute the total sum of all elements',
          3: 'An odd total cannot split into two equal halves',
          4: 'Each subset must sum to half the total',
          5: 'Set of reachable subset sums — starts with just 0 (empty subset)',
          6: 'Fold in one number at a time',
          7: 'Copy the set: each old sum survives (subsets that skip num)',
          8: 'Extend every existing sum with the new number',
          9: 'Hit the target exactly: a subset sums to half',
          10: 'Keep only new sums below target (larger ones are useless)',
          12: 'Swap in the grown set',
          14: 'Target never appeared: no equal partition',
        },
        java: {
          1: 'Define method taking nums array',
          2: 'Initialize the total sum',
          3: 'Compute the total sum of all elements',
          4: 'An odd total cannot split into two equal halves',
          5: 'Each subset must sum to half the total',
          6: 'Set of reachable subset sums',
          7: 'Start with just 0 (the empty subset)',
          8: 'Fold in one number at a time',
          9: 'Copy the set: each old sum survives (subsets that skip num)',
          10: 'Extend every existing sum with the new number',
          11: 'Hit the target exactly: a subset sums to half',
          12: 'Keep only new sums below target (larger ones are useless)',
          14: 'Swap in the grown set',
          16: 'Target never appeared: no equal partition',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Compute total sum of all elements',
      3: 'Check if total is odd (can\'t split evenly)',
      4: 'Odd sum means no equal partition exists',
      5: 'Target is half the total sum',
      6: 'Init DP array for sums 0..target',
      7: 'Base case: sum 0 always achievable',
      8: 'Try including each number',
      9: 'Iterate sums backwards to avoid reuse',
      10: 'Mark sum j reachable if j-num was',
      11: 'Return whether target sum is achievable',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Compute total sum of all elements',
      3: 'Odd sum can\'t be split evenly',
      4: 'Target is half the total sum',
      5: 'Init DP array for sums 0..target',
      6: 'Base case: sum 0 always achievable',
      7: 'Try including each number',
      8: 'Iterate sums backwards to avoid reuse',
      9: 'Mark sum j reachable if j-num was',
      12: 'Return whether target sum is achievable',
    },
    java: {
      1: 'Define method taking nums array',
      2: 'Initialize total sum variable',
      3: 'Compute total sum of all elements',
      4: 'Odd sum can\'t be split evenly',
      5: 'Target is half the total sum',
      6: 'Init DP array for sums 0..target',
      7: 'Base case: sum 0 always achievable',
      8: 'Try including each number',
      9: 'Iterate sums backwards to avoid reuse',
      10: 'Mark sum j reachable if j-num was',
      13: 'Return whether target sum is achievable',
    },
  },
};
