import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface CombinationSumIVInput {
  nums: number[];
  target: number;
}

function runCombinationSumIV(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as CombinationSumIVInput;
  const steps: AlgorithmStep[] = [];

  // dp[t] = number of ORDERED combinations that sum to t
  const dp: (number | null)[] = new Array(target + 1).fill(null);
  const dpLabels = Array.from({ length: target + 1 }, (_, i) => `t=${i}`);

  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...nums], result: null },
    highlights: [],
    message: `Count ordered combinations of [${nums.join(', ')}] that sum to ${target}. Because order matters, the outer loop must be over TOTALS and the inner loop over numbers`,
    codeLine: 1,
  });

  for (let i = 0; i <= target; i++) dp[i] = 0;
  dp[0] = 1;
  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...nums], dpHighlights: [0], result: null },
    highlights: [0],
    message: `Base case dp[0] = 1: there is exactly one way to build the empty sum — pick nothing`,
    codeLine: 3,
    action: 'insert',
  });

  for (let total = 1; total <= target; total++) {
    steps.push({
      state: { dp: [...dp], dpLabels, nums: [...nums], dpSecondary: [total], result: null },
      highlights: [total],
      pointers: { total },
      message: `Target ${total}: ask "which number was placed LAST?" — each choice contributes the count of ways to reach the remainder`,
      codeLine: 4,
      action: 'visit',
    });

    for (const num of nums) {
      if (num <= total) {
        const before = dp[total] as number;
        dp[total] = before + (dp[total - num] as number);
        steps.push({
          state: {
            dp: [...dp],
            dpLabels,
            nums: [...nums],
            dpHighlights: [total - num],
            dpSecondary: [total],
            result: null,
          },
          highlights: [total],
          pointers: { total, last: num },
          message: `Last number ${num} ⇒ add dp[${total - num}] = ${dp[total - num]} ways. dp[${total}]: ${before} → ${dp[total]}`,
          codeLine: 7,
          action: 'insert',
        });
      }
    }
  }

  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...nums], dpHighlights: [target], result: dp[target] },
    highlights: [target],
    message: `Result: ${dp[target]} ordered combinations sum to ${target}`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

