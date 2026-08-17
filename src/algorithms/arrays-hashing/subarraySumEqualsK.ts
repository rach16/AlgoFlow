import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface SubarraySumEqualsKInput {
  nums: number[];
  k: number;
}

function runSubarraySumEqualsKCumulative(input: unknown): AlgorithmStep[] {
  const { nums, k } = input as SubarraySumEqualsKInput;
  const steps: AlgorithmStep[] = [];
  const n = nums.length;
  const prefix: number[] = new Array(n + 1).fill(0);
  const labels = Array.from({ length: n + 1 }, (_, i) => `p${i}`);

  steps.push({
    state: { nums: [...nums], dp: [...prefix], dpLabels: labels, dpHighlights: [] },
    highlights: [],
    message: `Build the cumulative array first: p[i] = sum of the first i numbers, so any subarray sum is just p[end] - p[start]`,
    codeLine: 3,
  });

  for (let i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
    steps.push({
      state: {
        nums: [...nums],
        dp: [...prefix],
        dpLabels: labels,
        dpHighlights: [i + 1],
        dpSecondary: [i],
      },
      highlights: [i],
      pointers: { i },
      message: `p${i + 1} = p${i} (${prefix[i]}) + nums[${i}] (${nums[i]}) = ${prefix[i + 1]}`,
      codeLine: 5,
      action: 'insert',
    });
  }

  let total = 0;

  for (let end = 1; end <= n; end++) {
    const matches: number[] = [];
    for (let start = 0; start < end; start++) {
      if (prefix[end] - prefix[start] === k) matches.push(start);
    }

    steps.push({
      state: {
        nums: [...nums],
        dp: [...prefix],
        dpLabels: labels,
        dpHighlights: [end],
        dpSecondary: Array.from({ length: end }, (_, s) => s),
      },
      highlights: [],
      message: `Fix end = ${end} (p${end} = ${prefix[end]}) and test all ${end} earlier prefixes for a gap of exactly ${k}`,
      codeLine: 8,
      action: 'compare',
    });

    for (const start of matches) {
      total++;
      steps.push({
        state: {
          nums: [...nums],
          dp: [...prefix],
          dpLabels: labels,
          dpHighlights: [end],
          dpSecondary: [start],
        },
        highlights: Array.from({ length: end - start }, (_, t) => start + t),
        message: `p${end} - p${start} = ${prefix[end]} - ${prefix[start]} = ${k} → nums[${start}..${end - 1}] counts. Total ${total}`,
        codeLine: 10,
        action: 'found',
      });
    }
  }

  steps.push({
    state: { nums: [...nums], dp: [...prefix], dpLabels: labels, dpHighlights: [], result: total },
    highlights: [],
    message: `${total} subarrays sum to ${k} — correct, but the nested start/end scan is O(n²)`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

function runSubarraySumEqualsK(input: unknown): AlgorithmStep[] {
  const { nums, k } = input as SubarraySumEqualsKInput;
  const steps: AlgorithmStep[] = [];
  const prefixCount: Record<string, number> = { '0': 1 };
  let running = 0;
  let total = 0;

  steps.push({
    state: { nums: [...nums], hashMap: { ...prefixCount } },
    highlights: [],
    message: `A subarray sums to ${k} exactly when running - ${k} was a running sum we already passed. Seed the map with 0 → 1 for subarrays that start at index 0`,
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    running += nums[i];
    const needKey = String(running - k);
    const hits = prefixCount[needKey] || 0;
    total += hits;

    steps.push({
      state: { nums: [...nums], hashMap: { ...prefixCount } },
      highlights: [i],
      pointers: { i },
      message:
        hits > 0
          ? `running = ${running}. Looking for ${running - k}: seen ${hits}× → ${hits} more subarray${hits > 1 ? 's' : ''} end here. Total ${total}`
          : `running = ${running}. Looking for ${running - k}: never seen it, so no subarray ends at index ${i}`,
      codeLine: 7,
      action: hits > 0 ? 'found' : 'compare',
    });

    const key = String(running);
    prefixCount[key] = (prefixCount[key] || 0) + 1;

    steps.push({
      state: { nums: [...nums], hashMap: { ...prefixCount } },
      highlights: [i],
      pointers: { i },
      message: `Record running sum ${running} — it has now been reached ${prefixCount[key]}×`,
      codeLine: 8,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...nums], hashMap: { ...prefixCount }, result: total },
    highlights: [],
    message: `${total} subarrays sum to ${k}, found in a single pass`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const subarraySumEqualsK: Algorithm = {
  id: 'subarray-sum-equals-k',
  name: 'Subarray Sum Equals K',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Prefix/Suffix — count earlier running sums in a hash map',
  description:
    'Given an array of integers nums and an integer k, return the total number of contiguous subarrays whose elements sum to k. The array can contain negative numbers, so a sliding window does not work.',
  problemUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/',
  code: {
    python: `def subarraySum(nums, k):
    prefix_count = {0: 1}
    total = 0
    running = 0
    for num in nums:
        running += num
        total += prefix_count.get(running - k, 0)
        prefix_count[running] = prefix_count.get(running, 0) + 1
    return total`,
    javascript: `function subarraySum(nums, k) {
    const prefixCount = new Map([[0, 1]]);
    let total = 0, running = 0;
    for (const num of nums) {
        running += num;
        total += prefixCount.get(running - k) || 0;
        prefixCount.set(running, (prefixCount.get(running) || 0) + 1);
    }
    return total;
}`,
    java: `public static int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> prefixCount = new HashMap<>();
    prefixCount.put(0, 1);
    int total = 0, running = 0;
    for (int num : nums) {
        running += num;
        total += prefixCount.getOrDefault(running - k, 0);
        prefixCount.put(running, prefixCount.getOrDefault(running, 0) + 1);
    }
    return total;
}`,
  },
  defaultInput: { nums: [3, 4, 7, 2, -3, 1, 4, 2], k: 7 },
  run: runSubarraySumEqualsK,
  optimalApproachName: 'Prefix Sum + Hash Map',
  approaches: [
    {
      id: 'cumulative-array',
      name: 'Cumulative Array',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n)',
      description:
        'Materialises the prefix-sum array first and then tests every (start, end) pair — the same identity as the hash-map solution, but without the map you pay a quadratic scan.',
      code: {
        python: `def subarraySum(nums, k):
    n = len(nums)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + nums[i]
    total = 0
    for end in range(1, n + 1):
        for start in range(end):
            if prefix[end] - prefix[start] == k:
                total += 1
    return total`,
        javascript: `function subarraySum(nums, k) {
    const n = nums.length;
    const prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }
    let total = 0;
    for (let end = 1; end <= n; end++) {
        for (let start = 0; start < end; start++) {
            if (prefix[end] - prefix[start] === k) total++;
        }
    }
    return total;
}`,
        java: `public static int subarraySum(int[] nums, int k) {
    int n = nums.length;
    int[] prefix = new int[n + 1];
    for (int i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }
    int total = 0;
    for (int end = 1; end <= n; end++) {
        for (int start = 0; start < end; start++) {
            if (prefix[end] - prefix[start] == k) total++;
        }
    }
    return total;
}`,
      },
      run: runSubarraySumEqualsKCumulative,
      lineExplanations: {
        python: {
          1: 'Define function taking nums and the target sum k',
          2: 'Number of elements',
          3: 'Cumulative array with a leading 0 for the empty prefix',
          4: 'Walk the array once',
          5: 'Each slot is the previous slot plus the current value',
          6: 'Running count of qualifying subarrays',
          7: 'Choose the exclusive end of the subarray',
          8: 'Choose every possible start before it',
          9: 'The gap between two prefixes is the subarray sum',
          10: 'Exactly k — count this subarray',
          11: 'Return the total',
        },
        javascript: {
          1: 'Define function taking nums and the target sum k',
          2: 'Number of elements',
          3: 'Cumulative array with a leading 0 for the empty prefix',
          4: 'Walk the array once',
          5: 'Each slot is the previous slot plus the current value',
          7: 'Running count of qualifying subarrays',
          8: 'Choose the exclusive end of the subarray',
          9: 'Choose every possible start before it',
          10: 'Gap equal to k means this subarray counts',
          13: 'Return the total',
        },
        java: {
          1: 'Define function taking nums and the target sum k',
          2: 'Number of elements',
          3: 'Cumulative array with a leading 0 for the empty prefix',
          4: 'Walk the array once',
          5: 'Each slot is the previous slot plus the current value',
          7: 'Running count of qualifying subarrays',
          8: 'Choose the exclusive end of the subarray',
          9: 'Choose every possible start before it',
          10: 'Gap equal to k means this subarray counts',
          13: 'Return the total',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums and the target sum k',
      2: 'Map running sum → how many times it has occurred; 0 occurs once before we start',
      3: 'Answer accumulator',
      4: 'Running sum of everything seen so far',
      5: 'Single pass over the array',
      6: 'Extend the running sum',
      7: 'Every earlier prefix equal to running - k closes a valid subarray here',
      8: 'Record the current running sum for future indices',
      9: 'Return how many subarrays summed to k',
    },
    javascript: {
      1: 'Define function taking nums and the target sum k',
      2: 'Map running sum → occurrences; 0 occurs once before we start',
      3: 'Answer accumulator and running sum',
      4: 'Single pass over the array',
      5: 'Extend the running sum',
      6: 'Every earlier prefix equal to running - k closes a valid subarray here',
      7: 'Record the current running sum for future indices',
      9: 'Return how many subarrays summed to k',
    },
    java: {
      1: 'Define function taking nums and the target sum k',
      2: 'Map running sum → how many times it has occurred',
      3: 'The empty prefix has occurred once before we start',
      4: 'Answer accumulator and running sum',
      5: 'Single pass over the array',
      6: 'Extend the running sum',
      7: 'Every earlier prefix equal to running - k closes a valid subarray here',
      8: 'Record the current running sum for future indices',
      10: 'Return how many subarrays summed to k',
    },
  },
};
