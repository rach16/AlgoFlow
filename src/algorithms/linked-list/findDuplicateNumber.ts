import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runFindDuplicateNumber(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  // Initial state
  steps.push({
    state: {
      linkedList: nums.map((val, i) => ({ val, id: i })),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: "Find the duplicate number using Floyd's Tortoise and Hare cycle detection. Treat array as a linked list: index -> nums[index].",
    codeLine: 1,
  });

  // Phase 1: Find intersection point
  steps.push({
    state: {
      linkedList: nums.map((val, i) => ({ val, id: i })),
      linkedListHighlights: [0],
      linkedListSecondary: [0],
      linkedListPointers: { slow: 0, fast: 0 },
    },
    highlights: [0],
    pointers: { slow: 0, fast: 0 },
    message: 'Phase 1: Find intersection. Start slow = nums[0], fast = nums[0].',
    codeLine: 2,
    action: 'visit',
  });

  let slow = nums[0];
  let fast = nums[0];

  // Do-while: move slow by 1, fast by 2
  let iteration = 0;
  const maxIter = nums.length * 3;

  do {
    iteration++;
    if (iteration > maxIter) break;

    slow = nums[slow];
    fast = nums[nums[fast]];

    const slowIdx = slow < nums.length ? slow : 0;
    const fastIdx = fast < nums.length ? fast : 0;

    steps.push({
      state: {
        linkedList: nums.map((val, i) => ({ val, id: i })),
        linkedListHighlights: [slowIdx],
        linkedListSecondary: [fastIdx],
        linkedListPointers: { slow: slowIdx, fast: fastIdx },
      },
      highlights: [slowIdx, fastIdx],
      pointers: { slow: slowIdx, fast: fastIdx },
      message: `slow = nums[slow] = ${slow} (index ${slowIdx}), fast = nums[nums[fast]] = ${fast} (index ${fastIdx})`,
      codeLine: 3,
      action: 'visit',
    });
  } while (slow !== fast);

  if (slow === fast) {
    const meetIdx = slow < nums.length ? slow : 0;
    steps.push({
      state: {
        linkedList: nums.map((val, i) => ({ val, id: i })),
        linkedListHighlights: [meetIdx],
        linkedListSecondary: [],
        linkedListPointers: { slow: meetIdx, fast: meetIdx },
      },
      highlights: [meetIdx],
      pointers: { slow: meetIdx, fast: meetIdx },
      message: `Phase 1 complete: slow and fast meet at value ${slow}.`,
      codeLine: 4,
      action: 'found',
    });
  }

  // Phase 2: Find entrance to cycle (the duplicate)
  steps.push({
    state: {
      linkedList: nums.map((val, i) => ({ val, id: i })),
      linkedListHighlights: [0],
      linkedListSecondary: [slow < nums.length ? slow : 0],
      linkedListPointers: { slow1: 0, slow2: slow < nums.length ? slow : 0 },
    },
    highlights: [0],
    message: 'Phase 2: Find cycle entrance. Reset slow1 = nums[0], keep slow2 at meeting point. Both move 1 step.',
    codeLine: 5,
    action: 'visit',
  });

  let slow1 = nums[0];
  let slow2 = slow;
  iteration = 0;

  while (slow1 !== slow2 && iteration < maxIter) {
    iteration++;
    slow1 = nums[slow1];
    slow2 = nums[slow2];

    const s1Idx = slow1 < nums.length ? slow1 : 0;
    const s2Idx = slow2 < nums.length ? slow2 : 0;

    steps.push({
      state: {
        linkedList: nums.map((val, i) => ({ val, id: i })),
        linkedListHighlights: [s1Idx],
        linkedListSecondary: [s2Idx],
        linkedListPointers: { slow1: s1Idx, slow2: s2Idx },
      },
      highlights: [s1Idx, s2Idx],
      pointers: { slow1: s1Idx, slow2: s2Idx },
      message: `slow1 = nums[slow1] = ${slow1}, slow2 = nums[slow2] = ${slow2}`,
      codeLine: 6,
      action: 'visit',
    });
  }

  // Found the duplicate
  const dupIdx = slow1 < nums.length ? slow1 : 0;
  steps.push({
    state: {
      linkedList: nums.map((val, i) => ({ val, id: i })),
      linkedListHighlights: [dupIdx],
      linkedListSecondary: [],
      linkedListPointers: { duplicate: dupIdx },
    },
    highlights: [dupIdx],
    message: `Duplicate found! Both pointers meet at value ${slow1}. The duplicate number is ${slow1}.`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const findDuplicateNumber: Algorithm = {
  id: 'find-duplicate-number',
  name: 'Find the Duplicate Number',
  category: 'Linked List',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Fast & Slow Pointers — treat array as linked list',
  description:
    'Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive. There is only one repeated number in nums, return this repeated number. You must solve it without modifying the array and using only constant extra space.',
  problemUrl: 'https://leetcode.com/problems/find-the-duplicate-number/',
  code: {
    python: `def findDuplicate(nums):
    # Phase 1: Find intersection
    slow = nums[0]
    fast = nums[0]
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    # Phase 2: Find entrance
    slow2 = nums[0]
    while slow != slow2:
        slow = nums[slow]
        slow2 = nums[slow2]
    return slow`,
    javascript: `function findDuplicate(nums) {
    // Phase 1: Find intersection
    let slow = nums[0];
    let fast = nums[0];
    do {
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow !== fast);
    // Phase 2: Find entrance
    let slow2 = nums[0];
    while (slow !== slow2) {
        slow = nums[slow];
        slow2 = nums[slow2];
    }
    return slow;
}`,
  },
  defaultInput: [1, 3, 4, 2, 2],
  run: runFindDuplicateNumber,
};
