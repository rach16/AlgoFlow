import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface FirstMissingPositiveInput {
  nums: number[];
}

function runFirstMissingPositiveHashSet(input: unknown): AlgorithmStep[] {
  const { nums } = input as FirstMissingPositiveInput;
  const steps: AlgorithmStep[] = [];
  const seen: number[] = [];

  steps.push({
    state: { nums: [...nums], seen: [] },
    highlights: [],
    message: `Trade memory for simplicity: dump everything into a set, then probe 1, 2, 3, ... until one is missing`,
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    if (!seen.includes(nums[i])) seen.push(nums[i]);
    steps.push({
      state: { nums: [...nums], seen: [...seen] },
      highlights: [i],
      pointers: { i },
      message: `Add ${nums[i]} to the set — membership tests are now O(1)`,
      codeLine: 2,
      action: 'insert',
    });
  }

  let candidate = 1;
  while (seen.includes(candidate)) {
    steps.push({
      state: { nums: [...nums], seen: [...seen] },
      highlights: nums.map((v, idx) => (v === candidate ? idx : -1)).filter((idx) => idx >= 0),
      message: `${candidate} is present — it cannot be the answer, try ${candidate + 1}`,
      codeLine: 4,
      action: 'compare',
    });
    candidate++;
  }

  steps.push({
    state: { nums: [...nums], seen: [...seen], result: candidate },
    highlights: [],
    message: `${candidate} is not in the set — first missing positive is ${candidate}. Cost: O(n) extra space`,
    codeLine: 6,
    action: 'found',
  });

  return steps;
}

function runFirstMissingPositive(input: unknown): AlgorithmStep[] {
  const { nums } = input as FirstMissingPositiveInput;
  const arr = [...nums];
  const steps: AlgorithmStep[] = [];
  const n = arr.length;

  steps.push({
    state: { nums: [...arr] },
    highlights: [],
    message: `The answer is always in 1..${n + 1}, so use the array itself as the hash table: send value v to index v-1`,
    codeLine: 2,
  });

  for (let i = 0; i < n; i++) {
    while (arr[i] >= 1 && arr[i] <= n && arr[arr[i] - 1] !== arr[i]) {
      const value = arr[i];
      const j = value - 1;
      const displaced = arr[j];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      steps.push({
        state: { nums: [...arr] },
        highlights: [j],
        secondary: [i],
        pointers: { i, home: j },
        message: `${value} belongs at index ${j} — swap it there, bringing ${displaced} back to index ${i} to be dealt with next`,
        codeLine: 6,
        action: 'swap',
      });
    }

    const settled = arr[i];
    const reason =
      settled < 1 || settled > n
        ? `${settled} is outside 1..${n}, so it can never mark a slot — leave it as filler`
        : `${settled} is already sitting at its home index ${i} — nothing to do`;

    steps.push({
      state: { nums: [...arr] },
      highlights: [i],
      pointers: { i },
      message: `Index ${i} settled: ${reason}`,
      codeLine: 4,
      action: 'visit',
    });
  }

  let answer = n + 1;
  for (let i = 0; i < n; i++) {
    if (arr[i] !== i + 1) {
      answer = i + 1;
      steps.push({
        state: { nums: [...arr], result: answer },
        highlights: [i],
        pointers: { i },
        message: `Index ${i} holds ${arr[i]}, not ${i + 1} — so ${i + 1} never appeared. Answer: ${i + 1}`,
        codeLine: 9,
        action: 'found',
      });
      return steps;
    }
    steps.push({
      state: { nums: [...arr] },
      highlights: [i],
      pointers: { i },
      message: `Index ${i} holds ${arr[i]} = ${i + 1} — present, keep scanning`,
      codeLine: 8,
      action: 'compare',
    });
  }

  steps.push({
    state: { nums: [...arr], result: answer },
    highlights: [],
    message: `Every slot 1..${n} is filled, so nothing is missing below ${n + 1}. Answer: ${answer}`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const firstMissingPositive: Algorithm = {
  id: 'first-missing-positive',
  name: 'First Missing Positive',
  category: 'Arrays & Hashing',
  difficulty: 'Hard',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Cyclic Sort — use the array itself as the hash table',
  description:
    'Given an unsorted integer array nums, return the smallest positive integer that is not present. You must run in O(n) time and use O(1) auxiliary space.',
  problemUrl: 'https://leetcode.com/problems/first-missing-positive/',
  code: {
    python: `def firstMissingPositive(nums):
    n = len(nums)
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1`,
    javascript: `function firstMissingPositive(nums) {
    const n = nums.length;
    for (let i = 0; i < n; i++) {
        while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
            const j = nums[i] - 1;
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }
    }
    for (let i = 0; i < n; i++) {
        if (nums[i] !== i + 1) return i + 1;
    }
    return n + 1;
}`,
    java: `public static int firstMissingPositive(int[] nums) {
    int n = nums.length;
    for (int i = 0; i < n; i++) {
        while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
            int j = nums[i] - 1;
            int tmp = nums[i];
            nums[i] = nums[j];
            nums[j] = tmp;
        }
    }
    for (int i = 0; i < n; i++) {
        if (nums[i] != i + 1) return i + 1;
    }
    return n + 1;
}`,
  },
  defaultInput: { nums: [3, 4, -1, 1, 9, 2] },
  run: runFirstMissingPositive,
  optimalApproachName: 'Cyclic Sort',
  approaches: [
    {
      id: 'hash-set-probe',
      name: 'Hash Set',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Stores every value in a set and counts upward from 1 — trivially correct and just as fast, but it violates the O(1) space constraint that makes this problem Hard.',
      code: {
        python: `def firstMissingPositive(nums):
    seen = set(nums)
    i = 1
    while i in seen:
        i += 1
    return i`,
        javascript: `function firstMissingPositive(nums) {
    const seen = new Set(nums);
    let i = 1;
    while (seen.has(i)) i++;
    return i;
}`,
        java: `public static int firstMissingPositive(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int num : nums) seen.add(num);
    int i = 1;
    while (seen.contains(i)) i++;
    return i;
}`,
      },
      run: runFirstMissingPositiveHashSet,
      lineExplanations: {
        python: {
          1: 'Define function taking the unsorted array',
          2: 'Dump every value into a set for O(1) membership tests',
          3: 'Start probing from the smallest positive integer',
          4: 'Keep going while the candidate is present',
          5: 'Try the next integer',
          6: 'The first candidate not in the set is the answer',
        },
        javascript: {
          1: 'Define function taking the unsorted array',
          2: 'Dump every value into a Set for O(1) membership tests',
          3: 'Start probing from the smallest positive integer',
          4: 'Skip past every candidate that is present',
          5: 'The first candidate not in the set is the answer',
        },
        java: {
          1: 'Define function taking the unsorted array',
          2: 'Set for O(1) membership tests',
          3: 'Dump every value into it',
          4: 'Start probing from the smallest positive integer',
          5: 'Skip past every candidate that is present',
          6: 'The first candidate not in the set is the answer',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the unsorted array',
      2: 'Only values 1..n can matter — the answer is at most n+1',
      3: 'First pass: put every in-range value at its home index',
      4: 'Keep swapping while the current value is in range and not already home',
      5: 'Value v belongs at index v-1',
      6: 'Swap it home; whatever was there comes back here for the next round',
      7: 'Second pass: find the first index that is not holding i+1',
      8: 'Slot mismatch means that positive integer never appeared',
      9: 'Return it',
      10: 'Every slot matched, so 1..n are all present and n+1 is missing',
    },
    javascript: {
      1: 'Define function taking the unsorted array',
      2: 'Only values 1..n can matter — the answer is at most n+1',
      3: 'First pass: put every in-range value at its home index',
      4: 'Keep swapping while the current value is in range and not already home',
      5: 'Value v belongs at index v-1',
      6: 'Swap it home; whatever was there comes back here for the next round',
      9: 'Second pass: find the first index that is not holding i+1',
      10: 'Slot mismatch means that positive integer never appeared',
      12: 'Every slot matched, so 1..n are all present and n+1 is missing',
    },
    java: {
      1: 'Define function taking the unsorted array',
      2: 'Only values 1..n can matter — the answer is at most n+1',
      3: 'First pass: put every in-range value at its home index',
      4: 'Keep swapping while the current value is in range and not already home',
      5: 'Value v belongs at index v-1',
      6: 'Classic three-line swap',
      11: 'Second pass: find the first index that is not holding i+1',
      12: 'Slot mismatch means that positive integer never appeared',
      14: 'Every slot matched, so 1..n are all present and n+1 is missing',
    },
  },
};
