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
    java: `public static List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();

    backtrack(result, new ArrayList<>(), nums, new boolean[nums.length]);
    return result;
}

private static void backtrack(List<List<Integer>> result, List<Integer> current,
                               int[] nums, boolean[] used) {
    if (current.size() == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }

    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        current.add(nums[i]);
        backtrack(result, current, nums, used);
        current.remove(current.size() - 1);
        used[i] = false;
    }
}`,
  },
  defaultInput: [1, 2, 3],
  run: runPermutations,
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Initialize list to store permutations',
      4: 'Define recursive backtrack helper',
      5: 'Base case: permutation is complete',
      6: 'Save copy of current permutation',
      7: 'Return after saving',
      9: 'Try each element in nums',
      10: 'Skip already-used elements',
      11: 'Continue to next element',
      12: 'Mark element as used',
      13: 'Choose: add element to permutation',
      14: 'Recurse to fill next position',
      15: 'Unchoose: remove last element',
      16: 'Unmark element as unused',
      18: 'Start with empty permutation and used array',
      19: 'Return all permutations',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Initialize array to store permutations',
      4: 'Define recursive backtrack helper',
      5: 'Base case: permutation is complete',
      6: 'Save spread copy of current permutation',
      7: 'Return after saving',
      10: 'Try each element in nums',
      11: 'Skip already-used elements',
      12: 'Mark element as used',
      13: 'Choose: add element to permutation',
      14: 'Recurse to fill next position',
      15: 'Unchoose: remove last element',
      16: 'Unmark element as unused',
      19: 'Start with empty permutation and used array',
      20: 'Return all permutations',
    },
    java: {
      1: 'Define method returning list of permutations',
      2: 'Initialize result list',
      4: 'Start backtracking with empty state',
      5: 'Return all permutations',
      8: 'Define recursive backtrack helper',
      9: 'Extra parameter line for method signature',
      10: 'Base case: permutation is complete',
      11: 'Save copy of current permutation',
      12: 'Return after saving',
      15: 'Try each element in nums',
      16: 'Skip already-used elements',
      17: 'Mark element as used',
      18: 'Choose: add element to permutation',
      19: 'Recurse to fill next position',
      20: 'Unchoose: remove last element',
      21: 'Unmark element as unused',
    },
  },
};
