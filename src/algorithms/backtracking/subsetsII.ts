import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runSubsetsII(input: unknown): AlgorithmStep[] {
  const rawNums = input as number[];
  const nums = [...rawNums].sort((a, b) => a - b);
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];

  steps.push({
    state: { nums: [...nums], stack: [], result: [] },
    highlights: [],
    message: `Generate all unique subsets of [${nums.join(', ')}] (sorted: [${nums.join(', ')}])`,
    codeLine: 1,
  });

  function backtrack(start: number, current: number[]) {
    result.push([...current]);

    steps.push({
      state: {
        nums: [...nums],
        stack: [...current],
        result: result.map((r) => `[${r.join(',')}]`),
      },
      highlights: current.length > 0
        ? current.map((_, idx) => start - current.length + idx)
        : [],
      message: `Add subset [${current.join(', ')}] to result (total: ${result.length})`,
      codeLine: 5,
      action: 'found',
    });

    for (let i = start; i < nums.length; i++) {
      // Skip duplicates: if same value as previous at same level, skip
      if (i > start && nums[i] === nums[i - 1]) {
        steps.push({
          state: {
            nums: [...nums],
            stack: [...current],
            result: result.map((r) => `[${r.join(',')}]`),
          },
          highlights: [i],
          secondary: [i - 1],
          message: `Skip duplicate: nums[${i}] = ${nums[i]} == nums[${i - 1}] = ${nums[i - 1]}`,
          codeLine: 8,
        });
        continue;
      }

      // Choose
      current.push(nums[i]);

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Include nums[${i}] = ${nums[i]} -> subset: [${current.join(', ')}]`,
        codeLine: 10,
        action: 'push',
      });

      // Explore
      backtrack(i + 1, current);

      // Unchoose
      const removed = current.pop()!;

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Backtrack: remove ${removed} -> subset: [${current.join(', ')}]`,
        codeLine: 12,
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
    message: `Done! Found ${result.length} unique subsets`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

export const subsetsII: Algorithm = {
  id: 'subsets-ii',
  name: 'Subsets II',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(n·2ⁿ)',
  spaceComplexity: 'O(n)',
  pattern: 'Backtracking — sort first, skip consecutive duplicates',
  description:
    'Given an integer array nums that may contain duplicates, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Sort the array first and skip duplicates at the same recursion level.',
  problemUrl: 'https://leetcode.com/problems/subsets-ii/',
  code: {
    python: `def subsetsWithDup(nums):
    result = []
    nums.sort()

    def backtrack(start, current):
        result.append(current[:])

        for i in range(start, len(nums)):
            # Skip duplicates at same level
            if i > start and nums[i] == nums[i - 1]:
                continue
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()

    backtrack(0, [])
    return result`,
    javascript: `function subsetsWithDup(nums) {
    const result = [];
    nums.sort((a, b) => a - b);

    function backtrack(start, current) {
        result.push([...current]);

        for (let i = start; i < nums.length; i++) {
            // Skip duplicates at same level
            if (i > start && nums[i] === nums[i - 1])
                continue;
            current.push(nums[i]);
            backtrack(i + 1, current);
            current.pop();
        }
    }

    backtrack(0, []);
    return result;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [1, 2, 2],
  run: runSubsetsII,
};
