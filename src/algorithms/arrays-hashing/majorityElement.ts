import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runMajorityElement(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  let count = 0;
  let candidate: number | null = null;

  steps.push({
    state: { nums: [...nums], hashMap: { candidate: 'none', count: '0' } },
    highlights: [],
    message: `Boyer-Moore voting: the majority element appears more than ${Math.floor(nums.length / 2)} times, so pairing it off against every other element still leaves it standing.`,
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    if (count === 0) {
      candidate = nums[i];
      steps.push({
        state: { nums: [...nums], hashMap: { candidate: String(candidate), count: '0' } },
        highlights: [i],
        pointers: { i },
        message: `count hit 0 — everything before index ${i} cancelled out. Adopt nums[${i}] = ${nums[i]} as the new candidate.`,
        codeLine: 6,
        action: 'insert',
      });
    }

    count += nums[i] === candidate ? 1 : -1;

    steps.push({
      state: { nums: [...nums], hashMap: { candidate: String(candidate), count: String(count) } },
      highlights: [i],
      secondary: Array.from({ length: i }, (_, k) => k),
      pointers: { i },
      message:
        nums[i] === candidate
          ? `nums[${i}] = ${nums[i]} votes for candidate ${candidate} — count rises to ${count}`
          : `nums[${i}] = ${nums[i]} votes against candidate ${candidate} — they cancel, count drops to ${count}`,
      codeLine: 7,
      action: 'compare',
    });
  }

  steps.push({
    state: { nums: [...nums], hashMap: { candidate: String(candidate), count: String(count) }, result: candidate },
    highlights: nums.map((v, i) => (v === candidate ? i : -1)).filter((i) => i >= 0),
    message: `${candidate} survived every cancellation with count = ${count} — it is the majority element. O(1) extra space, no map needed.`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

function runMajorityElementHashMap(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const counts: Record<string, number> = {};
  const half = Math.floor(nums.length / 2);

  steps.push({
    state: { nums: [...nums], count: {} },
    highlights: [],
    message: `Count every value outright. The first value whose tally passes ${half} (n // 2) must be the majority element.`,
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    const key = String(nums[i]);
    counts[key] = (counts[key] ?? 0) + 1;

    steps.push({
      state: { nums: [...nums], count: { ...counts } },
      highlights: [i],
      pointers: { i },
      message: `nums[${i}] = ${nums[i]} → its tally is now ${counts[key]}`,
      codeLine: 4,
      action: 'insert',
    });

    if (counts[key] > half) {
      steps.push({
        state: { nums: [...nums], count: { ...counts }, result: nums[i] },
        highlights: nums.map((v, k) => (v === nums[i] && k <= i ? k : -1)).filter((k) => k >= 0),
        pointers: { i },
        message: `${nums[i]} has ${counts[key]} occurrences > ${half} — majority found. Costs O(n) memory, unlike the voting scan.`,
        codeLine: 6,
        action: 'found',
      });
      return steps;
    }
  }

  steps.push({
    state: { nums: [...nums], count: { ...counts }, result: -1 },
    highlights: [],
    message: 'No value exceeded n // 2 — no majority element exists.',
    codeLine: 7,
  });

  return steps;
}

export const majorityElement: Algorithm = {
  id: 'majority-element',
  name: 'Majority Element',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Boyer-Moore Voting — cancel each non-candidate against the candidate',
  description:
    'Given an array nums of size n, return the majority element — the element that appears more than n / 2 times. You may assume that the majority element always exists in the array.',
  problemUrl: 'https://leetcode.com/problems/majority-element/',
  code: {
    python: `def majorityElement(nums):
    count = 0
    candidate = None
    for num in nums:
        if count == 0:
            candidate = num
        count += 1 if num == candidate else -1
    return candidate`,
    javascript: `function majorityElement(nums) {
    let count = 0;
    let candidate = null;
    for (const num of nums) {
        if (count === 0) {
            candidate = num;
        }
        count += num === candidate ? 1 : -1;
    }
    return candidate;
}`,
    java: `public static int majorityElement(int[] nums) {
    int count = 0;
    int candidate = 0;
    for (int num : nums) {
        if (count == 0) {
            candidate = num;
        }
        count += (num == candidate) ? 1 : -1;
    }
    return candidate;
}`,
  },
  defaultInput: [2, 2, 1, 1, 1, 2, 2],
  run: runMajorityElement,
  optimalApproachName: 'Boyer-Moore Voting',
  approaches: [
    {
      id: 'hash-map-counting',
      name: 'Hash Map Counting',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Tally every value in a hash map and return the first one whose count passes n // 2 — same linear time as voting, but it pays O(n) memory instead of two variables.',
      code: {
        python: `def majorityElement(nums):
    counts = {}
    for num in nums:
        counts[num] = counts.get(num, 0) + 1
        if counts[num] > len(nums) // 2:
            return num
    return -1`,
        javascript: `function majorityElement(nums) {
    const counts = new Map();
    for (const num of nums) {
        counts.set(num, (counts.get(num) || 0) + 1);
        if (counts.get(num) > Math.floor(nums.length / 2)) {
            return num;
        }
    }
    return -1;
}`,
        java: `public static int majorityElement(int[] nums) {
    Map<Integer, Integer> counts = new HashMap<>();
    for (int num : nums) {
        counts.put(num, counts.getOrDefault(num, 0) + 1);
        if (counts.get(num) > nums.length / 2) {
            return num;
        }
    }
    return -1;
}`,
      },
      run: runMajorityElementHashMap,
      lineExplanations: {
        python: {
          1: 'Define function taking the nums array',
          2: 'Map from value to how many times it has been seen',
          3: 'Walk every element once',
          4: 'get(k, 0) returns 0 for a key never seen, so its first count becomes 1 — no KeyError',
          5: 'More than half the array means majority',
          6: 'Return as soon as the threshold is crossed',
          7: 'No majority element (cannot happen under the problem guarantee)',
        },
        javascript: {
          1: 'Define function taking the nums array',
          2: 'Map from value to how many times it has been seen',
          3: 'Walk every element once',
          4: 'Bump this value tally by one',
          5: 'More than half the array means majority',
          6: 'Return as soon as the threshold is crossed',
          9: 'No majority element (cannot happen under the problem guarantee)',
        },
        java: {
          1: 'Define function taking the nums array',
          2: 'Map from value to how many times it has been seen',
          3: 'Walk every element once',
          4: 'getOrDefault gives 0 instead of the null get() would return, so a first sighting becomes 1',
          5: 'More than half the array means majority',
          6: 'Return as soon as the threshold is crossed',
          9: 'No majority element (cannot happen under the problem guarantee)',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the nums array',
      2: 'Net votes for the current candidate',
      3: 'The value currently believed to be the majority',
      4: 'Single pass over the array',
      5: 'Votes fully cancelled — the prefix so far is balanced',
      6: 'Adopt the current element as the new candidate',
      7: 'Same value adds a vote, different value cancels one',
      8: 'The survivor is the majority element',
    },
    javascript: {
      1: 'Define function taking the nums array',
      2: 'Net votes for the current candidate',
      3: 'The value currently believed to be the majority',
      4: 'Single pass over the array',
      5: 'Votes fully cancelled — the prefix so far is balanced',
      6: 'Adopt the current element as the new candidate',
      8: 'Same value adds a vote, different value cancels one',
      10: 'The survivor is the majority element',
    },
    java: {
      1: 'Define function taking the nums array',
      2: 'Net votes for the current candidate',
      3: 'The value currently believed to be the majority',
      4: 'Single pass over the array',
      5: 'Votes fully cancelled — the prefix so far is balanced',
      6: 'Adopt the current element as the new candidate',
      8: 'Same value adds a vote, different value cancels one',
      10: 'The survivor is the majority element',
    },
  },
};
