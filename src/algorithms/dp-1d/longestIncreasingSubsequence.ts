import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runLongestIncreasingSubsequence(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  if (n === 0) {
    steps.push({ state: { nums: [], dp: [], result: 0 }, highlights: [], message: 'Empty array. Result: 0', codeLine: 1 });
    return steps;
  }

  // dp[i] = length of LIS ending at index i
  const dp: (number | null)[] = new Array(n).fill(null);
  const dpLabels = Array.from({ length: n }, (_, i) => `${nums[i]}`);

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, result: null },
    highlights: [],
    message: `Find length of longest increasing subsequence in [${nums.join(', ')}]`,
    codeLine: 1,
  });

  // Initialize all dp values to 1 (each element is a subsequence of length 1)
  for (let i = 0; i < n; i++) {
    dp[i] = 1;
  }
  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, result: null },
    highlights: Array.from({ length: n }, (_, i) => i),
    message: `Initialize: every element has LIS of at least 1`,
    codeLine: 2,
    action: 'insert',
  });

  let maxLen = 1;

  for (let i = 1; i < n; i++) {
    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i], result: maxLen },
      highlights: [i],
      pointers: { i },
      message: `Computing dp[${i}] for nums[${i}] = ${nums[i]}`,
      codeLine: 4,
      action: 'visit',
    });

    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        steps.push({
          state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [j, i], result: maxLen },
          highlights: [j, i],
          pointers: { i, j },
          message: `nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]}: dp[${i}] = max(dp[${i}], dp[${j}]+1) = max(${dp[i]}, ${(dp[j] as number) + 1})`,
          codeLine: 6,
          action: 'compare',
        });

        if ((dp[j] as number) + 1 > (dp[i] as number)) {
          dp[i] = (dp[j] as number) + 1;

          steps.push({
            state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i], result: maxLen },
            highlights: [i],
            pointers: { i },
            message: `dp[${i}] updated to ${dp[i]}`,
            codeLine: 6,
            action: 'insert',
          });
        }
      }
    }

    if ((dp[i] as number) > maxLen) {
      maxLen = dp[i] as number;
      steps.push({
        state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i], result: maxLen },
        highlights: [i],
        message: `New longest: LIS ending at index ${i} has length ${maxLen}`,
        codeLine: 7,
        action: 'found',
      });
    }
  }

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, result: maxLen },
    highlights: [],
    message: `Length of longest increasing subsequence: ${maxLen}`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

