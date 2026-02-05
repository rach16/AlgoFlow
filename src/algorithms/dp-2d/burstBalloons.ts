import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runBurstBalloons(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  // Add boundary balloons with value 1
  const balloons = [1, ...nums, 1];
  const n = balloons.length;

  steps.push({
    state: { nums: [...nums], result: null },
    highlights: [],
    message: `Burst balloons [${nums.join(', ')}] to maximize coins. Add boundary 1s: [${balloons.join(', ')}]`,
    codeLine: 1,
  });

  // dp2d[i][j] = max coins from bursting all balloons between i and j (exclusive)
  const dp2d: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  steps.push({
    state: { dp2d: dp2d.map(r => [...r]), nums: [...balloons], result: null },
    highlights: [],
    message: `dp[i][j] = max coins from bursting balloons between index i and j (exclusive)`,
    codeLine: 2,
  });

  // Fill by subproblem length
  for (let length = 2; length < n; length++) {
    steps.push({
      state: { dp2d: dp2d.map(r => [...r]), nums: [...balloons], result: null },
      highlights: [],
      message: `Processing subproblems of gap length ${length}`,
      codeLine: 4,
      action: 'visit',
    });

    for (let left = 0; left < n - length; left++) {
      const right = left + length;

      for (let k = left + 1; k < right; k++) {
        // k is the last balloon to burst in range (left, right)
        const coins = balloons[left] * balloons[k] * balloons[right] + dp2d[left][k] + dp2d[k][right];

        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[left, k], [k, right]] as [number, number][],
            matrixSecondary: [[left, right]] as [number, number][],
            nums: [...balloons], result: null,
          },
          highlights: [],
          pointers: { left, right, k },
          message: `Burst balloon ${k} last in (${left},${right}): ${balloons[left]}*${balloons[k]}*${balloons[right]} + dp[${left}][${k}] + dp[${k}][${right}] = ${balloons[left] * balloons[k] * balloons[right]} + ${dp2d[left][k]} + ${dp2d[k][right]} = ${coins}`,
          codeLine: 7,
          action: 'compare',
        });

        if (coins > dp2d[left][right]) {
          dp2d[left][right] = coins;

          steps.push({
            state: {
              dp2d: dp2d.map(r => [...r]),
              matrixHighlights: [[left, right]] as [number, number][],
              nums: [...balloons], result: null,
            },
            highlights: [],
            message: `dp[${left}][${right}] updated to ${dp2d[left][right]}`,
            codeLine: 8,
            action: 'insert',
          });
        }
      }
    }
  }

  const result = dp2d[0][n - 1];
  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[0, n - 1]] as [number, number][],
      nums: [...balloons], result,
    },
    highlights: [],
    message: `Maximum coins from bursting all balloons: ${result}`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const burstBalloons: Algorithm = {
  id: 'burst-balloons',
  name: 'Burst Balloons',
  category: '2-D DP',
  difficulty: 'Hard',
  timeComplexity: 'O(n³)',
  spaceComplexity: 'O(n²)',
  pattern: 'Interval DP — choose last balloon to burst in each range',
  description:
    'You are given n balloons, indexed from 0 to n-1. Each balloon is painted with a number on it represented by an array nums. You are asked to burst all the balloons. If you burst the ith balloon, you will get nums[i-1] * nums[i] * nums[i+1] coins. Return the maximum coins you can collect by bursting the balloons wisely.',
  problemUrl: 'https://leetcode.com/problems/burst-balloons/',
  code: {
    python: `def maxCoins(nums):
    nums = [1] + nums + [1]
    n = len(nums)
    dp = [[0]*n for _ in range(n)]
    for length in range(2, n):
        for left in range(n - length):
            right = left + length
            for k in range(left+1, right):
                coins = (nums[left] * nums[k]
                    * nums[right]
                    + dp[left][k] + dp[k][right])
                dp[left][right] = max(
                    dp[left][right], coins)
    return dp[0][n-1]`,
    javascript: `function maxCoins(nums) {
    nums = [1, ...nums, 1];
    const n = nums.length;
    const dp = Array.from({length: n},
        () => new Array(n).fill(0));
    for (let len = 2; len < n; len++) {
        for (let left = 0; left < n - len; left++) {
            const right = left + len;
            for (let k = left+1; k < right; k++) {
                const coins = nums[left]*nums[k]
                    *nums[right]
                    + dp[left][k] + dp[k][right];
                dp[left][right] = Math.max(
                    dp[left][right], coins);
            }
        }
    }
    return dp[0][n-1];
}`,
  },
  defaultInput: [3, 1, 5, 8],
  run: runBurstBalloons,
};
