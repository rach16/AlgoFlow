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

function runJumpGameForward(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  steps.push({
    state: { nums: [...nums], result: 'Can we reach the last index?' },
    highlights: [],
    message: `Forward greedy: sweep left to right, tracking maxReach = the farthest index reachable so far.`,
    codeLine: 1,
  });

  let maxReach = 0;

  for (let i = 0; i < n; i++) {
    if (i > maxReach) {
      steps.push({
        state: { nums: [...nums], result: 'false - Cannot reach the end' },
        highlights: [i],
        secondary: [maxReach],
        pointers: { i, maxReach },
        message: `Index ${i} is beyond maxReach (${maxReach}) — nothing before it can jump this far, so we are stranded. Return false.`,
        codeLine: 5,
        action: 'found',
      });
      return steps;
    }

    const reach = i + nums[i];
    const improved = reach > maxReach;
    maxReach = Math.max(maxReach, reach);

    steps.push({
      state: { nums: [...nums], result: `Max reach: ${maxReach}` },
      highlights: [i],
      secondary: [Math.min(maxReach, n - 1)],
      pointers: { i, maxReach: Math.min(maxReach, n - 1) },
      message: `Index ${i} (value ${nums[i]}) reaches up to index ${reach}. maxReach ${improved ? `improves to ${maxReach}` : `stays at ${maxReach}`}${maxReach >= n - 1 ? ' — the last index is already within reach!' : '.'}`,
      codeLine: 6,
      action: improved ? 'insert' : 'compare',
    });
  }

  steps.push({
    state: { nums: [...nums], result: 'true - Can reach the end!' },
    highlights: [0, n - 1],
    pointers: { maxReach: n - 1 },
    message: `Swept the whole array without ever getting stranded — the last index is reachable. Return true.`,
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
    java: `public static boolean canJump(int[] nums) {
    int goal = nums.length - 1;
    for (int i = nums.length - 2; i >= 0; i--) {
        if (i + nums[i] >= goal) {
            goal = i;
        }
    }
    return goal == 0;
}`,
  },
  defaultInput: [2, 3, 1, 1, 4],
  run: runJumpGame,
  optimalApproachName: 'Greedy (Backward Goal)',
  approaches: [
    {
      id: 'greedy-forward',
      name: 'Greedy (Forward Max-Reach)',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of pulling the goal backwards, sweep forward tracking the farthest reachable index — if the scan ever passes it, you are stranded.',
      code: {
        python: `def canJump(nums):
    maxReach = 0
    for i in range(len(nums)):
        if i > maxReach:
            return False
        maxReach = max(maxReach, i + nums[i])
    return True`,
        javascript: `function canJump(nums) {
    let maxReach = 0;
    for (let i = 0; i < nums.length; i++) {
        if (i > maxReach) return false;
        maxReach = Math.max(maxReach, i + nums[i]);
    }
    return true;
}`,
        java: `public static boolean canJump(int[] nums) {
    int maxReach = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i > maxReach) return false;
        maxReach = Math.max(maxReach, i + nums[i]);
    }
    return true;
}`,
      },
      run: runJumpGameForward,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'Farthest index reachable so far (we start at index 0)',
          3: 'Scan every index left to right',
          4: 'If the scan passed maxReach, index i is unreachable',
          5: 'Stranded — no jump can ever land here, return false',
          6: 'Extend maxReach with the jump from index i',
          7: 'Never got stranded, so the last index is reachable',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'Farthest index reachable so far (we start at index 0)',
          3: 'Scan every index left to right',
          4: 'If the scan passed maxReach, index i is unreachable — return false',
          5: 'Extend maxReach with the jump from index i',
          7: 'Never got stranded, so the last index is reachable',
        },
        java: {
          1: 'Define method taking nums array',
          2: 'Farthest index reachable so far (we start at index 0)',
          3: 'Scan every index left to right',
          4: 'If the scan passed maxReach, index i is unreachable — return false',
          5: 'Extend maxReach with the jump from index i',
          7: 'Never got stranded, so the last index is reachable',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Set goal to last index',
      3: 'Iterate backwards from second-to-last index',
      4: 'Check if current index can reach the goal',
      5: 'Move goal closer to start',
      6: 'Return true if goal reached index 0',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Set goal to last index',
      3: 'Iterate backwards from second-to-last index',
      4: 'Check if current index can reach the goal',
      5: 'Move goal closer to start',
      8: 'Return true if goal reached index 0',
    },
    java: {
      1: 'Define method taking nums array',
      2: 'Set goal to last index',
      3: 'Iterate backwards from second-to-last index',
      4: 'Check if current index can reach the goal',
      5: 'Move goal closer to start',
      8: 'Return true if goal reached index 0',
    },
  },
};
