import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runSubsets(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];

  steps.push({
    state: { nums: [...nums], stack: [], result: [] },
    highlights: [],
    message: `Generate all subsets of [${nums.join(', ')}]`,
    codeLine: 1,
  });

  function backtrack(start: number, current: number[]) {
    // Add current subset to result
    result.push([...current]);

    steps.push({
      state: {
        nums: [...nums],
        stack: [...current],
        result: result.map((r) => `[${r.join(',')}]`),
      },
      highlights: current.map((val) => nums.indexOf(val)),
      message: `Add subset [${current.join(', ')}] to result (total: ${result.length})`,
      codeLine: 4,
      action: 'found',
    });

    for (let i = start; i < nums.length; i++) {
      // Choose: add nums[i]
      current.push(nums[i]);

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Include nums[${i}] = ${nums[i]} -> current subset: [${current.join(', ')}]`,
        codeLine: 7,
        action: 'push',
      });

      // Explore
      backtrack(i + 1, current);

      // Unchoose: backtrack
      const removed = current.pop()!;

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Backtrack: remove ${removed} -> current subset: [${current.join(', ')}]`,
        codeLine: 9,
        action: 'pop',
      });
    }
  }

  backtrack(0, []);

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      result: result.map((r) => `[${r.join(',')}]`),
    },
    highlights: [],
    message: `Done! Found ${result.length} subsets`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

export const subsets: Algorithm = {
  id: 'subsets',
  name: 'Subsets',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(n·2ⁿ)',
  spaceComplexity: 'O(n)',
  pattern: 'Backtracking — include or exclude each element',
  description:
    'Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Use backtracking: at each index, decide to include or skip the element.',
  problemUrl: 'https://leetcode.com/problems/subsets/',
  code: {
    python: `def subsets(nums):
    result = []

    def backtrack(start, current):
        result.append(current[:])

        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()

    backtrack(0, [])
    return result`,
    javascript: `function subsets(nums) {
    const result = [];

    function backtrack(start, current) {
        result.push([...current]);

        for (let i = start; i < nums.length; i++) {
            current.push(nums[i]);
            backtrack(i + 1, current);
            current.pop();
        }
    }

    backtrack(0, []);
    return result;
}`,
    java: `public static List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(0, new ArrayList<>(), nums, result);
    return result;
}

private static void backtrack(int start, List<Integer> current, int[] nums, List<List<Integer>> result) {
    result.add(new ArrayList<>(current));
    for (int i = start; i < nums.length; i++) {
        current.add(nums[i]);
        backtrack(i + 1, current, nums, result);
        current.remove(current.size() - 1);
    }
}`,
  },
  defaultInput: [1, 2, 3],
  run: runSubsets,
};
