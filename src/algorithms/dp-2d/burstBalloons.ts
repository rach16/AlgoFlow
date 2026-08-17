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

function runBurstBalloonsMemo(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const balloons = [1, ...nums, 1];
  const n = balloons.length;
  const MAX_STEPS = 75;

  const memoGrid: (number | string)[][] = Array.from({ length: n }, () => new Array(n).fill('·'));
  const memo = new Map<string, number>();

  steps.push({
    state: { dp2d: memoGrid.map(r => [...r]), nums: [...balloons], result: null },
    highlights: [],
    message: `Top-down: start from the WHOLE range (0, ${n - 1}) and recurse. dfs(l, r) = max coins bursting everything strictly between l and r; memoize each interval`,
    codeLine: 4,
  });

  function dfs(l: number, r: number): number {
    if (l + 1 === r) return 0; // no balloons strictly inside
    const key = `${l},${r}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;

    let best = 0;
    let bestK = -1;
    for (let k = l + 1; k < r; k++) {
      const coins = balloons[l] * balloons[k] * balloons[r] + dfs(l, k) + dfs(k, r);
      if (steps.length < MAX_STEPS) {
        steps.push({
          state: {
            dp2d: memoGrid.map(r2 => [...r2]),
            matrixHighlights: [[l, k], [k, r]] as [number, number][],
            matrixSecondary: [[l, r]] as [number, number][],
            nums: [...balloons], result: null,
          },
          highlights: [],
          pointers: { left: l, right: r, k },
          message: `dfs(${l}, ${r}): burst balloon ${k} (value ${balloons[k]}) LAST → ${balloons[l]}·${balloons[k]}·${balloons[r]} + dfs(${l},${k}) + dfs(${k},${r}) = ${coins}`,
          codeLine: 11,
          action: 'compare',
        });
      }
      if (coins > best) {
        best = coins;
        bestK = k;
      }
    }

    memo.set(key, best);
    memoGrid[l][r] = best;

    if (steps.length < MAX_STEPS) {
      steps.push({
        state: {
          dp2d: memoGrid.map(r2 => [...r2]),
          matrixHighlights: [[l, r]] as [number, number][],
          nums: [...balloons], result: null,
        },
        highlights: [],
        pointers: { left: l, right: r },
        message: `memo[${l}][${r}] = ${best} (best last-burst: balloon ${bestK}) — this interval is now solved forever`,
        codeLine: 14,
        action: 'insert',
      });
    }
    return best;
  }

  const result = dfs(0, n - 1);

  steps.push({
    state: {
      dp2d: memoGrid.map(r => [...r]),
      matrixHighlights: [[0, n - 1]] as [number, number][],
      nums: [...balloons], result,
    },
    highlights: [],
    message: `Maximum coins: dfs(0, ${n - 1}) = ${result} — only the ${memo.size} intervals actually needed were computed`,
    codeLine: 16,
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
    java: `public int maxCoins(int[] nums) {
    int[] arr = new int[nums.length + 2];
    arr[0] = 1;
    arr[arr.length - 1] = 1;
    for (int i = 0; i < nums.length; i++) {
        arr[i + 1] = nums[i];
    }
    int n = arr.length;
    int[][] dp = new int[n][n];
    for (int length = 2; length < n; length++) {
        for (int left = 0; left < n - length; left++) {
            int right = left + length;
            for (int k = left + 1; k < right; k++) {
                int coins = arr[left] * arr[k] * arr[right]
                    + dp[left][k] + dp[k][right];
                dp[left][right] = Math.max(dp[left][right], coins);
            }
        }
    }
    return dp[0][n - 1];
}`,
  },
  defaultInput: [3, 1, 5, 8],
  run: runBurstBalloons,
  optimalApproachName: 'Bottom-Up Interval DP',
  approaches: [
    {
      id: 'top-down-memo',
      name: 'Top-Down Memoization',
      timeComplexity: 'O(n³)',
      spaceComplexity: 'O(n²)',
      description:
        'Starts from the full range and recurses on sub-intervals instead of building all gap lengths bottom-up — memoization ensures each interval is still solved only once.',
      code: {
        python: `def maxCoins(nums):
    nums = [1] + nums + [1]
    memo = {}
    def dfs(l, r):
        if l + 1 == r:
            return 0
        if (l, r) in memo:
            return memo[(l, r)]
        best = 0
        for k in range(l + 1, r):
            coins = (nums[l] * nums[k] * nums[r]
                + dfs(l, k) + dfs(k, r))
            best = max(best, coins)
        memo[(l, r)] = best
        return best
    return dfs(0, len(nums) - 1)`,
        javascript: `function maxCoins(nums) {
    nums = [1, ...nums, 1];
    const memo = new Map();
    function dfs(l, r) {
        if (l + 1 === r) return 0;
        const key = l + ',' + r;
        if (memo.has(key)) return memo.get(key);
        let best = 0;
        for (let k = l + 1; k < r; k++) {
            const coins = nums[l] * nums[k] * nums[r]
                + dfs(l, k) + dfs(k, r);
            best = Math.max(best, coins);
        }
        memo.set(key, best);
        return best;
    }
    return dfs(0, nums.length - 1);
}`,
        java: `public int maxCoins(int[] nums) {
    int n = nums.length + 2;
    int[] arr = new int[n];
    arr[0] = 1;
    arr[n - 1] = 1;
    for (int i = 0; i < nums.length; i++) arr[i + 1] = nums[i];
    Integer[][] memo = new Integer[n][n];
    return dfs(arr, 0, n - 1, memo);
}

private int dfs(int[] arr, int l, int r, Integer[][] memo) {
    if (l + 1 == r) return 0;
    if (memo[l][r] != null) return memo[l][r];
    int best = 0;
    for (int k = l + 1; k < r; k++) {
        int coins = arr[l] * arr[k] * arr[r]
            + dfs(arr, l, k, memo) + dfs(arr, k, r, memo);
        best = Math.max(best, coins);
    }
    memo[l][r] = best;
    return best;
}`,
      },
      run: runBurstBalloonsMemo,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'Pad with boundary balloons of value 1',
          3: 'Memo dictionary keyed by interval (l, r)',
          4: 'dfs(l, r) = max coins bursting strictly between l and r',
          5: 'Base case: no balloons inside the interval',
          6: 'Empty interval yields 0 coins',
          7: 'Cache check: interval already solved?',
          8: 'Return the cached best',
          9: 'Track the best coin total for this interval',
          10: 'Try every balloon k as the LAST one burst here',
          11: 'k last means its neighbors are the boundaries l and r',
          12: 'Add the best of the two sub-intervals k splits off',
          13: 'Keep the maximum over all choices of k',
          14: 'Cache the answer for this interval',
          15: 'Return the best for (l, r)',
          16: 'Solve the full range between the padded boundaries',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'Pad with boundary balloons of value 1',
          3: 'Memo map keyed by "l,r" interval',
          4: 'dfs(l, r) = max coins bursting strictly between l and r',
          5: 'Base case: no balloons inside — 0 coins',
          6: 'Build the memo key for this interval',
          7: 'Return the cached best if already solved',
          8: 'Track the best coin total for this interval',
          9: 'Try every balloon k as the LAST one burst here',
          10: 'k last means its neighbors are the boundaries l and r',
          11: 'Add the best of the two sub-intervals k splits off',
          12: 'Keep the maximum over all choices of k',
          14: 'Cache the answer for this interval',
          15: 'Return the best for (l, r)',
          17: 'Solve the full range between the padded boundaries',
        },
        java: {
          1: 'Define method taking nums array',
          2: 'Total length including two boundary balloons',
          3: 'Allocate the padded array',
          4: 'Left boundary balloon = 1',
          5: 'Right boundary balloon = 1',
          6: 'Copy original balloons into the middle',
          7: 'Integer[][] memo — null marks unsolved intervals',
          8: 'Solve the full range between the boundaries',
          11: 'dfs(l, r) = max coins bursting strictly between l and r',
          12: 'Base case: no balloons inside — 0 coins',
          13: 'Return the cached best if already solved',
          14: 'Track the best coin total for this interval',
          15: 'Try every balloon k as the LAST one burst here',
          16: 'k last means its neighbors are the boundaries l and r',
          17: 'Add the best of the two sub-intervals k splits off',
          18: 'Keep the maximum over all choices of k',
          20: 'Cache the answer for this interval',
          21: 'Return the best for (l, r)',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Add boundary balloons with value 1',
      3: 'Get total length including boundaries',
      4: 'Create n x n DP table filled with zeros',
      5: 'Iterate over increasing gap lengths',
      6: 'Iterate over left boundary positions',
      7: 'Compute right boundary from left + length',
      8: 'Try each balloon k as last to burst',
      9: 'Compute coins: left * k * right + subproblems',
      10: 'Continuation of coins calculation',
      11: 'Continuation: add left and right subproblems',
      12: 'Update dp[left][right] with max coins',
      13: 'Continuation of max expression',
      14: 'Return max coins for full range',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Add boundary balloons with value 1',
      3: 'Get total length including boundaries',
      4: 'Create n x n DP table filled with zeros',
      5: 'Continuation of array initialization',
      6: 'Iterate over increasing gap lengths',
      7: 'Iterate over left boundary positions',
      8: 'Compute right boundary from left + length',
      9: 'Try each balloon k as last to burst',
      10: 'Compute coins: left * k * right',
      11: 'Continuation: multiply by right boundary',
      12: 'Add left and right subproblem results',
      13: 'Update dp[left][right] with max coins',
      14: 'Continuation of max expression',
      18: 'Return max coins for full range',
    },
    java: {
      1: 'Define method taking nums array',
      2: 'Create extended array with boundary slots',
      3: 'Set left boundary to 1',
      4: 'Set right boundary to 1',
      5: 'Copy original nums into extended array',
      6: 'Copy each element shifted by 1',
      8: 'Get total length including boundaries',
      9: 'Create n x n DP table initialized to 0',
      10: 'Iterate over increasing gap lengths',
      11: 'Iterate over left boundary positions',
      12: 'Compute right boundary from left + length',
      13: 'Try each balloon k as last to burst',
      14: 'Compute coins: left * k * right + subproblems',
      15: 'Add left and right subproblem results',
      16: 'Update dp[left][right] with max coins',
      20: 'Return max coins for full range',
    },
  },
};
