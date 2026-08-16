import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runLongestConsecutiveSorting(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    message: `Sort first — consecutive numbers become adjacent, then one scan measures every streak`,
    codeLine: 1,
  });

  if (nums.length === 0) {
    steps.push({
      state: { nums: [], result: 0 },
      highlights: [],
      message: 'Empty array — longest consecutive sequence is 0',
      codeLine: 3,
    });
    return steps;
  }

  const sorted = [...nums].sort((a, b) => a - b);

  steps.push({
    state: { nums: [...sorted], longest: 1 },
    highlights: [],
    message: `Sorted: [${sorted.join(', ')}]. Streaks now sit side by side — start with length 1`,
    codeLine: 4,
    action: 'swap',
  });

  let longest = 1;
  let length = 1;
  let streakStart = 0;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) {
      steps.push({
        state: { nums: [...sorted], longest, currentSequence: length },
        highlights: [i],
        secondary: [i - 1],
        pointers: { i },
        message: `${sorted[i]} equals its neighbor — duplicates don't extend a streak, skip`,
        codeLine: 9,
        action: 'compare',
      });
      continue;
    }

    if (sorted[i] === sorted[i - 1] + 1) {
      length++;
      const streakIndices = [];
      for (let j = streakStart; j <= i; j++) streakIndices.push(j);
      steps.push({
        state: { nums: [...sorted], longest, currentSequence: length },
        highlights: streakIndices,
        pointers: { i },
        message: `${sorted[i]} = ${sorted[i - 1]} + 1 — streak continues: ${sorted[streakStart]}..${sorted[i]}, length ${length}`,
        codeLine: 11,
        action: 'visit',
      });
    } else {
      steps.push({
        state: { nums: [...sorted], longest, currentSequence: 1 },
        highlights: [i],
        secondary: [i - 1],
        pointers: { i },
        message: `Gap: ${sorted[i]} is not ${sorted[i - 1]} + 1 — streak breaks, restart counting at ${sorted[i]}`,
        codeLine: 13,
        action: 'compare',
      });
      length = 1;
      streakStart = i;
    }

    if (length > longest) {
      longest = length;
      steps.push({
        state: { nums: [...sorted], longest, currentSequence: length },
        highlights: [],
        message: `New longest streak: ${longest} (${sorted[streakStart]}..${sorted[i]})`,
        codeLine: 14,
        action: 'found',
      });
    }
  }

  steps.push({
    state: { nums: [...sorted], longest, result: longest },
    highlights: [],
    message: `Longest consecutive sequence length: ${longest} — found via O(n log n) sort instead of the O(n) hash set`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

function runLongestConsecutive(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const numSet = new Set(nums);

  // Initial state
  steps.push({
    state: { nums: [...nums], seen: Array.from(numSet).sort((a, b) => a - b) },
    highlights: [],
    message: `Find longest consecutive sequence in [${nums.join(', ')}]`,
    codeLine: 1,
  });

  // Show set creation
  steps.push({
    state: { nums: [...nums], seen: Array.from(numSet).sort((a, b) => a - b) },
    highlights: [],
    message: `Created set: {${Array.from(numSet).sort((a, b) => a - b).join(', ')}}`,
    codeLine: 2,
    action: 'insert',
  });

  let longest = 0;
  let bestStart = 0;

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];

    // Show current number being checked
    steps.push({
      state: { nums: [...nums], seen: Array.from(numSet).sort((a, b) => a - b), longest },
      highlights: [i],
      pointers: { i },
      message: `Checking nums[${i}] = ${num}`,
      codeLine: 4,
      action: 'visit',
    });

    // Check if this is the start of a sequence (no num-1 in set)
    if (numSet.has(num - 1)) {
      steps.push({
        state: { nums: [...nums], seen: Array.from(numSet).sort((a, b) => a - b), longest },
        highlights: [i],
        pointers: { i },
        message: `${num - 1} exists in set, so ${num} is NOT a sequence start. Skip.`,
        codeLine: 5,
        action: 'compare',
      });
      continue;
    }

    // This is a sequence start
    steps.push({
      state: { nums: [...nums], seen: Array.from(numSet).sort((a, b) => a - b), longest },
      highlights: [i],
      pointers: { i },
      message: `${num - 1} NOT in set -> ${num} is the START of a sequence`,
      codeLine: 6,
      action: 'compare',
    });

    // Count sequence length
    let length = 1;
    let current = num;
    const sequenceIndices = [i];

    while (numSet.has(current + 1)) {
      current++;
      length++;
      // Find index of current in nums
      const idx = nums.indexOf(current);
      if (idx !== -1) sequenceIndices.push(idx);

      steps.push({
        state: { nums: [...nums], seen: Array.from(numSet).sort((a, b) => a - b), longest, currentSequence: length },
        highlights: sequenceIndices,
        pointers: { start: i },
        message: `Found ${current} in set. Sequence: ${num}...${current}, length = ${length}`,
        codeLine: 8,
        action: 'visit',
      });
    }

    // Update longest
    if (length > longest) {
      longest = length;
      bestStart = num;

      steps.push({
        state: { nums: [...nums], seen: Array.from(numSet).sort((a, b) => a - b), longest, bestSequence: `${bestStart}..${bestStart + longest - 1}` },
        highlights: sequenceIndices,
        message: `New longest! Sequence ${bestStart}..${bestStart + longest - 1}, length = ${longest}`,
        codeLine: 9,
        action: 'found',
      });
    } else {
      steps.push({
        state: { nums: [...nums], seen: Array.from(numSet).sort((a, b) => a - b), longest },
        highlights: sequenceIndices,
        message: `Sequence length ${length} does not beat current longest ${longest}`,
        codeLine: 9,
        action: 'compare',
      });
    }
  }

  // Final result
  steps.push({
    state: { nums: [...nums], seen: Array.from(numSet).sort((a, b) => a - b), result: longest },
    highlights: [],
    message: `Longest consecutive sequence length: ${longest}`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const longestConsecutive: Algorithm = {
  id: 'longest-consecutive',
  name: 'Longest Consecutive Sequence',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Hash Set — only start counting from sequence start',
  description:
    'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(n) time.',
  problemUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/',
  code: {
    python: `def longestConsecutive(nums):
    numSet = set(nums)
    longest = 0
    for num in numSet:
        if num - 1 not in numSet:
            length = 1
            while num + length in numSet:
                length += 1
            longest = max(longest, length)
    return longest`,
    javascript: `function longestConsecutive(nums) {
    const numSet = new Set(nums);
    let longest = 0;
    for (const num of numSet) {
        if (!numSet.has(num - 1)) {
            let length = 1;
            while (numSet.has(num + length)) {
                length++;
            }
            longest = Math.max(longest, length);
        }
    }
    return longest;
}`,
    java: `public static int longestConsecutive(int[] nums) {
    Set<Integer> numSet = new HashSet<>();
    for (int num : nums) {
        numSet.add(num);
    }
    int longest = 0;
    for (int num : numSet) {
        if (!numSet.contains(num - 1)) {
            int length = 1;
            while (numSet.contains(num + length)) {
                length++;
            }
            longest = Math.max(longest, length);
        }
    }
    return longest;
}`,
  },
  defaultInput: [100, 4, 200, 1, 3, 2],
  run: runLongestConsecutive,
  optimalApproachName: 'Hash Set',
  approaches: [
    {
      id: 'sorting',
      name: 'Sorting',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(1)',
      description:
        'Sorts the array so consecutive values sit next to each other, then measures streaks in one scan — simpler than the hash set but pays O(n log n) for the sort.',
      code: {
        python: `def longestConsecutive(nums):
    if not nums:
        return 0
    nums.sort()
    longest = 1
    length = 1
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:
            continue
        if nums[i] == nums[i - 1] + 1:
            length += 1
        else:
            length = 1
        longest = max(longest, length)
    return longest`,
        javascript: `function longestConsecutive(nums) {
    if (nums.length === 0) return 0;
    nums.sort((a, b) => a - b);
    let longest = 1;
    let length = 1;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i - 1]) continue;
        if (nums[i] === nums[i - 1] + 1) {
            length++;
        } else {
            length = 1;
        }
        longest = Math.max(longest, length);
    }
    return longest;
}`,
        java: `public static int longestConsecutive(int[] nums) {
    if (nums.length == 0) return 0;
    Arrays.sort(nums);
    int longest = 1;
    int length = 1;
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] == nums[i - 1]) continue;
        if (nums[i] == nums[i - 1] + 1) {
            length++;
        } else {
            length = 1;
        }
        longest = Math.max(longest, length);
    }
    return longest;
}`,
      },
      run: runLongestConsecutiveSorting,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'Handle the empty array edge case',
          3: 'No elements means no sequence — return 0',
          4: 'Sort — consecutive values become adjacent',
          5: 'Best streak seen so far (at least 1 once array is non-empty)',
          6: 'Length of the current streak',
          7: 'Scan the sorted array from the second element',
          8: 'Duplicate of the previous value?',
          9: "Duplicates neither extend nor break a streak — skip",
          10: 'Exactly one bigger than the previous value?',
          11: 'Streak continues — extend its length',
          12: 'Otherwise there is a gap',
          13: 'Gap breaks the streak — restart counting at 1',
          14: 'Keep the best streak length seen so far',
          15: 'Return the longest consecutive run',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'Empty array has no sequence — return 0',
          3: 'Sort numerically — consecutive values become adjacent',
          4: 'Best streak seen so far',
          5: 'Length of the current streak',
          6: 'Scan the sorted array from the second element',
          7: "Duplicates neither extend nor break a streak — skip",
          8: 'Exactly one bigger than the previous value?',
          9: 'Streak continues — extend its length',
          11: 'Gap breaks the streak — restart counting at 1',
          13: 'Keep the best streak length seen so far',
          15: 'Return the longest consecutive run',
        },
        java: {
          1: 'Define function taking int array',
          2: 'Empty array has no sequence — return 0',
          3: 'Sort — consecutive values become adjacent',
          4: 'Best streak seen so far',
          5: 'Length of the current streak',
          6: 'Scan the sorted array from the second element',
          7: "Duplicates neither extend nor break a streak — skip",
          8: 'Exactly one bigger than the previous value?',
          9: 'Streak continues — extend its length',
          11: 'Gap breaks the streak — restart counting at 1',
          13: 'Keep the best streak length seen so far',
          15: 'Return the longest consecutive run',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Build a set for O(1) lookups',
      3: 'Initialize longest sequence tracker',
      4: 'Iterate over each unique number in the set',
      5: 'Check if num is start of a sequence',
      6: 'Start counting sequence length at 1',
      7: 'Extend sequence while next number exists',
      8: 'Increment length for each consecutive find',
      9: 'Update longest if current sequence is longer',
      10: 'Return the longest consecutive length',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Build a set for O(1) lookups',
      3: 'Initialize longest sequence tracker',
      4: 'Iterate over each unique number in the set',
      5: 'Check if num is start of a sequence',
      6: 'Start counting sequence length at 1',
      7: 'Extend sequence while next number exists',
      8: 'Increment length for each consecutive find',
      10: 'Update longest if current sequence is longer',
      12: 'Return the longest consecutive length',
    },
    java: {
      1: 'Define function taking int array',
      2: 'Create HashSet for O(1) lookups',
      3: 'Add each number from array into the set',
      4: 'Insert current number into the set',
      6: 'Initialize longest sequence tracker',
      7: 'Iterate over each unique number in the set',
      8: 'Check if num is start of a sequence',
      9: 'Start counting sequence length at 1',
      10: 'Extend sequence while next number exists',
      11: 'Increment length for each consecutive find',
      13: 'Update longest if current sequence is longer',
      16: 'Return the longest consecutive length',
    },
  },
};
