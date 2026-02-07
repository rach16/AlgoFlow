import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runJumpGame(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], result: 'Can we reach the last index?' },
    highlights: [],
    message: `Greedy approach: track the farthest reachable position from right to left.`,
    codeLine: 1,
  });

  let goal = nums.length - 1;

  steps.push({
    state: { nums: [...nums], result: `Goal: index ${goal}` },
    highlights: [goal],
    pointers: { goal },
    message: `Set goal = last index (${goal}). Work backwards.`,
    codeLine: 2,
    action: 'visit',
  });

  for (let i = nums.length - 2; i >= 0; i--) {
    const canReach = i + nums[i] >= goal;

    const reachHighlights: number[] = [i];
    if (canReach) reachHighlights.push(goal);

    steps.push({
      state: { nums: [...nums], result: `Goal: index ${goal}` },
      highlights: reachHighlights,
      pointers: { i, goal },
      message: `Index ${i}: value = ${nums[i]}, can jump to index ${i + nums[i]}. ${canReach ? `Can reach goal (${goal})!` : `Cannot reach goal (${goal}).`}`,
      codeLine: 4,
      action: 'compare',
    });

    if (canReach) {
      goal = i;

      steps.push({
        state: { nums: [...nums], result: `Goal: index ${goal}` },
        highlights: [goal],
        pointers: { i, goal },
        message: `Move goal to index ${goal}.`,
        codeLine: 5,
        action: 'found',
      });
    }
  }

  const canReachEnd = goal === 0;

  steps.push({
    state: { nums: [...nums], result: canReachEnd ? 'true - Can reach the end!' : 'false - Cannot reach the end' },
    highlights: canReachEnd ? [0, nums.length - 1] : [],
    pointers: { goal },
    message: `Done! Goal = ${goal}. ${canReachEnd ? 'Goal reached index 0, so we can reach the end!' : 'Goal never reached 0, impossible.'}`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const jumpGame: Algorithm = {
  id: 'jump-game',
  name: 'Jump Game',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy — track farthest reachable index',
  description:
    'You are given an integer array nums. You are initially positioned at the array\'s first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.',
  problemUrl: 'https://leetcode.com/problems/jump-game/',
  code: {
    python: `def canJump(nums):
    goal = len(nums) - 1
    for i in range(len(nums) - 2, -1, -1):
        if i + nums[i] >= goal:
            goal = i
    return goal == 0`,
    javascript: `function canJump(nums) {
    let goal = nums.length - 1;
    for (let i = nums.length - 2; i >= 0; i--) {
        if (i + nums[i] >= goal) {
            goal = i;
        }
    }
    return goal === 0;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [2, 3, 1, 1, 4],
  run: runJumpGame,
};
