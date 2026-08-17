import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface SplitArrayInput {
  nums: number[];
  k: number;
}

function runSplitArrayLargestSum(input: unknown): AlgorithmStep[] {
  const { nums, k } = input as SplitArrayInput;
  const steps: AlgorithmStep[] = [];

  const total = nums.reduce((a, b) => a + b, 0);
  const maxNum = Math.max(...nums);

  steps.push({
    state: { nums: [...nums], k },
    highlights: [],
    message: `Split [${nums.join(', ')}] into ${k} contiguous subarrays and minimise the largest subarray sum. Binary search the ANSWER, not the array.`,
    codeLine: 1,
  });

  let left = maxNum;
  let right = total;

  steps.push({
    state: { nums: [...nums], k, left, right },
    highlights: [nums.indexOf(maxNum)],
    pointers: { left, right },
    message: `Answer range: at least max(nums) = ${maxNum} (one element must fit in a piece) and at most sum(nums) = ${total} (one piece holds everything).`,
    codeLine: 2,
  });

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    steps.push({
      state: { nums: [...nums], k, left, right, limit: mid },
      highlights: [],
      pointers: { left, right },
      message: `Guess limit = ${mid}. Question: can we cover the array with at most ${k} pieces if no piece may exceed ${mid}?`,
      codeLine: 15,
      action: 'visit',
    });

    // Greedy feasibility check
    let count = 1;
    let curr = 0;
    for (let i = 0; i < nums.length; i++) {
      if (curr + nums[i] > mid) {
        count++;
        curr = nums[i];
        steps.push({
          state: { nums: [...nums], k, left, right, limit: mid, pieces: count, currentSum: curr },
          highlights: [i],
          secondary: [i - 1],
          pointers: { i },
          message: `Adding ${nums[i]} would push the piece over ${mid} — cut here. Piece ${count} starts at index ${i} with sum ${curr}.`,
          codeLine: 8,
          action: 'compare',
        });
      } else {
        curr += nums[i];
        steps.push({
          state: { nums: [...nums], k, left, right, limit: mid, pieces: count, currentSum: curr },
          highlights: [i],
          pointers: { i },
          message: `${nums[i]} fits: current piece sum = ${curr} <= ${mid}. Greedy always packs as much as it can.`,
          codeLine: 11,
          action: 'compare',
        });
      }
    }

    if (count <= k) {
      steps.push({
        state: { nums: [...nums], k, left, right: mid, limit: mid, pieces: count },
        highlights: [],
        pointers: { left, right: mid },
        message: `Limit ${mid} needs only ${count} piece${count === 1 ? '' : 's'} <= ${k} — feasible! Try a tighter limit: right = ${mid}.`,
        codeLine: 17,
        action: 'found',
      });
      right = mid;
    } else {
      steps.push({
        state: { nums: [...nums], k, left: mid + 1, right, limit: mid, pieces: count },
        highlights: [],
        pointers: { left: mid + 1, right },
        message: `Limit ${mid} forces ${count} pieces > ${k} — too tight. Raise the floor: left = ${mid + 1}.`,
        codeLine: 19,
        action: 'compare',
      });
      left = mid + 1;
    }
  }

  steps.push({
    state: { nums: [...nums], k, result: left },
    highlights: [],
    message: `left met right at ${left} — the smallest limit that still fits in ${k} pieces. Minimum largest subarray sum = ${left}.`,
    codeLine: 21,
    action: 'found',
  });

  return steps;
}

