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

function runSubsetsIIIterative(input: unknown): AlgorithmStep[] {
  const rawNums = input as number[];
  const nums = [...rawNums].sort((a, b) => a - b);
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [[]];
  let prevSize = 0;

  steps.push({
    state: { nums: [...nums], stack: [], result: ['[]'] },
    highlights: [],
    message: `Sort to [${nums.join(', ')}] and start from [[]] — a duplicate may only extend subsets created in the previous round`,
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    const isDup = i > 0 && nums[i] === nums[i - 1];
    const begin = isDup ? prevSize : 0;
    prevSize = result.length;

    steps.push({
      state: { nums: [...nums], stack: [nums[i]], result: result.map((r) => `[${r.join(',')}]`) },
      highlights: [i],
      secondary: isDup ? [i - 1] : [],
      message: isDup
        ? `nums[${i}] = ${nums[i]} repeats nums[${i - 1}] — extend only the ${prevSize - begin} subsets added last round, or we would rebuild duplicates`
        : `nums[${i}] = ${nums[i]} is a new value — extend all ${prevSize} existing subsets`,
      codeLine: 8,
      action: 'visit',
    });

    const added: number[][] = [];
    for (let j = begin; j < prevSize; j++) {
      added.push([...result[j], nums[i]]);
    }
    result.push(...added);

    steps.push({
      state: { nums: [...nums], stack: [nums[i]], result: result.map((r) => `[${r.join(',')}]`) },
      highlights: [i],
      message: `New subsets: ${added.map((r) => `[${r.join(',')}]`).join(', ')} (total: ${result.length})`,
      codeLine: 11,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...nums], stack: [], result: result.map((r) => `[${r.join(',')}]`) },
    highlights: [],
    message: `Done! ${result.length} unique subsets — duplicate values never re-extended old subsets, so no repeats appear`,
    codeLine: 13,
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
    java: `public static List<List<Integer>> subsetsWithDup(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(nums);
    backtrack(0, new ArrayList<>(), nums, result);
    return result;
}

private static void backtrack(int start, List<Integer> current, int[] nums, List<List<Integer>> result) {
    result.add(new ArrayList<>(current));
    for (int i = start; i < nums.length; i++) {
        if (i > start && nums[i] == nums[i - 1]) continue;
        current.add(nums[i]);
        backtrack(i + 1, current, nums, result);
        current.remove(current.size() - 1);
    }
}`,
  },
  defaultInput: [1, 2, 2],
  run: runSubsetsII,
  optimalApproachName: 'Backtracking + Skip Duplicates',
  approaches: [
    {
      id: 'iterative-cascading-dedup',
      name: 'Iterative (Cascading)',
      timeComplexity: 'O(n·2ⁿ)',
      spaceComplexity: 'O(2ⁿ)',
      description:
        'Builds the power set iteratively like Subsets I, but when the current value repeats the previous one it extends only the subsets created in the last round, which prevents duplicate subsets without recursion.',
      code: {
        python: `def subsetsWithDup(nums):
    nums.sort()
    result = [[]]
    prev_size = 0

    for i in range(len(nums)):
        # Duplicates only extend last round's new subsets
        begin = prev_size if i > 0 and nums[i] == nums[i - 1] else 0
        prev_size = len(result)
        for j in range(begin, prev_size):
            result.append(result[j] + [nums[i]])

    return result`,
        javascript: `function subsetsWithDup(nums) {
    nums.sort((a, b) => a - b);
    const result = [[]];
    let prevSize = 0;

    for (let i = 0; i < nums.length; i++) {
        // Duplicates only extend last round's new subsets
        const begin = i > 0 && nums[i] === nums[i - 1] ? prevSize : 0;
        prevSize = result.length;
        for (let j = begin; j < prevSize; j++) {
            result.push([...result[j], nums[i]]);
        }
    }

    return result;
}`,
        java: `public static List<List<Integer>> subsetsWithDup(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> result = new ArrayList<>();
    result.add(new ArrayList<>());
    int prevSize = 0;

    for (int i = 0; i < nums.length; i++) {
        int begin = (i > 0 && nums[i] == nums[i - 1]) ? prevSize : 0;
        prevSize = result.size();
        for (int j = begin; j < prevSize; j++) {
            List<Integer> subset = new ArrayList<>(result.get(j));
            subset.add(nums[i]);
            result.add(subset);
        }
    }
    return result;
}`,
      },
      run: runSubsetsIIIterative,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'Sort so equal values sit next to each other',
          3: 'Seed the result with the single empty subset',
          4: 'Remember how big the list was before the previous round',
          6: 'Process one number at a time',
          7: 'Key idea: a repeated value must not re-extend old subsets',
          8: 'Duplicate → start from last round’s new subsets; new value → start from 0',
          9: 'Snapshot the current size before adding this round’s subsets',
          10: 'Walk only the allowed range of existing subsets',
          11: 'Append nums[i] to a copy of each allowed subset',
          13: 'Return all unique subsets',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'Sort so equal values sit next to each other',
          3: 'Seed the result with the single empty subset',
          4: 'Remember how big the list was before the previous round',
          6: 'Process one number at a time',
          7: 'Key idea: a repeated value must not re-extend old subsets',
          8: 'Duplicate → start from last round’s new subsets; new value → start from 0',
          9: 'Snapshot the current size before adding this round’s subsets',
          10: 'Walk only the allowed range of existing subsets',
          11: 'Append nums[i] to a copy of each allowed subset',
          15: 'Return all unique subsets',
        },
        java: {
          1: 'Define method returning list of subsets',
          2: 'Sort so equal values sit next to each other',
          3: 'Initialize result list',
          4: 'Seed the result with the single empty subset',
          5: 'Remember how big the list was before the previous round',
          7: 'Process one number at a time',
          8: 'Duplicate → start from last round’s new subsets; new value → start from 0',
          9: 'Snapshot the current size before adding this round’s subsets',
          10: 'Walk only the allowed range of existing subsets',
          11: 'Copy an allowed existing subset',
          12: 'Append the current number to the copy',
          13: 'Add the extended copy to the result',
          16: 'Return all unique subsets',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Initialize list to store unique subsets',
      3: 'Sort array to group duplicates together',
      5: 'Define recursive backtrack helper',
      6: 'Add copy of current subset to result',
      8: 'Iterate from start to end of array',
      9: 'Skip duplicates at same recursion level',
      10: 'If duplicate found, skip to next iteration',
      11: 'Continue to next iteration',
      12: 'Choose: include nums[i] in subset',
      13: 'Recurse starting from next index',
      14: 'Unchoose: remove last element (backtrack)',
      16: 'Start backtracking from index 0',
      17: 'Return all unique subsets',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Initialize array to store unique subsets',
      3: 'Sort array to group duplicates together',
      5: 'Define recursive backtrack helper',
      6: 'Add spread copy of current subset to result',
      8: 'Iterate from start to end of array',
      9: 'Skip duplicates at same recursion level',
      10: 'If same value as previous at same level, skip',
      11: 'Continue to next iteration',
      12: 'Choose: include nums[i] in subset',
      13: 'Recurse starting from next index',
      14: 'Unchoose: remove last element (backtrack)',
      18: 'Start backtracking from index 0',
      19: 'Return all unique subsets',
    },
    java: {
      1: 'Define method returning list of subsets',
      2: 'Initialize result list',
      3: 'Sort array to group duplicates together',
      4: 'Start backtracking from index 0',
      5: 'Return all unique subsets',
      8: 'Define recursive backtrack helper method',
      9: 'Add copy of current subset to result',
      10: 'Iterate from start to end of array',
      11: 'Skip duplicates at same recursion level',
      12: 'Choose: include nums[i] in subset',
      13: 'Recurse starting from next index',
      14: 'Unchoose: remove last element (backtrack)',
    },
  },
};
