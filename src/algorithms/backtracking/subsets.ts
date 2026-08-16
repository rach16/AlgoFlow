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

function runSubsetsIterative(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  let result: number[][] = [[]];

  steps.push({
    state: { nums: [...nums], stack: [], result: ['[]'] },
    highlights: [],
    message: 'Start with just the empty subset [[]] — each number will double the list',
    codeLine: 2,
  });

  for (let idx = 0; idx < nums.length; idx++) {
    const num = nums[idx];

    steps.push({
      state: { nums: [...nums], stack: [num], result: result.map((r) => `[${r.join(',')}]`) },
      highlights: [idx],
      message: `Take nums[${idx}] = ${num}: every existing subset either keeps it out (stays as-is) or takes it in (gets a copy with ${num} appended)`,
      codeLine: 4,
      action: 'visit',
    });

    const added = result.map((curr) => [...curr, num]);
    result = [...result, ...added];

    steps.push({
      state: { nums: [...nums], stack: [num], result: result.map((r) => `[${r.join(',')}]`) },
      highlights: [idx],
      message: `New subsets: ${added.map((r) => `[${r.join(',')}]`).join(', ')} — list doubles from ${result.length - added.length} to ${result.length}`,
      codeLine: 5,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...nums], stack: [], result: result.map((r) => `[${r.join(',')}]`) },
    highlights: [],
    message: `Done! ${nums.length} doublings give 2^${nums.length} = ${result.length} subsets — same power set, no recursion needed`,
    codeLine: 7,
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
  optimalApproachName: 'Backtracking (DFS)',
  approaches: [
    {
      id: 'iterative-cascading',
      name: 'Iterative (Cascading)',
      timeComplexity: 'O(n·2ⁿ)',
      spaceComplexity: 'O(2ⁿ)',
      description:
        'Instead of a recursive include/exclude tree, start from [[]] and let each number double the list by appending itself to a copy of every existing subset.',
      code: {
        python: `def subsets(nums):
    result = [[]]

    for num in nums:
        result += [curr + [num] for curr in result]

    return result`,
        javascript: `function subsets(nums) {
    let result = [[]];

    for (const num of nums) {
        result = result.concat(result.map(curr => [...curr, num]));
    }

    return result;
}`,
        java: `public static List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    result.add(new ArrayList<>());

    for (int num : nums) {
        int size = result.size();
        for (int i = 0; i < size; i++) {
            List<Integer> subset = new ArrayList<>(result.get(i));
            subset.add(num);
            result.add(subset);
        }
    }
    return result;
}`,
      },
      run: runSubsetsIterative,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'Seed the result with the single empty subset',
          4: 'Process one number at a time',
          5: 'Append num to a copy of every existing subset, doubling the list',
          7: 'After n doublings the list holds all 2^n subsets',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'Seed the result with the single empty subset',
          4: 'Process one number at a time',
          5: 'Append num to a copy of every existing subset, doubling the list',
          8: 'After n doublings the list holds all 2^n subsets',
        },
        java: {
          1: 'Define method returning list of subsets',
          2: 'Initialize result list',
          3: 'Seed the result with the single empty subset',
          5: 'Process one number at a time',
          6: 'Freeze the current size — only extend subsets that already existed',
          7: 'Walk the existing subsets',
          8: 'Copy an existing subset',
          9: 'Append the current number to the copy',
          10: 'Add the extended copy, doubling the list',
          13: 'After n doublings the list holds all 2^n subsets',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Initialize list to store all subsets',
      4: 'Define recursive backtrack helper',
      5: 'Add copy of current subset to result',
      7: 'Iterate from start to end of array',
      8: 'Choose: include nums[i] in subset',
      9: 'Recurse starting from next index',
      10: 'Unchoose: remove last element (backtrack)',
      12: 'Start backtracking from index 0',
      13: 'Return all subsets',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Initialize array to store all subsets',
      4: 'Define recursive backtrack helper',
      5: 'Add spread copy of current subset to result',
      7: 'Iterate from start to end of array',
      8: 'Choose: include nums[i] in subset',
      9: 'Recurse starting from next index',
      10: 'Unchoose: remove last element (backtrack)',
      14: 'Start backtracking from index 0',
      15: 'Return all subsets',
    },
    java: {
      1: 'Define method returning list of subsets',
      2: 'Initialize result list',
      3: 'Start backtracking from index 0',
      4: 'Return all subsets',
      7: 'Define recursive backtrack helper method',
      8: 'Add copy of current subset to result',
      9: 'Iterate from start to end of array',
      10: 'Choose: include nums[i] in subset',
      11: 'Recurse starting from next index',
      12: 'Unchoose: remove last element (backtrack)',
    },
  },
};
