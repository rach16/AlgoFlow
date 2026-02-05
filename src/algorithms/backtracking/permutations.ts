import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runPermutations(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];

  steps.push({
    state: { nums: [...nums], stack: [], result: [] },
    highlights: [],
    message: `Generate all permutations of [${nums.join(', ')}]`,
    codeLine: 1,
  });

  function backtrack(current: number[], used: boolean[]) {
    if (current.length === nums.length) {
      result.push([...current]);

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: Array.from({ length: nums.length }, (_, i) => i),
        message: `Found permutation [${current.join(', ')}] (total: ${result.length})`,
        codeLine: 4,
        action: 'found',
      });
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        steps.push({
          state: {
            nums: [...nums],
            stack: [...current],
            result: result.map((r) => `[${r.join(',')}]`),
          },
          highlights: [i],
          secondary: used.reduce<number[]>((acc, u, idx) => { if (u) acc.push(idx); return acc; }, []),
          message: `nums[${i}] = ${nums[i]} already used, skip`,
          codeLine: 7,
        });
        continue;
      }

      // Choose
      used[i] = true;
      current.push(nums[i]);

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Choose nums[${i}] = ${nums[i]} -> current: [${current.join(', ')}]`,
        codeLine: 9,
        action: 'push',
      });

      // Explore
      backtrack(current, used);

      // Unchoose
      current.pop();
      used[i] = false;

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Backtrack: remove ${nums[i]} -> current: [${current.join(', ')}]`,
        codeLine: 11,
        action: 'pop',
      });
    }
  }

  const used = new Array(nums.length).fill(false);
  backtrack([], used);

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      result: result.map((r) => `[${r.join(',')}]`),
    },
    highlights: [],
    message: `Done! Found ${result.length} permutations`,
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

export const permutations: Algorithm = {
  id: 'permutations',
  name: 'Permutations',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(n·n!)',
  spaceComplexity: 'O(n)',
  pattern: 'Backtracking — swap positions, recurse, unswap',
  description:
    'Given an array nums of distinct integers, return all the possible permutations. Use backtracking: maintain a used array and build permutations by choosing each unused element at each position.',
  problemUrl: 'https://leetcode.com/problems/permutations/',
  code: {
    python: `def permute(nums):
    result = []

    def backtrack(current, used):
        if len(current) == len(nums):
            result.append(current[:])
            return

        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            current.append(nums[i])
            backtrack(current, used)
            current.pop()
            used[i] = False

    backtrack([], [False] * len(nums))
    return result`,
    javascript: `function permute(nums) {
    const result = [];

    function backtrack(current, used) {
        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }

        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            current.push(nums[i]);
            backtrack(current, used);
            current.pop();
            used[i] = false;
        }
    }

    backtrack([], new Array(nums.length).fill(false));
    return result;
}`,
  },
  defaultInput: [1, 2, 3],
  run: runPermutations,
};
