import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

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
