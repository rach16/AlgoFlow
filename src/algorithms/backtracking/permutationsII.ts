import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runPermutationsII(input: unknown): AlgorithmStep[] {
  const nums = [...(input as number[])].sort((a, b) => a - b);
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];
  const used = new Array(nums.length).fill(false);
  const STEP_BUDGET = 62;
  let suppressed = 0;

  const usedStr = () => used.map((u) => (u ? 'T' : 'F')).join('');

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { used: usedStr(), found: 0 },
      result: [],
    },
    highlights: [],
    message: `Sorted to [${nums.join(', ')}] so equal values sit side by side. Rule: among equal values, only ever take the leftmost unused one — that kills duplicate permutations at the source`,
    codeLine: 2,
  });

  function backtrack(current: number[]) {
    if (current.length === nums.length) {
      result.push([...current]);

      push({
        state: {
          nums: [...nums],
          stack: [...current],
          hashMap: { used: usedStr(), found: result.length },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [],
        message: `All ${nums.length} slots filled — record permutation [${current.join(', ')}] (total: ${result.length})`,
        codeLine: 8,
        action: 'found',
      });
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        push({
          state: {
            nums: [...nums],
            stack: [...current],
            hashMap: { used: usedStr(), found: result.length },
            result: result.map((r) => `[${r.join(',')}]`),
          },
          highlights: [i],
          message: `nums[${i}] = ${nums[i]} is already in the path — skip`,
          codeLine: 13,
        });
        continue;
      }

      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) {
        push({
          state: {
            nums: [...nums],
            stack: [...current],
            hashMap: { used: usedStr(), found: result.length },
            result: result.map((r) => `[${r.join(',')}]`),
          },
          highlights: [i],
          secondary: [i - 1],
          message: `nums[${i}] = ${nums[i]} equals its unused twin nums[${i - 1}] — using it now would rebuild a branch the twin already covered. Skip`,
          codeLine: 16,
        });
        continue;
      }

      used[i] = true;
      current.push(nums[i]);

      push({
        state: {
          nums: [...nums],
          stack: [...current],
          hashMap: { used: usedStr(), found: result.length },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Take nums[${i}] = ${nums[i]} → path [${current.join(', ')}]`,
        codeLine: 19,
        action: 'push',
      });

      backtrack(current);

      current.pop();
      used[i] = false;

      push({
        state: {
          nums: [...nums],
          stack: [...current],
          hashMap: { used: usedStr(), found: result.length },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Backtrack: release nums[${i}] = ${nums[i]} → path [${current.join(', ')}]`,
        codeLine: 21,
        action: 'pop',
      });
    }
  }

  backtrack([]);

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { used: usedStr(), found: result.length },
      result: result.map((r) => `[${r.join(',')}]`),
    },
    highlights: [],
    message: `Done! ${result.length} distinct permutation${result.length !== 1 ? 's' : ''}${suppressed > 0 ? ` (${suppressed} branch steps not shown)` : ''} — no post-hoc dedup needed`,
    codeLine: 25,
    action: 'found',
  });

  return steps;
}

function runPermutationsIICounter(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];
  const STEP_BUDGET = 62;
  let suppressed = 0;

  const counter = new Map<number, number>();
  for (const num of nums) counter.set(num, (counter.get(num) ?? 0) + 1);
  const keys = [...counter.keys()];

  const counterMap = (): Record<string, number> => {
    const obj: Record<string, number> = {};
    for (const key of keys) obj[String(key)] = counter.get(key)!;
    return obj;
  };

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      count: counterMap(),
      result: [],
    },
    highlights: [],
    message: `Different framing: forget positions, count values. ${keys.map((k) => `${k}×${counter.get(k)}`).join(', ')}. Each level picks a distinct VALUE, so duplicates can never branch twice — no sort, no used[] array`,
    codeLine: 4,
  });

  function backtrack(current: number[]) {
    if (current.length === nums.length) {
      result.push([...current]);

      push({
        state: {
          nums: [...nums],
          stack: [...current],
          count: counterMap(),
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [],
        message: `Counter is drained — record permutation [${current.join(', ')}] (total: ${result.length})`,
        codeLine: 9,
        action: 'found',
      });
      return;
    }

    for (const num of keys) {
      const count = counter.get(num)!;

      if (count === 0) {
        push({
          state: {
            nums: [...nums],
            stack: [...current],
            count: counterMap(),
            result: result.map((r) => `[${r.join(',')}]`),
          },
          highlights: [],
          message: `Value ${num} has 0 copies left — skip`,
          codeLine: 14,
        });
        continue;
      }

      counter.set(num, count - 1);
      current.push(num);

      push({
        state: {
          nums: [...nums],
          stack: [...current],
          count: counterMap(),
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [],
        message: `Spend one copy of ${num} (${count} → ${count - 1}) → path [${current.join(', ')}]`,
        codeLine: 16,
        action: 'push',
      });

      backtrack(current);

      current.pop();
      counter.set(num, count);

      push({
        state: {
          nums: [...nums],
          stack: [...current],
          count: counterMap(),
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [],
        message: `Backtrack: refund one copy of ${num} (${count - 1} → ${count}) → path [${current.join(', ')}]`,
        codeLine: 19,
        action: 'pop',
      });
    }
  }

  backtrack([]);

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      count: counterMap(),
      result: result.map((r) => `[${r.join(',')}]`),
    },
    highlights: [],
    message: `Done! Same ${result.length} distinct permutation${result.length !== 1 ? 's' : ''}${suppressed > 0 ? ` (${suppressed} branch steps not shown)` : ''} — the branching factor is the number of distinct values, not n`,
    codeLine: 22,
    action: 'found',
  });

  return steps;
}

