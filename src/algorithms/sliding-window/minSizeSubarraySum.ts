import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MinSizeSubarraySumInput {
  nums: number[];
  target: number;
}

const range = (start: number, end: number): number[] =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i);

function runMinSizeSubarraySum(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as MinSizeSubarraySumInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], result: 0, target },
    highlights: [],
    message: `Find the shortest run of values summing to at least ${target}. Every value is positive, so growing the window can only raise the sum and shrinking it can only lower it — that monotonicity is what makes one pass enough.`,
    codeLine: 1,
  });

  let left = 0;
  let total = 0;
  let res = Infinity;

  steps.push({
    state: { nums: [...nums], result: 0, target },
    highlights: [],
    message: 'Window starts empty at index 0 with sum 0, and the best length so far is infinity (meaning "not found yet").',
    codeLine: 2,
  });

  for (let right = 0; right < nums.length; right++) {
    total += nums[right];

    steps.push({
      state: { nums: [...nums], result: res === Infinity ? 0 : res, target },
      highlights: range(left, right),
      pointers: { left, right },
      message: `Expand: add nums[${right}] = ${nums[right]}. Window [${left}..${right}] sums to ${total}${total >= target ? ` — that reaches ${target}!` : `, still short of ${target}.`}`,
      codeLine: 7,
      action: total >= target ? 'compare' : 'insert',
    });

    while (total >= target) {
      const len = right - left + 1;
      const improved = len < res;
      if (improved) res = len;

      steps.push({
        state: { nums: [...nums], result: res, target },
        highlights: range(left, right),
        pointers: { left, right },
        message: improved
          ? `Window [${left}..${right}] has length ${len} and sum ${total} ≥ ${target} — new shortest! best = ${res}.`
          : `Window [${left}..${right}] has length ${len}, which does not beat the best of ${res}.`,
        codeLine: 9,
        action: improved ? 'found' : 'compare',
      });

      total -= nums[left];
      steps.push({
        state: { nums: [...nums], result: res, target },
        highlights: range(left + 1, right),
        secondary: [left],
        pointers: { left: left + 1, right },
        message: `Shrink: drop nums[${left}] = ${nums[left]}, sum falls to ${total}. Keep shrinking while the window still reaches ${target} — a shorter window may still qualify.`,
        codeLine: 10,
        action: 'delete',
      });

      left++;
    }
  }

  const answer = res === Infinity ? 0 : res;
  steps.push({
    state: { nums: [...nums], result: answer, target },
    highlights: [],
    message:
      res === Infinity
        ? `No window ever reached ${target}, so the answer is 0. Each index entered the window once and left once — O(n) total.`
        : `Shortest subarray with sum ≥ ${target} has length ${answer}. Each index entered the window once and left once — O(n) total.`,
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

function runMinSizeSubarrayPrefixBinarySearch(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as MinSizeSubarraySumInput;
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  const labels = Array.from({ length: n + 1 }, (_, i) => `P${i}`);

  steps.push({
    state: { nums: [...nums], dp: Array(n + 1).fill(null), dpLabels: labels, result: 0, target },
    highlights: [],
    message: `Alternative: build prefix sums. Because all values are positive the prefix array is strictly increasing, which means it is sorted — and a sorted array invites binary search.`,
    codeLine: 3,
  });

  const prefix: number[] = [0];
  steps.push({
    state: { nums: [...nums], dp: [0, ...Array(n).fill(null)], dpLabels: labels, dpHighlights: [0], result: 0, target },
    highlights: [],
    message: 'P0 = 0: the sum of the empty prefix. P[j] will hold the sum of the first j values.',
    codeLine: 5,
  });

  for (let i = 0; i < n; i++) {
    prefix.push(prefix[i] + nums[i]);
    steps.push({
      state: {
        nums: [...nums],
        dp: [...prefix, ...Array(n - i - 1).fill(null)],
        dpLabels: labels,
        dpHighlights: [i + 1],
        result: 0,
        target,
      },
      highlights: [i],
      pointers: { i },
      message: `P${i + 1} = P${i} + nums[${i}] = ${prefix[i]} + ${nums[i]} = ${prefix[i + 1]}. Now any window sum equals P[end] - P[start].`,
      codeLine: 7,
      action: 'insert',
    });
  }

  let res = Infinity;

  for (let i = 0; i <= n; i++) {
    const need = prefix[i] + target;

    // binary search for the leftmost j with prefix[j] >= need
    let lo = i;
    let hi = n + 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (prefix[mid] >= need) hi = mid;
      else lo = mid + 1;
    }

    if (lo <= n) {
      const improved = lo - i < res;
      if (improved) res = lo - i;
      steps.push({
        state: {
          nums: [...nums],
          dp: [...prefix],
          dpLabels: labels,
          dpHighlights: [i, lo],
          result: res,
          target,
        },
        highlights: range(i, lo - 1),
        pointers: { start: i },
        message: improved
          ? `Start at index ${i}: need a prefix ≥ P${i} + ${target} = ${need}. Binary search lands on P${lo} = ${prefix[lo]}, so the window is indices ${i}..${lo - 1}, length ${lo - i} — new shortest!`
          : `Start at index ${i}: need a prefix ≥ ${need}. Binary search lands on P${lo}, giving length ${lo - i}, which does not beat ${res}.`,
        codeLine: 12,
        action: improved ? 'found' : 'compare',
      });
    } else {
      steps.push({
        state: {
          nums: [...nums],
          dp: [...prefix],
          dpLabels: labels,
          dpHighlights: [i],
          result: res === Infinity ? 0 : res,
          target,
        },
        highlights: [],
        pointers: { start: i },
        message: `Start at index ${i}: need a prefix ≥ ${need}, but the largest prefix is only ${prefix[n]}. No window starting here can reach ${target}.`,
        codeLine: 13,
        action: 'compare',
      });
    }
  }

  const answer = res === Infinity ? 0 : res;
  steps.push({
    state: { nums: [...nums], dp: [...prefix], dpLabels: labels, result: answer, target },
    highlights: [],
    message: `Answer ${answer}, same as the sliding window. This costs O(n log n) rather than O(n), but it generalizes to arrays with negative values in ways the shrinking window cannot.`,
    codeLine: 16,
    action: 'found',
  });

  return steps;
}

export const minSizeSubarraySum: Algorithm = {
  id: 'min-size-subarray-sum',
  name: 'Minimum Size Subarray Sum',
  category: 'Sliding Window',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Sliding Window — expand to satisfy, shrink to minimize',
  description:
    'Given an array of positive integers nums and a positive integer target, return the minimal length of a subarray whose sum is greater than or equal to target. If there is no such subarray, return 0 instead.',
  problemUrl: 'https://leetcode.com/problems/minimum-size-subarray-sum/',
  code: {
    python: `def minSubArrayLen(target, nums):
    left = 0
    total = 0
    res = float("inf")

    for right in range(len(nums)):
        total += nums[right]
        while total >= target:
            res = min(res, right - left + 1)
            total -= nums[left]
            left += 1

    return 0 if res == float("inf") else res`,
    javascript: `function minSubArrayLen(target, nums) {
    let left = 0;
    let total = 0;
    let res = Infinity;

    for (let right = 0; right < nums.length; right++) {
        total += nums[right];
        while (total >= target) {
            res = Math.min(res, right - left + 1);
            total -= nums[left];
            left++;
        }
    }

    return res === Infinity ? 0 : res;
}`,
    java: `public static int minSubArrayLen(int target, int[] nums) {
    int left = 0;
    int total = 0;
    int res = Integer.MAX_VALUE;

    for (int right = 0; right < nums.length; right++) {
        total += nums[right];
        while (total >= target) {
            res = Math.min(res, right - left + 1);
            total -= nums[left];
            left++;
        }
    }

    return res == Integer.MAX_VALUE ? 0 : res;
}`,
  },
  defaultInput: { nums: [2, 3, 1, 2, 4, 3], target: 7 },
  run: runMinSizeSubarraySum,
  optimalApproachName: 'Sliding Window',
  approaches: [
    {
      id: 'prefix-sum-binary-search',
      name: 'Prefix Sum + Binary Search',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description:
        'Build the (sorted, because all values are positive) prefix-sum array and binary search for the nearest end index that clears the target from each start, trading the window\'s O(n) sweep for an O(n log n) search that no longer depends on shrinking.',
      code: {
        python: `import bisect

def minSubArrayLen(target, nums):
    n = len(nums)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + nums[i]

    res = float("inf")
    for i in range(n + 1):
        need = prefix[i] + target
        j = bisect.bisect_left(prefix, need)
        if j <= n:
            res = min(res, j - i)

    return 0 if res == float("inf") else res`,
        javascript: `function minSubArrayLen(target, nums) {
    const n = nums.length;
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }

    let res = Infinity;
    for (let i = 0; i <= n; i++) {
        const need = prefix[i] + target;
        let lo = i, hi = n + 1;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (prefix[mid] >= need) hi = mid;
            else lo = mid + 1;
        }
        if (lo <= n) res = Math.min(res, lo - i);
    }

    return res === Infinity ? 0 : res;
}`,
        java: `public static int minSubArrayLen(int target, int[] nums) {
    int n = nums.length;
    int[] prefix = new int[n + 1];
    for (int i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }

    int res = Integer.MAX_VALUE;
    for (int i = 0; i <= n; i++) {
        int need = prefix[i] + target;
        int lo = i, hi = n + 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (prefix[mid] >= need) hi = mid;
            else lo = mid + 1;
        }
        if (lo <= n) res = Math.min(res, lo - i);
    }

    return res == Integer.MAX_VALUE ? 0 : res;
}`,
      },
      run: runMinSizeSubarrayPrefixBinarySearch,
      lineExplanations: {
        python: {
          1: 'bisect gives binary search over a sorted list',
          3: 'Take the target sum and the array of positive values',
          4: 'Length of the input array',
          5: 'prefix[j] will hold the sum of the first j values',
          6: 'Fill the prefix array in one pass',
          7: 'Each prefix extends the previous one by nums[i]',
          9: 'Best window length found so far',
          10: 'Consider every possible window start i',
          11: 'A valid end j must satisfy prefix[j] >= prefix[i] + target',
          12: 'Binary search for the leftmost such j — O(log n)',
          13: 'j within range means a valid window exists',
          14: 'Window nums[i..j-1] has length j - i',
          16: 'Return 0 when no window ever cleared the target',
        },
        javascript: {
          1: 'Take the target sum and the array of positive values',
          2: 'Length of the input array',
          3: 'prefix[j] will hold the sum of the first j values',
          4: 'Fill the prefix array in one pass',
          5: 'Each prefix extends the previous one by nums[i]',
          8: 'Best window length found so far',
          9: 'Consider every possible window start i',
          10: 'A valid end must satisfy prefix[end] >= prefix[i] + target',
          11: 'Binary search bounds: ends at or after i',
          12: 'Standard lower-bound binary search loop',
          13: 'Midpoint of the current search range',
          14: 'Prefix is big enough — the answer is at or before mid',
          15: 'Too small — search the right half',
          17: 'A valid end was found; window length is lo - i',
          20: 'Return 0 when no window ever cleared the target',
        },
        java: {
          1: 'Take the target sum and the array of positive values',
          2: 'Length of the input array',
          3: 'prefix[j] will hold the sum of the first j values',
          4: 'Fill the prefix array in one pass',
          5: 'Each prefix extends the previous one by nums[i]',
          8: 'Best window length found so far',
          9: 'Consider every possible window start i',
          10: 'A valid end must satisfy prefix[end] >= prefix[i] + target',
          11: 'Binary search bounds: ends at or after i',
          12: 'Standard lower-bound binary search loop',
          13: 'Midpoint of the current search range',
          14: 'Prefix is big enough — the answer is at or before mid',
          15: 'Too small — search the right half',
          17: 'A valid end was found; window length is lo - i',
          20: 'Return 0 when no window ever cleared the target',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Take the target sum and the array of positive values',
      2: 'Left edge of the current window',
      3: 'Running sum of the values inside the window',
      4: 'Shortest qualifying length seen so far (none yet)',
      6: 'Expand the window one index at a time',
      7: 'Adding a positive value can only raise the sum',
      8: 'While the window still clears the target...',
      9: '...record its length — it is a valid candidate',
      10: 'Drop the leftmost value to try a shorter window',
      11: 'Advance the left edge',
      13: 'Never reached the target means the answer is 0',
    },
    javascript: {
      1: 'Take the target sum and the array of positive values',
      2: 'Left edge of the current window',
      3: 'Running sum of the values inside the window',
      4: 'Shortest qualifying length seen so far (none yet)',
      6: 'Expand the window one index at a time',
      7: 'Adding a positive value can only raise the sum',
      8: 'While the window still clears the target...',
      9: '...record its length — it is a valid candidate',
      10: 'Drop the leftmost value to try a shorter window',
      11: 'Advance the left edge',
      15: 'Never reached the target means the answer is 0',
    },
    java: {
      1: 'Take the target sum and the array of positive values',
      2: 'Left edge of the current window',
      3: 'Running sum of the values inside the window',
      4: 'Shortest qualifying length seen so far (none yet)',
      6: 'Expand the window one index at a time',
      7: 'Adding a positive value can only raise the sum',
      8: 'While the window still clears the target...',
      9: '...record its length — it is a valid candidate',
      10: 'Drop the leftmost value to try a shorter window',
      11: 'Advance the left edge',
      15: 'Never reached the target means the answer is 0',
    },
  },
};
