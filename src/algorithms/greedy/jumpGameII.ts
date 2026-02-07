import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runJumpGameII(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], result: 'Finding minimum jumps to reach end...' },
    highlights: [],
    message: `BFS/Greedy approach: find minimum number of jumps to reach the last index.`,
    codeLine: 1,
  });

  let jumps = 0;
  let left = 0;
  let right = 0;

  steps.push({
    state: { nums: [...nums], result: `Jumps: ${jumps}` },
    highlights: [0],
    pointers: { left: 0, right: 0 },
    message: `Start at index 0. Current window: [0, 0]. Jumps = 0.`,
    codeLine: 2,
    action: 'visit',
  });

  while (right < nums.length - 1) {
    let farthest = 0;

    // Highlight current BFS level
    const levelHighlights: number[] = [];
    for (let j = left; j <= right; j++) levelHighlights.push(j);

    steps.push({
      state: { nums: [...nums], result: `Jumps: ${jumps}` },
      highlights: levelHighlights,
      pointers: { left, right },
      message: `Jump ${jumps}: exploring window [${left}, ${right}]. Find farthest reachable position.`,
      codeLine: 4,
    });

    for (let i = left; i <= right; i++) {
      const reach = i + nums[i];
      if (reach > farthest) {
        farthest = reach;
      }

      steps.push({
        state: { nums: [...nums], result: `Jumps: ${jumps}, Farthest: ${farthest}` },
        highlights: [i],
        pointers: { i, left, right, farthest: Math.min(farthest, nums.length - 1) },
        message: `From index ${i} (value ${nums[i]}): can reach index ${reach}. Farthest = ${farthest}.`,
        codeLine: 6,
        action: 'compare',
      });
    }

    left = right + 1;
    right = farthest;
    jumps++;

    const newLevelHighlights: number[] = [];
    for (let j = left; j <= Math.min(right, nums.length - 1); j++) newLevelHighlights.push(j);

    steps.push({
      state: { nums: [...nums], result: `Jumps: ${jumps}` },
      highlights: newLevelHighlights,
      pointers: { left, right: Math.min(right, nums.length - 1) },
      message: `Jump! Jumps = ${jumps}. New window: [${left}, ${Math.min(right, nums.length - 1)}].`,
      codeLine: 8,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...nums], result: `Minimum jumps: ${jumps}` },
    highlights: [0, nums.length - 1],
    message: `Done! Minimum number of jumps to reach the end = ${jumps}.`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const jumpGameII: Algorithm = {
  id: 'jump-game-ii',
  name: 'Jump Game II',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy BFS — expand level by level, count jumps',
  description:
    'You are given a 0-indexed array of integers nums of length n. You are initially positioned at nums[0]. Each element nums[i] represents the maximum length of a forward jump from index i. Return the minimum number of jumps to reach nums[n - 1].',
  problemUrl: 'https://leetcode.com/problems/jump-game-ii/',
  code: {
    python: `def jump(nums):
    jumps = 0
    left = right = 0

    while right < len(nums) - 1:
        farthest = 0
        for i in range(left, right + 1):
            farthest = max(farthest, i + nums[i])
        left = right + 1
        right = farthest
        jumps += 1

    return jumps`,
    javascript: `function jump(nums) {
    let jumps = 0;
    let left = 0, right = 0;

    while (right < nums.length - 1) {
        let farthest = 0;
        for (let i = left; i <= right; i++) {
            farthest = Math.max(farthest, i + nums[i]);
        }
        left = right + 1;
        right = farthest;
        jumps++;
    }

    return jumps;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [2, 3, 1, 1, 4],
  run: runJumpGameII,
};