function runCombinationSumIVMemo(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as CombinationSumIVInput;
  const steps: AlgorithmStep[] = [];

  const memo: (number | null)[] = new Array(target + 1).fill(null);
  const dpLabels = Array.from({ length: target + 1 }, (_, i) => `t=${i}`);
  memo[0] = 1;

  steps.push({
    state: { dp: [...memo], dpLabels, nums: [...nums], dpHighlights: [0], result: null },
    highlights: [0],
    message: `Top-down view: dfs(remain) answers "how many ordered combinations sum to remain?". Seed memo[0] = 1 and let recursion discover the rest`,
    codeLine: 2,
  });

  const dfs = (remain: number, depth: number): number => {
    if (memo[remain] !== null) {
      steps.push({
        state: { dp: [...memo], dpLabels, nums: [...nums], dpHighlights: [remain], result: null },
        highlights: [remain],
        pointers: { remain, depth },
        message: `dfs(${remain}) is already memoized as ${memo[remain]} — return instantly instead of re-exploring that subtree`,
        codeLine: 6,
        action: 'found',
      });
      return memo[remain] as number;
    }

    steps.push({
      state: { dp: [...memo], dpLabels, nums: [...nums], dpSecondary: [remain], result: null },
      highlights: [remain],
      pointers: { remain, depth },
      message: `dfs(${remain}): first visit. Try every number as the LAST element and recurse on what is left`,
      codeLine: 4,
      action: 'visit',
    });

    let total = 0;
    for (const num of nums) {
      if (num <= remain) {
        steps.push({
          state: {
            dp: [...memo],
            dpLabels,
            nums: [...nums],
            dpHighlights: [remain - num],
            dpSecondary: [remain],
            result: null,
          },
          highlights: [remain],
          pointers: { remain, last: num },
          message: `Place ${num} last ⇒ recurse into dfs(${remain - num})`,
          codeLine: 10,
          action: 'push',
        });
        total += dfs(remain - num, depth + 1);
      }
    }

    memo[remain] = total;
    steps.push({
      state: { dp: [...memo], dpLabels, nums: [...nums], dpHighlights: [remain], result: null },
      highlights: [remain],
      pointers: { remain },
      message: `All choices explored: memo[${remain}] = ${total}. Cached, so any later call is O(1)`,
      codeLine: 11,
      action: 'insert',
    });
    return total;
  };

  const answer = dfs(target, 0);

  steps.push({
    state: { dp: [...memo], dpLabels, nums: [...nums], dpHighlights: [target], result: answer },
    highlights: [target],
    message: `Result: ${answer} ordered combinations. Memoization visits each remainder once — same O(target·n) work as the bottom-up table`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

export const combinationSumIV: Algorithm = {
  id: 'combination-sum-iv',
  name: 'Combination Sum IV',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(target·n)',
  spaceComplexity: 'O(target)',
  pattern: 'DP — dp[t] = sum of dp[t - num]; loop totals outside so order counts',
  description:
    'Given an array of distinct integers nums and a target integer, return the number of possible combinations that add up to target. Different orderings of the same numbers count as different combinations.',
  problemUrl: 'https://leetcode.com/problems/combination-sum-iv/',
  code: {
    python: `def combinationSum4(nums, target):
    dp = [0] * (target + 1)
    dp[0] = 1
    for total in range(1, target + 1):
        for num in nums:
            if num <= total:
                dp[total] += dp[total - num]
    return dp[target]`,
    javascript: `function combinationSum4(nums, target) {
    const dp = new Array(target + 1).fill(0);
    dp[0] = 1;
    for (let total = 1; total <= target; total++) {
        for (const num of nums) {
            if (num <= total) {
                dp[total] += dp[total - num];
            }
        }
    }
    return dp[target];
}`,
    java: `public static int combinationSum4(int[] nums, int target) {
    int[] dp = new int[target + 1];
    dp[0] = 1;
    for (int total = 1; total <= target; total++) {
        for (int num : nums) {
            if (num <= total) {
                dp[total] += dp[total - num];
            }
        }
    }
    return dp[target];
}`,
  },
  defaultInput: { nums: [1, 2, 3], target: 4 },
  run: runCombinationSumIV,
  optimalApproachName: 'Bottom-Up DP',
  approaches: [
    {
      id: 'top-down-memo',
      name: 'Top-Down Memoization',
      timeComplexity: 'O(target·n)',
      spaceComplexity: 'O(target)',
      description:
        'Recurse from the target downward and cache each remainder, so only the remainders actually reachable get computed instead of every total from 1 to target.',
      code: {
        python: `def combinationSum4(nums, target):
    memo = {0: 1}

    def dfs(remain):
        if remain in memo:
            return memo[remain]
        total = 0
        for num in nums:
            if num <= remain:
                total += dfs(remain - num)
        memo[remain] = total
        return total

    return dfs(target)`,
        javascript: `function combinationSum4(nums, target) {
    const memo = new Map([[0, 1]]);

    function dfs(remain) {
        if (memo.has(remain)) return memo.get(remain);
        let total = 0;
        for (const num of nums) {
            if (num <= remain) {
                total += dfs(remain - num);
            }
        }
        memo.set(remain, total);
        return total;
    }

    return dfs(target);
}`,
        java: `public static int combinationSum4(int[] nums, int target) {
    int[] memo = new int[target + 1];
    Arrays.fill(memo, -1);
    memo[0] = 1;
    return dfs(nums, target, memo);
}

private static int dfs(int[] nums, int remain, int[] memo) {
    if (memo[remain] != -1) return memo[remain];
    int total = 0;
    for (int num : nums) {
        if (num <= remain) {
            total += dfs(nums, remain - num, memo);
        }
    }
    memo[remain] = total;
    return total;
}`,
      },
      run: runCombinationSumIVMemo,
      lineExplanations: {
        python: {
          1: 'Define function taking nums and target',
          2: 'Cache seeded with the base case: one way to make 0',
          4: 'Recursive helper answering "ways to reach remain"',
          5: 'Already solved this remainder?',
          6: 'Return the cached count — no re-exploration',
          7: 'Accumulator for this remainder',
          8: 'Try every number as the last one placed',
          9: 'Only usable if it fits in the remainder',
          10: 'Ways ending in num = ways to reach remain - num',
          11: 'Cache before returning so each remainder is solved once',
          12: 'Hand the count back to the caller',
          14: 'Kick off the recursion at the full target',
        },
        javascript: {
          1: 'Define function taking nums and target',
          2: 'Map cache seeded with the base case: one way to make 0',
          4: 'Recursive helper answering "ways to reach remain"',
          5: 'Cache hit returns immediately',
          6: 'Accumulator for this remainder',
          7: 'Try every number as the last one placed',
          8: 'Only usable if it fits in the remainder',
          9: 'Ways ending in num = ways to reach remain - num',
          12: 'Cache before returning so each remainder is solved once',
          13: 'Hand the count back to the caller',
          16: 'Kick off the recursion at the full target',
        },
        java: {
          1: 'Define method taking nums and target',
          2: 'Memo array indexed by remainder',
          3: 'Fill with -1 meaning "not computed yet"',
          4: 'Base case: one way to make 0',
          5: 'Kick off the recursion at the full target',
          8: 'Recursive helper answering "ways to reach remain"',
          9: 'Cache hit returns immediately',
          10: 'Accumulator for this remainder',
          11: 'Try every number as the last one placed',
          12: 'Only usable if it fits in the remainder',
          13: 'Ways ending in num = ways to reach remain - num',
          16: 'Cache before returning so each remainder is solved once',
          17: 'Hand the count back to the caller',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums and target',
      2: 'dp[t] = number of ordered combinations summing to t',
      3: 'Base case: exactly one way to build the empty sum',
      4: 'Outer loop over totals — this is what makes order matter',
      5: 'Inner loop tries each number as the LAST one placed',
      6: 'Skip numbers larger than the current total',
      7: 'Every way to reach total - num extends to a way to reach total',
      8: 'dp[target] is the answer',
    },
    javascript: {
      1: 'Define function taking nums and target',
      2: 'dp[t] = number of ordered combinations summing to t',
      3: 'Base case: exactly one way to build the empty sum',
      4: 'Outer loop over totals — this is what makes order matter',
      5: 'Inner loop tries each number as the LAST one placed',
      6: 'Skip numbers larger than the current total',
      7: 'Every way to reach total - num extends to a way to reach total',
      11: 'dp[target] is the answer',
    },
    java: {
      1: 'Define method taking nums and target',
      2: 'dp[t] = number of ordered combinations summing to t',
      3: 'Base case: exactly one way to build the empty sum',
      4: 'Outer loop over totals — this is what makes order matter',
      5: 'Inner loop tries each number as the LAST one placed',
      6: 'Skip numbers larger than the current total',
      7: 'Every way to reach total - num extends to a way to reach total',
      11: 'dp[target] is the answer',
    },
  },
};
