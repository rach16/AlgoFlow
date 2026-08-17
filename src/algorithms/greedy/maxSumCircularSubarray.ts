import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runMaxSumCircularSubarray(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], result: 'Best circular subarray sum?' },
    highlights: [],
    message: `A circular subarray is either a normal (non-wrapping) one, or the whole array minus a middle block. So run Kadane twice: once for the max sum, once for the min sum.`,
    codeLine: 2,
  });

  let total = 0;
  let curMax = 0;
  let maxSum = nums[0];
  let curMin = 0;
  let minSum = nums[0];

  for (let i = 0; i < nums.length; i++) {
    const n = nums[i];
    const extend = curMax + n;
    curMax = Math.max(extend, n);
    maxSum = Math.max(maxSum, curMax);
    curMin = Math.min(curMin + n, n);
    minSum = Math.min(minSum, curMin);
    total += n;

    steps.push({
      state: {
        nums: [...nums],
        result: `maxSum = ${maxSum}, minSum = ${minSum}, total = ${total}`,
      },
      highlights: [i],
      pointers: { i },
      message: `nums[${i}] = ${n}. Max-Kadane: ${extend >= n ? `extend the run to ${curMax}` : `restart at ${curMax}`}, best so far ${maxSum}. Min-Kadane: running min ${curMin}, worst block so far ${minSum}. Total = ${total}.`,
      codeLine: 6,
      action: 'compare',
    });
  }

  if (maxSum < 0) {
    steps.push({
      state: { nums: [...nums], result: maxSum },
      highlights: nums.map((_, i) => i),
      message: `Every number is negative, so minSum equals the whole array and total - minSum = 0 would mean an empty subarray — not allowed. Answer is the single largest element: ${maxSum}.`,
      codeLine: 12,
      action: 'found',
    });
    return steps;
  }

  const wrap = total - minSum;
  const answer = Math.max(maxSum, wrap);
  const wrapWins = wrap > maxSum;

  const wrapIndices: number[] = [];
  if (wrapWins) {
    // Highlight the kept (wrapping) part: everything outside the minimum block.
    let bestLo = 0;
    let bestHi = 0;
    let running = 0;
    let start = 0;
    let best = Infinity;
    for (let i = 0; i < nums.length; i++) {
      if (running > 0) {
        running = 0;
        start = i;
      }
      running += nums[i];
      if (running < best) {
        best = running;
        bestLo = start;
        bestHi = i;
      }
    }
    for (let i = 0; i < nums.length; i++) {
      if (i < bestLo || i > bestHi) wrapIndices.push(i);
    }
  }

  steps.push({
    state: { nums: [...nums], result: answer },
    highlights: wrapWins ? wrapIndices : nums.map((_, i) => i),
    message: `Non-wrapping best = ${maxSum}. Wrapping best = total - minSum = ${total} - (${minSum}) = ${wrap}. ${wrapWins ? `Cutting out the worst middle block wins — answer ${answer}.` : `The plain Kadane answer wins — answer ${answer}.`}`,
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

function runMaxSumCircularSubarrayDeque(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  const prefix: number[] = new Array(2 * n + 1).fill(0);
  for (let i = 0; i < 2 * n; i++) {
    prefix[i + 1] = prefix[i] + nums[i % n];
  }
  const dpLabels = prefix.map((_, i) => `P${i}`);

  steps.push({
    state: {
      nums: [...nums],
      dp: [...prefix],
      dpLabels,
      queue: [0],
      result: 'Sliding window over the doubled array',
    },
    highlights: [],
    message: `Different framing: lay the array down twice and take prefix sums. Any circular subarray is prefix[j] - prefix[i] with j - i <= ${n}, so we want the smallest prefix in a window of width ${n} behind j — a monotonic deque job.`,
    codeLine: 5,
  });

  let result = nums[0];
  const dq: number[] = [0];

  for (let j = 1; j <= 2 * n; j++) {
    if (dq[0] < j - n) {
      const dropped = dq.shift() as number;
      steps.push({
        state: {
          nums: [...nums],
          dp: [...prefix],
          dpLabels,
          dpHighlights: [j],
          queue: [...dq],
          result,
        },
        highlights: [(j - 1) % n],
        message: `Index ${dropped} is now more than ${n} behind j = ${j}, so the subarray would be longer than the array. Evict it from the front.`,
        codeLine: 10,
        action: 'pop',
      });
    }

    const minIdx = dq[0];
    const candidate = prefix[j] - prefix[minIdx];
    const improved = candidate > result;
    result = Math.max(result, candidate);

    while (dq.length && prefix[dq[dq.length - 1]] >= prefix[j]) dq.pop();
    dq.push(j);

    steps.push({
      state: {
        nums: [...nums],
        dp: [...prefix],
        dpLabels,
        dpHighlights: [j],
        dpSecondary: [...dq],
        queue: [...dq],
        result,
      },
      highlights: [(j - 1) % n],
      pointers: { j: (j - 1) % n },
      message: `j = ${j}: best sum ending here = prefix[${j}] - min prefix in window (prefix[${minIdx}]) = ${prefix[j]} - ${prefix[minIdx]} = ${candidate}. ${improved ? `New best: ${result}.` : `Best stays ${result}.`} Push index ${j} after popping prefixes >= ${prefix[j]}.`,
      codeLine: 11,
      action: improved ? 'insert' : 'compare',
    });
  }

  steps.push({
    state: {
      nums: [...nums],
      dp: [...prefix],
      dpLabels,
      queue: [...dq],
      result,
    },
    highlights: nums.map((_, i) => i),
    message: `Window swept the doubled array — maximum circular subarray sum = ${result}. Same answer as the two-Kadane trick, reached through prefix sums instead.`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

export const maxSumCircularSubarray: Algorithm = {
  id: 'max-sum-circular-subarray',
  name: 'Maximum Sum Circular Subarray',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy — Kadane for max and min, total minus min covers the wrap',
  description:
    'Given a circular integer array nums, return the maximum possible sum of a non-empty subarray, where a subarray may wrap around from the end of the array back to the beginning. Each element may be used at most once.',
  problemUrl: 'https://leetcode.com/problems/maximum-sum-circular-subarray/',
  code: {
    python: `def maxSubarraySumCircular(nums):
    total = 0
    curMax, maxSum = 0, nums[0]
    curMin, minSum = 0, nums[0]
    for n in nums:
        curMax = max(curMax + n, n)
        maxSum = max(maxSum, curMax)
        curMin = min(curMin + n, n)
        minSum = min(minSum, curMin)
        total += n
    if maxSum < 0:
        return maxSum
    return max(maxSum, total - minSum)`,
    javascript: `function maxSubarraySumCircular(nums) {
    let total = 0;
    let curMax = 0, maxSum = nums[0];
    let curMin = 0, minSum = nums[0];
    for (const n of nums) {
        curMax = Math.max(curMax + n, n);
        maxSum = Math.max(maxSum, curMax);
        curMin = Math.min(curMin + n, n);
        minSum = Math.min(minSum, curMin);
        total += n;
    }
    if (maxSum < 0) return maxSum;
    return Math.max(maxSum, total - minSum);
}`,
    java: `public static int maxSubarraySumCircular(int[] nums) {
    int total = 0;
    int curMax = 0, maxSum = nums[0];
    int curMin = 0, minSum = nums[0];
    for (int n : nums) {
        curMax = Math.max(curMax + n, n);
        maxSum = Math.max(maxSum, curMax);
        curMin = Math.min(curMin + n, n);
        minSum = Math.min(minSum, curMin);
        total += n;
    }
    if (maxSum < 0) return maxSum;
    return Math.max(maxSum, total - minSum);
}`,
  },
  defaultInput: [5, -3, 5, -1, 2],
  run: runMaxSumCircularSubarray,
  optimalApproachName: 'Kadane Max + Min',
  approaches: [
    {
      id: 'prefix-deque',
      name: 'Prefix Sums + Monotonic Deque',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Rather than reasoning about the wrap separately, duplicate the array, take prefix sums, and slide a width-n window whose minimum prefix is maintained by a monotonic deque.',
      code: {
        python: `from collections import deque

def maxSubarraySumCircular(nums):
    n = len(nums)
    prefix = [0] * (2 * n + 1)
    for i in range(2 * n):
        prefix[i + 1] = prefix[i] + nums[i % n]
    result = nums[0]
    dq = deque([0])
    for j in range(1, 2 * n + 1):
        if dq[0] < j - n:
            dq.popleft()
        result = max(result, prefix[j] - prefix[dq[0]])
        while dq and prefix[dq[-1]] >= prefix[j]:
            dq.pop()
        dq.append(j)
    return result`,
        javascript: `function maxSubarraySumCircular(nums) {
    const n = nums.length;
    const prefix = new Array(2 * n + 1).fill(0);
    for (let i = 0; i < 2 * n; i++) {
        prefix[i + 1] = prefix[i] + nums[i % n];
    }
    let result = nums[0];
    const dq = [0];
    for (let j = 1; j <= 2 * n; j++) {
        if (dq[0] < j - n) dq.shift();
        result = Math.max(result, prefix[j] - prefix[dq[0]]);
        while (dq.length && prefix[dq[dq.length - 1]] >= prefix[j]) dq.pop();
        dq.push(j);
    }
    return result;
}`,
        java: `public static int maxSubarraySumCircular(int[] nums) {
    int n = nums.length;
    int[] prefix = new int[2 * n + 1];
    for (int i = 0; i < 2 * n; i++) {
        prefix[i + 1] = prefix[i] + nums[i % n];
    }
    int result = nums[0];
    Deque<Integer> dq = new ArrayDeque<>();
    dq.add(0);
    for (int j = 1; j <= 2 * n; j++) {
        if (dq.peekFirst() < j - n) dq.pollFirst();
        result = Math.max(result, prefix[j] - prefix[dq.peekFirst()]);
        while (!dq.isEmpty() && prefix[dq.peekLast()] >= prefix[j]) dq.pollLast();
        dq.addLast(j);
    }
    return result;
}`,
      },
      run: runMaxSumCircularSubarrayDeque,
      lineExplanations: {
        python: {
          1: 'Deque gives O(1) pops from both ends',
          3: 'Define function taking nums',
          4: 'Original length',
          5: 'Prefix sums over the array laid down twice',
          6: 'Walk 2n positions',
          7: 'prefix[i+1] = prefix[i] + the wrapped element',
          8: 'Best answer so far (a single element is always valid)',
          9: 'Deque of prefix indices with increasing prefix values',
          10: 'j is the exclusive right end of the candidate subarray',
          11: 'Front index too far back? The subarray would exceed length n',
          12: 'Evict it',
          13: 'Front holds the smallest prefix in the window — best sum ending at j',
          14: 'Any prefix >= prefix[j] can never be the future minimum',
          15: 'Pop it from the back',
          16: 'Push the new index',
          17: 'Return the best sum found',
        },
        javascript: {
          1: 'Define function taking nums',
          2: 'Original length',
          3: 'Prefix sums over the array laid down twice',
          4: 'Walk 2n positions',
          5: 'prefix[i+1] = prefix[i] + the wrapped element',
          7: 'Best answer so far (a single element is always valid)',
          8: 'Deque of prefix indices with increasing prefix values',
          9: 'j is the exclusive right end of the candidate subarray',
          10: 'Front index too far back? Evict — subarray would exceed length n',
          11: 'Front holds the smallest prefix in the window',
          12: 'Any prefix >= prefix[j] can never be the future minimum',
          13: 'Push the new index',
          15: 'Return the best sum found',
        },
        java: {
          1: 'Define method taking nums',
          2: 'Original length',
          3: 'Prefix sums over the array laid down twice',
          4: 'Walk 2n positions',
          5: 'prefix[i+1] = prefix[i] + the wrapped element',
          7: 'Best answer so far (a single element is always valid)',
          8: 'Deque of prefix indices with increasing prefix values',
          9: 'Seed it with prefix index 0',
          10: 'j is the exclusive right end of the candidate subarray',
          11: 'Front index too far back? Evict it',
          12: 'Front holds the smallest prefix in the window',
          13: 'Any prefix >= prefix[j] can never be the future minimum',
          14: 'Push the new index',
          16: 'Return the best sum found',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums',
      2: 'Sum of the entire array',
      3: 'Running and best maximum subarray sums (Kadane)',
      4: 'Running and best minimum subarray sums (inverse Kadane)',
      5: 'One pass computes all four numbers',
      6: 'Extend the max run or restart at n',
      7: 'Track the best non-wrapping sum',
      8: 'Extend the min run or restart at n',
      9: 'Track the worst middle block',
      10: 'Accumulate the total',
      11: 'All elements negative? Then total - minSum would be an empty subarray',
      12: 'Return the largest single element instead',
      13: 'Otherwise the answer is the better of no-wrap and wrap',
    },
    javascript: {
      1: 'Define function taking nums',
      2: 'Sum of the entire array',
      3: 'Running and best maximum subarray sums (Kadane)',
      4: 'Running and best minimum subarray sums (inverse Kadane)',
      5: 'One pass computes all four numbers',
      6: 'Extend the max run or restart at n',
      7: 'Track the best non-wrapping sum',
      8: 'Extend the min run or restart at n',
      9: 'Track the worst middle block',
      10: 'Accumulate the total',
      12: 'All elements negative? Return the largest single element',
      13: 'Otherwise the answer is the better of no-wrap and wrap',
    },
    java: {
      1: 'Define method taking nums',
      2: 'Sum of the entire array',
      3: 'Running and best maximum subarray sums (Kadane)',
      4: 'Running and best minimum subarray sums (inverse Kadane)',
      5: 'One pass computes all four numbers',
      6: 'Extend the max run or restart at n',
      7: 'Track the best non-wrapping sum',
      8: 'Extend the min run or restart at n',
      9: 'Track the worst middle block',
      10: 'Accumulate the total',
      12: 'All elements negative? Return the largest single element',
      13: 'Otherwise the answer is the better of no-wrap and wrap',
    },
  },
};