function runLISBinarySearch(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  if (n === 0) {
    steps.push({ state: { nums: [], dp: [], result: 0 }, highlights: [], message: 'Empty array. Result: 0', codeLine: 1 });
    return steps;
  }

  const tails: number[] = [];
  const dpLabels = Array.from({ length: n }, (_, i) => `len ${i + 1}`);

  const dpView = () => {
    const view: (number | null)[] = new Array(n).fill(null);
    tails.forEach((v, idx) => (view[idx] = v));
    return view;
  };

  steps.push({
    state: { nums: [...nums], dp: dpView(), dpLabels, result: 0 },
    highlights: [],
    message: `Patience sorting: tails[k] = smallest possible tail of an increasing subsequence of length k+1. Keeping tails small leaves maximum room to grow`,
    codeLine: 2,
  });

  for (let i = 0; i < n; i++) {
    const num = nums[i];

    // Binary search for the leftmost position where tails[pos] >= num
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < num) lo = mid + 1;
      else hi = mid;
    }

    steps.push({
      state: { nums: [...nums], dp: dpView(), dpLabels, dpSecondary: lo < tails.length ? [lo] : [], result: tails.length },
      highlights: [i],
      pointers: { i, pos: lo },
      message: `nums[${i}] = ${num}: binary search tails [${tails.join(', ')}] → position ${lo} (first tail ≥ ${num})`,
      codeLine: 5,
      action: 'compare',
    });

    if (lo === tails.length) {
      tails.push(num);
      steps.push({
        state: { nums: [...nums], dp: dpView(), dpLabels, dpHighlights: [lo], result: tails.length },
        highlights: [i],
        pointers: { i, pos: lo },
        message: `${num} is bigger than every tail — it EXTENDS the longest subsequence. tails = [${tails.join(', ')}], LIS length now ${tails.length}`,
        codeLine: 12,
        action: 'push',
      });
    } else {
      const old = tails[lo];
      tails[lo] = num;
      steps.push({
        state: { nums: [...nums], dp: dpView(), dpLabels, dpHighlights: [lo], result: tails.length },
        highlights: [i],
        pointers: { i, pos: lo },
        message: `Replace tails[${lo}] = ${old} with ${num}: a length-${lo + 1} subsequence now ends lower, making future extensions easier. Length stays ${tails.length}`,
        codeLine: 14,
        action: 'swap',
      });
    }
  }

  steps.push({
    state: { nums: [...nums], dp: dpView(), dpLabels, result: tails.length },
    highlights: [],
    message: `LIS length = ${tails.length} (size of tails). Note: tails itself is not necessarily a real subsequence — only its LENGTH is the answer`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

export const longestIncreasingSubsequence: Algorithm = {
  id: 'longest-increasing-subsequence',
  name: 'Longest Increasing Subsequence',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(n)',
  pattern: 'DP — dp[i] = LIS ending at i, check all j < i',
  description:
    'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
  problemUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
  code: {
    python: `def lengthOfLIS(nums):
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i],
                            dp[j] + 1)
    return max(dp)`,
    javascript: `function lengthOfLIS(nums) {
    const dp = new Array(nums.length).fill(1);
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i],
                                 dp[j] + 1);
            }
        }
    }
    return Math.max(...dp);
}`,
    java: `public int lengthOfLIS(int[] nums) {
    int[] dp = new int[nums.length];
    Arrays.fill(dp, 1);
    int maxLen = 1;
    for (int i = 1; i < nums.length; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        maxLen = Math.max(maxLen, dp[i]);
    }
    return maxLen;
}`,
  },
  defaultInput: [10, 9, 2, 5, 3, 7, 101, 18],
  run: runLongestIncreasingSubsequence,
  optimalApproachName: 'O(n²) DP',
  approaches: [
    {
      id: 'binary-search-patience',
      name: 'Patience Sorting (Binary Search)',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of comparing every pair, maintain tails[k] = smallest tail of any increasing subsequence of length k+1 and binary-search where each number belongs — O(n log n) vs the DP\'s O(n²).',
      code: {
        python: `def lengthOfLIS(nums):
    tails = []
    for num in nums:
        lo, hi = 0, len(tails)
        while lo < hi:
            mid = (lo + hi) // 2
            if tails[mid] < num:
                lo = mid + 1
            else:
                hi = mid
        if lo == len(tails):
            tails.append(num)
        else:
            tails[lo] = num
    return len(tails)`,
        javascript: `function lengthOfLIS(nums) {
    const tails = [];
    for (const num of nums) {
        let lo = 0, hi = tails.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (tails[mid] < num) lo = mid + 1;
            else hi = mid;
        }
        if (lo === tails.length) tails.push(num);
        else tails[lo] = num;
    }
    return tails.length;
}`,
        java: `public int lengthOfLIS(int[] nums) {
    int[] tails = new int[nums.length];
    int size = 0;
    for (int num : nums) {
        int lo = 0, hi = size;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (tails[mid] < num) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = num;
        if (lo == size) size++;
    }
    return size;
}`,
      },
      run: runLISBinarySearch,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'tails[k] = smallest tail of an increasing subsequence of length k+1',
          3: 'Process each number in order',
          4: 'Binary search bounds over the tails array',
          5: 'Standard binary search loop',
          6: 'Middle of the search range',
          7: 'Tail too small: our number must land further right',
          8: 'Search the right half',
          10: 'Otherwise search the left half',
          11: 'Landed past the end: num beats every tail',
          12: 'Extend — the LIS just got longer',
          14: 'Otherwise replace: same length, but a smaller tail is easier to extend',
          15: 'The number of tails is the LIS length',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'tails[k] = smallest tail of an increasing subsequence of length k+1',
          3: 'Process each number in order',
          4: 'Binary search bounds over the tails array',
          5: 'Standard binary search loop',
          6: 'Middle of the search range',
          7: 'Tail too small: search the right half',
          8: 'Otherwise search the left half',
          10: 'Landed past the end: extend — the LIS just got longer',
          11: 'Otherwise replace: same length, but a smaller tail is easier to extend',
          13: 'The number of tails is the LIS length',
        },
        java: {
          1: 'Define method taking nums array',
          2: 'tails[k] = smallest tail of an increasing subsequence of length k+1',
          3: 'size = how many tails are in use = current LIS length',
          4: 'Process each number in order',
          5: 'Binary search bounds over the used tails',
          6: 'Standard binary search loop',
          7: 'Middle of the search range',
          8: 'Tail too small: search the right half',
          9: 'Otherwise search the left half',
          11: 'Place num at its position (replace or extend)',
          12: 'Placed past the end: the LIS just got longer',
          14: 'size is the LIS length',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Init DP: each element is a subsequence of 1',
      3: 'Check each element as potential LIS end',
      4: 'Compare with all previous elements',
      5: 'If nums[j] < nums[i], can extend LIS',
      6: 'Update dp[i] to max of current or dp[j]+1',
      7: 'Continue max computation on next line',
      8: 'Return the longest LIS found in dp',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Init DP: each element is a subsequence of 1',
      3: 'Check each element as potential LIS end',
      4: 'Compare with all previous elements',
      5: 'If nums[j] < nums[i], can extend LIS',
      6: 'Update dp[i] to max of current or dp[j]+1',
      7: 'Continue max computation on next line',
      11: 'Return the longest LIS found in dp',
    },
    java: {
      1: 'Define method taking nums array',
      2: 'Init DP array for each index',
      3: 'Fill all with 1 (min subsequence length)',
      4: 'Track overall maximum LIS length',
      5: 'Check each element as potential LIS end',
      6: 'Compare with all previous elements',
      7: 'If nums[j] < nums[i], can extend LIS',
      8: 'Update dp[i] to max of current or dp[j]+1',
      11: 'Update maxLen if dp[i] is new best',
      13: 'Return the longest LIS found',
    },
  },
};