function runSplitArrayLargestSumDP(input: unknown): AlgorithmStep[] {
  const { nums, k } = input as SplitArrayInput;
  const steps: AlgorithmStep[] = [];
  const n = nums.length;
  const INF = Infinity;

  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(INF));
  dp[0][0] = 0;

  const display = () =>
    dp.map((row) => row.map((v) => (v === INF ? '∞' : v))) as (number | string)[][];

  steps.push({
    state: { nums: [...nums], k, dp2d: display(), matrixHighlights: [] },
    highlights: [],
    message: `DP table: dp[i][j] = the best possible "largest piece" when the first i numbers are cut into exactly j pieces. Prefix sums: [${prefix.join(', ')}].`,
    codeLine: 3,
  });

  steps.push({
    state: { nums: [...nums], k, dp2d: display(), matrixHighlights: [[0, 0]] },
    highlights: [],
    message: `Base case dp[0][0] = 0 — zero numbers in zero pieces costs nothing. Everything else starts at ∞ (impossible).`,
    codeLine: 9,
    action: 'insert',
  });

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= k; j++) {
      let best = INF;
      let bestP = -1;
      for (let p = 0; p < i; p++) {
        if (dp[p][j - 1] < INF) {
          const cost = Math.max(dp[p][j - 1], prefix[i] - prefix[p]);
          if (cost < best) {
            best = cost;
            bestP = p;
          }
        }
      }
      dp[i][j] = best;

      steps.push({
        state: { nums: [...nums], k, dp2d: display(), matrixHighlights: [[i, j]] },
        highlights: bestP >= 0 ? Array.from({ length: i - bestP }, (_, t) => bestP + t) : [],
        message:
          best === INF
            ? `dp[${i}][${j}] = ∞ — you cannot cut ${i} number${i === 1 ? '' : 's'} into ${j} non-empty pieces.`
            : `dp[${i}][${j}] = ${best}: cut after index ${bestP - 1 < 0 ? 'nothing' : bestP - 1}, so the last piece is [${nums.slice(bestP, i).join(', ')}] summing ${prefix[i] - prefix[bestP]}, paired with dp[${bestP}][${j - 1}] = ${dp[bestP][j - 1] === INF ? '∞' : dp[bestP][j - 1]}.`,
        codeLine: 15,
        action: best === INF ? 'visit' : 'compare',
      });
    }
  }

  steps.push({
    state: { nums: [...nums], k, dp2d: display(), matrixHighlights: [[n, k]], result: dp[n][k] },
    highlights: [],
    message: `dp[${n}][${k}] = ${dp[n][k]} — same answer as the binary search, but this filled n*k cells each scanning n split points: O(n^2 * k) instead of O(n log(sum)).`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

export const splitArrayLargestSum: Algorithm = {
  id: 'split-array-largest-sum',
  name: 'Split Array Largest Sum',
  category: 'Binary Search',
  difficulty: 'Hard',
  timeComplexity: 'O(n log(sum))',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search on Answer — smallest limit that fits in k pieces',
  description:
    'Given an integer array nums and an integer k, split nums into k non-empty contiguous subarrays so that the largest subarray sum is as small as possible. Return that minimized largest sum.',
  problemUrl: 'https://leetcode.com/problems/split-array-largest-sum/',
  code: {
    python: `def splitArray(nums, k):
    left, right = max(nums), sum(nums)

    def pieces(limit):
        count, curr = 1, 0
        for num in nums:
            if curr + num > limit:
                count += 1
                curr = num
            else:
                curr += num
        return count

    while left < right:
        mid = (left + right) // 2
        if pieces(mid) <= k:
            right = mid
        else:
            left = mid + 1

    return left`,
    javascript: `function splitArray(nums, k) {
    let left = Math.max(...nums);
    let right = nums.reduce((a, b) => a + b, 0);

    const pieces = (limit) => {
        let count = 1;
        let curr = 0;
        for (const num of nums) {
            if (curr + num > limit) {
                count++;
                curr = num;
            } else {
                curr += num;
            }
        }
        return count;
    };

    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (pieces(mid) <= k) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }

    return left;
}`,
    java: `public static int splitArray(int[] nums, int k) {
    int left = 0;
    int right = 0;
    for (int num : nums) {
        left = Math.max(left, num);
        right += num;
    }

    while (left < right) {
        int mid = left + (right - left) / 2;
        if (pieces(nums, mid) <= k) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }

    return left;
}

private static int pieces(int[] nums, int limit) {
    int count = 1;
    int curr = 0;
    for (int num : nums) {
        if (curr + num > limit) {
            count++;
            curr = num;
        } else {
            curr += num;
        }
    }
    return count;
}`,
  },
  defaultInput: { nums: [7, 2, 5, 10, 8], k: 2 },
  run: runSplitArrayLargestSum,
  optimalApproachName: 'Binary Search on Answer',
  approaches: [
    {
      id: 'interval-dp',
      name: '2-D DP',
      timeComplexity: 'O(n^2 * k)',
      spaceComplexity: 'O(n * k)',
      description:
        'Build a table dp[i][j] = best largest-piece for the first i numbers in j pieces, trying every split point — the classic editorial DP, but far slower than binary searching the answer.',
      code: {
        python: `def splitArray(nums, k):
    n = len(nums)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + nums[i]

    INF = float('inf')
    dp = [[INF] * (k + 1) for _ in range(n + 1)]
    dp[0][0] = 0

    for i in range(1, n + 1):
        for j in range(1, k + 1):
            for p in range(i):
                if dp[p][j - 1] < INF:
                    dp[i][j] = min(dp[i][j], max(dp[p][j - 1], prefix[i] - prefix[p]))

    return dp[n][k]`,
        javascript: `function splitArray(nums, k) {
    const n = nums.length;
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }

    const INF = Infinity;
    const dp = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(INF));
    dp[0][0] = 0;

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= k; j++) {
            for (let p = 0; p < i; p++) {
                if (dp[p][j - 1] < INF) {
                    dp[i][j] = Math.min(dp[i][j], Math.max(dp[p][j - 1], prefix[i] - prefix[p]));
                }
            }
        }
    }

    return dp[n][k];
}`,
        java: `public static int splitArray(int[] nums, int k) {
    int n = nums.length;
    int[] prefix = new int[n + 1];
    for (int i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }

    int[][] dp = new int[n + 1][k + 1];
    for (int[] row : dp) {
        Arrays.fill(row, Integer.MAX_VALUE);
    }
    dp[0][0] = 0;

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= k; j++) {
            for (int p = 0; p < i; p++) {
                if (dp[p][j - 1] != Integer.MAX_VALUE) {
                    int cost = Math.max(dp[p][j - 1], prefix[i] - prefix[p]);
                    dp[i][j] = Math.min(dp[i][j], cost);
                }
            }
        }
    }

    return dp[n][k];
}`,
      },
      run: runSplitArrayLargestSumDP,
      lineExplanations: {
        python: {
          1: 'Define function taking the array and the piece count k',
          2: 'Number of elements',
          3: 'Prefix sums let us get any subarray sum in O(1)',
          4: 'Walk the array once to fill the prefix table',
          5: 'prefix[i+1] is the sum of the first i+1 numbers',
          7: 'Infinity marks impossible states',
          8: 'dp[i][j] = best largest-piece for first i numbers in j pieces',
          9: 'Base case: nothing split into nothing costs 0',
          11: 'Consider every prefix length i',
          12: 'Consider every piece count j',
          13: 'Try every place p where the last piece could start',
          14: 'Only extend states that are actually reachable',
          15: 'Cost is the worse of (earlier pieces, this last piece); keep the minimum',
          17: 'Answer: all n numbers in exactly k pieces',
        },
        javascript: {
          1: 'Define function taking the array and the piece count k',
          2: 'Number of elements',
          3: 'Prefix sums let us get any subarray sum in O(1)',
          4: 'Walk the array once to fill the prefix table',
          5: 'prefix[i+1] is the sum of the first i+1 numbers',
          8: 'Infinity marks impossible states',
          9: 'dp[i][j] = best largest-piece for first i numbers in j pieces',
          10: 'Base case: nothing split into nothing costs 0',
          12: 'Consider every prefix length i',
          13: 'Consider every piece count j',
          14: 'Try every place p where the last piece could start',
          15: 'Only extend states that are actually reachable',
          16: 'Cost is the worse of (earlier pieces, this last piece); keep the minimum',
          22: 'Answer: all n numbers in exactly k pieces',
        },
        java: {
          1: 'Define method taking the array and the piece count k',
          2: 'Number of elements',
          3: 'Prefix sums let us get any subarray sum in O(1)',
          4: 'Walk the array once to fill the prefix table',
          5: 'prefix[i+1] is the sum of the first i+1 numbers',
          8: 'dp[i][j] = best largest-piece for first i numbers in j pieces',
          9: 'Initialise every cell as unreachable',
          10: 'MAX_VALUE stands in for infinity',
          12: 'Base case: nothing split into nothing costs 0',
          14: 'Consider every prefix length i',
          15: 'Consider every piece count j',
          16: 'Try every place p where the last piece could start',
          17: 'Only extend states that are actually reachable',
          18: 'Cost is the worse of (earlier pieces, this last piece)',
          19: 'Keep the minimum cost seen for this cell',
          25: 'Answer: all n numbers in exactly k pieces',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the array and the piece count k',
      2: 'The answer is between max(nums) and sum(nums)',
      4: 'Greedy feasibility check for a candidate limit',
      5: 'Start with one piece and an empty running sum',
      6: 'Walk the array left to right',
      7: 'Would adding this number blow past the limit?',
      8: 'Yes — start a new piece',
      9: 'The new piece begins with this number',
      10: 'Otherwise the number fits in the current piece',
      11: 'Add it to the running sum',
      12: 'Return how many pieces the limit forces',
      14: 'Binary search until the bounds converge',
      15: 'Candidate answer in the middle of the range',
      16: 'Does this limit fit inside k pieces?',
      17: 'Feasible — this limit might be the answer, so keep it and shrink right',
      18: 'Not feasible with this limit',
      19: 'Raise the floor past mid',
      21: 'left == right is the smallest feasible largest sum',
    },
    javascript: {
      1: 'Define function taking the array and the piece count k',
      2: 'Lower bound: the biggest single element must fit in a piece',
      3: 'Upper bound: one piece holding the entire array',
      5: 'Greedy feasibility check for a candidate limit',
      6: 'Start with one piece',
      7: 'Running sum of the current piece',
      8: 'Walk the array left to right',
      9: 'Would adding this number blow past the limit?',
      10: 'Yes — start a new piece',
      11: 'The new piece begins with this number',
      13: 'Otherwise add it to the current piece',
      16: 'Return how many pieces the limit forces',
      19: 'Binary search until the bounds converge',
      20: 'Candidate answer in the middle of the range',
      21: 'Does this limit fit inside k pieces?',
      22: 'Feasible — keep this limit and shrink right',
      24: 'Not feasible — raise the floor past mid',
      28: 'left == right is the smallest feasible largest sum',
    },
    java: {
      1: 'Define method taking the array and the piece count k',
      2: 'Lower bound starts at 0 and grows to max(nums)',
      3: 'Upper bound accumulates the total sum',
      4: 'One pass to compute both bounds',
      5: 'Lower bound: the biggest single element must fit in a piece',
      6: 'Upper bound: one piece holding the entire array',
      9: 'Binary search until the bounds converge',
      10: 'Candidate answer, computed without overflow',
      11: 'Does this limit fit inside k pieces?',
      12: 'Feasible — keep this limit and shrink right',
      14: 'Not feasible — raise the floor past mid',
      18: 'left == right is the smallest feasible largest sum',
      21: 'Greedy helper: how many pieces does this limit force?',
      22: 'Start with one piece',
      23: 'Running sum of the current piece',
      24: 'Walk the array left to right',
      25: 'Would adding this number blow past the limit?',
      26: 'Yes — start a new piece',
      27: 'The new piece begins with this number',
      29: 'Otherwise add it to the current piece',
      32: 'Return the piece count',
    },
  },
};