export const permutationsII: Algorithm = {
  id: 'permutations-ii',
  name: 'Permutations II',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(n·n!)',
  spaceComplexity: 'O(n)',
  pattern: 'Backtracking — sort, use once, skip duplicates at same level',
  description:
    'Given a collection of numbers that might contain duplicates, return all possible unique permutations. Sort the array so equal values are adjacent, then at each level only take the leftmost unused copy of a repeated value.',
  problemUrl: 'https://leetcode.com/problems/permutations-ii/',
  code: {
    python: `def permuteUnique(nums):
    nums.sort()
    result = []
    used = [False] * len(nums)

    def backtrack(current):
        if len(current) == len(nums):
            result.append(current[:])
            return

        for i in range(len(nums)):
            if used[i]:
                continue
            # Skip a duplicate whose twin is still unused
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue

            used[i] = True
            current.append(nums[i])
            backtrack(current)
            current.pop()
            used[i] = False

    backtrack([])
    return result`,
    javascript: `function permuteUnique(nums) {
    nums.sort((a, b) => a - b);
    const result = [];
    const used = new Array(nums.length).fill(false);

    function backtrack(current) {
        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }

        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            // Skip a duplicate whose twin is still unused
            if (i > 0 && nums[i] === nums[i-1] && !used[i-1]) continue;

            used[i] = true;
            current.push(nums[i]);
            backtrack(current);
            current.pop();
            used[i] = false;
        }
    }

    backtrack([]);
    return result;
}`,
    java: `public static List<List<Integer>> permuteUnique(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> result = new ArrayList<>();
    backtrack(new ArrayList<>(), new boolean[nums.length], nums, result);
    return result;
}

private static void backtrack(List<Integer> current, boolean[] used, int[] nums, List<List<Integer>> result) {
    if (current.size() == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }

    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        // Skip a duplicate whose twin is still unused
        if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;

        used[i] = true;
        current.add(nums[i]);
        backtrack(current, used, nums, result);
        current.remove(current.size() - 1);
        used[i] = false;
    }
}`,
  },
  defaultInput: [1, 1, 2],
  run: runPermutationsII,
  optimalApproachName: 'Sort + used[] Duplicate Skip',
  approaches: [
    {
      id: 'frequency-counter',
      name: 'Frequency Counter',
      timeComplexity: 'O(n·n!)',
      spaceComplexity: 'O(n)',
      description:
        'Branches over distinct VALUES with remaining counts instead of over positions with a used[] array — duplicates are impossible by construction, so no sorting and no adjacency check are needed.',
      code: {
        python: `from collections import Counter

def permuteUnique(nums):
    counter = Counter(nums)
    result = []

    def backtrack(current):
        if len(current) == len(nums):
            result.append(current[:])
            return

        for num in counter:
            if counter[num] == 0:
                continue
            counter[num] -= 1
            current.append(num)
            backtrack(current)
            current.pop()
            counter[num] += 1

    backtrack([])
    return result`,
        javascript: `function permuteUnique(nums) {
    const counter = new Map();
    for (const num of nums) counter.set(num, (counter.get(num) || 0) + 1);
    const result = [];

    function backtrack(current) {
        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }

        for (const [num, count] of counter) {
            if (count === 0) continue;
            counter.set(num, count - 1);
            current.push(num);
            backtrack(current);
            current.pop();
            counter.set(num, count);
        }
    }

    backtrack([]);
    return result;
}`,
        java: `public static List<List<Integer>> permuteUnique(int[] nums) {
    Map<Integer, Integer> counter = new LinkedHashMap<>();
    for (int num : nums) counter.merge(num, 1, Integer::sum);
    List<List<Integer>> result = new ArrayList<>();
    backtrack(new ArrayList<>(), counter, nums.length, result);
    return result;
}

private static void backtrack(List<Integer> current, Map<Integer, Integer> counter, int n, List<List<Integer>> result) {
    if (current.size() == n) {
        result.add(new ArrayList<>(current));
        return;
    }

    for (Map.Entry<Integer, Integer> e : counter.entrySet()) {
        int count = e.getValue();
        if (count == 0) continue;
        e.setValue(count - 1);
        current.add(e.getKey());
        backtrack(current, counter, n, result);
        current.remove(current.size() - 1);
        e.setValue(count);
    }
}`,
      },
      run: runPermutationsIICounter,
      lineExplanations: {
        python: {
          1: 'Counter gives value -> remaining copies in one pass',
          3: 'Define function taking nums array',
          4: 'Collapse the array into distinct values with multiplicities',
          5: 'Collect the unique permutations here',
          7: 'Build the permutation one slot at a time',
          8: 'Base case: every slot filled means the counter is drained',
          9: 'Copy the path — it keeps mutating',
          10: 'Return to try other values in the parent slot',
          12: 'Branch over distinct VALUES, never over positions',
          13: 'This value is exhausted at this depth',
          14: 'Skip it — no duplicate branch can be created',
          15: 'Spend one copy',
          16: 'Place the value in the next slot',
          17: 'Recurse into the shallower counter',
          18: 'Undo the placement',
          19: 'Refund the copy so a sibling branch can use it',
          21: 'Start from an empty path with the full counter',
          22: 'Return every unique permutation',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'Map from value to remaining copies',
          3: 'Count each value in a single pass',
          4: 'Collect the unique permutations here',
          6: 'Build the permutation one slot at a time',
          7: 'Base case: every slot filled means the counter is drained',
          8: 'Copy the path — it keeps mutating',
          9: 'Return to try other values in the parent slot',
          12: 'Branch over distinct VALUES, never over positions',
          13: 'This value is exhausted at this depth, skip it',
          14: 'Spend one copy',
          15: 'Place the value in the next slot',
          16: 'Recurse into the shallower counter',
          17: 'Undo the placement',
          18: 'Refund the copy so a sibling branch can use it',
          22: 'Start from an empty path with the full counter',
          23: 'Return every unique permutation',
        },
        java: {
          1: 'Define method taking nums array',
          2: 'LinkedHashMap keeps a stable iteration order',
          3: 'Count each value in a single pass',
          4: 'Collect the unique permutations here',
          5: 'Start from an empty path with the full counter',
          6: 'Return every unique permutation',
          9: 'Helper carries the counter instead of a used[] array',
          10: 'Base case: every slot filled means the counter is drained',
          11: 'Copy the path — it keeps mutating',
          12: 'Return to try other values in the parent slot',
          15: 'Branch over distinct VALUES, never over positions',
          16: 'Read the remaining copies of this value',
          17: 'This value is exhausted at this depth, skip it',
          18: 'Spend one copy',
          19: 'Place the value in the next slot',
          20: 'Recurse into the shallower counter',
          21: 'Undo the placement',
          22: 'Refund the copy so a sibling branch can use it',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Sorting puts equal values next to each other',
      3: 'Collect the unique permutations here',
      4: 'Track which index is already sitting in the path',
      6: 'Build the permutation one slot at a time',
      7: 'Base case: the path uses every index',
      8: 'Copy the path — it keeps mutating',
      9: 'Return to try other values in the parent slot',
      11: 'Any unused index may fill the next slot',
      12: 'That value is already placed in this path',
      13: 'Skip it',
      14: 'The de-duplication rule, and the only tricky line',
      15: 'Equal to the previous value AND that twin is free',
      16: 'Skip: the twin will generate this exact branch itself',
      18: 'Mark the index as taken',
      19: 'Extend the path',
      20: 'Fill the remaining slots',
      21: 'Undo the extension',
      22: 'Release the index for sibling branches',
      24: 'Start from an empty path',
      25: 'Return every unique permutation',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Sorting puts equal values next to each other',
      3: 'Collect the unique permutations here',
      4: 'Track which index is already sitting in the path',
      6: 'Build the permutation one slot at a time',
      7: 'Base case: the path uses every index',
      8: 'Copy the path — it keeps mutating',
      9: 'Return to try other values in the parent slot',
      12: 'Any unused index may fill the next slot',
      13: 'That value is already placed in this path',
      14: 'The de-duplication rule, and the only tricky line',
      15: 'Equal to a still-free twin means the twin covers this branch',
      17: 'Mark the index as taken',
      18: 'Extend the path',
      19: 'Fill the remaining slots',
      20: 'Undo the extension',
      21: 'Release the index for sibling branches',
      25: 'Start from an empty path',
      26: 'Return every unique permutation',
    },
    java: {
      1: 'Define method taking nums array',
      2: 'Sorting puts equal values next to each other',
      3: 'Collect the unique permutations here',
      4: 'Start from an empty path and an all-false used array',
      5: 'Return every unique permutation',
      8: 'Helper carries the path and the used flags',
      9: 'Base case: the path uses every index',
      10: 'Copy the path — it keeps mutating',
      11: 'Return to try other values in the parent slot',
      14: 'Any unused index may fill the next slot',
      15: 'That value is already placed in this path',
      16: 'The de-duplication rule, and the only tricky line',
      17: 'Equal to a still-free twin means the twin covers this branch',
      19: 'Mark the index as taken',
      20: 'Extend the path',
      21: 'Fill the remaining slots',
      22: 'Undo the extension',
      23: 'Release the index for sibling branches',
    },
  },
};
