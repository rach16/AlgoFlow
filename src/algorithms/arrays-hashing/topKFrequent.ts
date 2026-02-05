import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface TopKInput {
  nums: number[];
  k: number;
}

function runTopKFrequent(input: unknown): AlgorithmStep[] {
  const { nums, k } = input as TopKInput;
  const steps: AlgorithmStep[] = [];
  const count: Record<number, number> = {};

  // Initial state
  steps.push({
    state: { nums: [...nums], count: {}, k },
    highlights: [],
    message: `Find the top ${k} most frequent elements in the array`,
    codeLine: 1,
  });

  // Step 1: Count frequencies
  for (let i = 0; i < nums.length; i++) {
    count[nums[i]] = (count[nums[i]] || 0) + 1;

    steps.push({
      state: { nums: [...nums], count: { ...count }, k },
      highlights: [i],
      pointers: { i },
      message: `Count nums[${i}] = ${nums[i]}: frequency is now ${count[nums[i]]}`,
      codeLine: 3,
      action: 'visit',
    });
  }

  // Step 2: Create bucket array (bucket sort by frequency)
  const freq: number[][] = Array.from({ length: nums.length + 1 }, () => []);
  for (const num of Object.keys(count)) {
    const n = Number(num);
    freq[count[n]].push(n);
  }

  // Show bucket creation
  const bucketMap: Record<string, number[]> = {};
  for (let i = freq.length - 1; i >= 0; i--) {
    if (freq[i].length > 0) {
      bucketMap[`freq=${i}`] = [...freq[i]];
    }
  }

  steps.push({
    state: { nums: [...nums], count: { ...count }, hashMap: bucketMap, k },
    highlights: [],
    message: `Created frequency buckets: ${Object.entries(bucketMap).map(([key, vals]) => `${key}: [${vals.join(', ')}]`).join(', ')}`,
    codeLine: 5,
    action: 'insert',
  });

  // Step 3: Collect top K from buckets (highest frequency first)
  const result: number[] = [];
  for (let i = freq.length - 1; i >= 0 && result.length < k; i--) {
    for (const num of freq[i]) {
      if (result.length < k) {
        result.push(num);

        // Highlight indices of this number in original array
        const indices = nums
          .map((n, idx) => (n === num ? idx : -1))
          .filter(idx => idx !== -1);

        steps.push({
          state: { nums: [...nums], count: { ...count }, hashMap: bucketMap, k, result: [...result] },
          highlights: indices,
          message: `Pick ${num} (frequency ${i}) -> result so far: [${result.join(', ')}]`,
          codeLine: 7,
          action: 'found',
        });
      }
    }
  }

  // Final result
  steps.push({
    state: { nums: [...nums], count: { ...count }, k, result: [...result] },
    highlights: [],
    message: `Top ${k} frequent elements: [${result.join(', ')}]`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

export const topKFrequent: Algorithm = {
  id: 'top-k-frequent',
  name: 'Top K Frequent Elements',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Bucket Sort — frequency array indexed by count',
  description:
    'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.',
  problemUrl: 'https://leetcode.com/problems/top-k-frequent-elements/',
  code: {
    python: `def topKFrequent(nums, k):
    count = {}
    for num in nums:
        count[num] = count.get(num, 0) + 1
    freq = [[] for _ in range(len(nums) + 1)]
    for num, cnt in count.items():
        freq[cnt].append(num)
    res = []
    for i in range(len(freq) - 1, -1, -1):
        for num in freq[i]:
            res.append(num)
            if len(res) == k:
                return res`,
    javascript: `function topKFrequent(nums, k) {
    const count = {};
    for (const num of nums) {
        count[num] = (count[num] || 0) + 1;
    }
    const freq = Array.from({length: nums.length + 1}, () => []);
    for (const [num, cnt] of Object.entries(count)) {
        freq[cnt].push(Number(num));
    }
    const res = [];
    for (let i = freq.length - 1; i >= 0; i--) {
        for (const num of freq[i]) {
            res.push(num);
            if (res.length === k) return res;
        }
    }
}`,
  },
  defaultInput: { nums: [1, 1, 1, 2, 2, 3], k: 2 },
  run: runTopKFrequent,
};
