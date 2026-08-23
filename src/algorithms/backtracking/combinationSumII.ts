import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runCombinationSumII(input: unknown): AlgorithmStep[] {
  const { candidates, target } = input as { candidates: number[]; target: number };
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];
  const nums = [...candidates].sort((a, b) => a - b);

  steps.push({
    state: { nums: [...nums], stack: [], hashMap: { target, remaining: target }, result: [] },
    highlights: [],
    message: `Find unique combinations in [${nums.join(', ')}] that sum to ${target} (each number used once)`,
    codeLine: 1,
  });

  function backtrack(start: number, current: number[], remaining: number) {
    if (remaining === 0) {
      result.push([...current]);

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          hashMap: { target, remaining: 0, sum: target },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: Array.from({ length: nums.length }, (_, i) => i),
        message: `Found combination [${current.join(', ')}] = ${target} (total: ${result.length})`,
        codeLine: 5,
        action: 'found',
      });
      return;
    }

    for (let i = start; i < nums.length; i++) {
      // Skip duplicates at the same recursion level
      if (i > start && nums[i] === nums[i - 1]) {
        steps.push({
          state: {
            nums: [...nums],
            stack: [...current],
            hashMap: { target, remaining },
            result: result.map((r) => `[${r.join(',')}]`),
          },
          highlights: [i],
          secondary: [i - 1],
          message: `Skip duplicate: nums[${i}] = ${nums[i]} == nums[${i - 1}]`,
          codeLine: 9,
        });
        continue;
      }

      // Prune: if candidate exceeds remaining, stop
      if (nums[i] > remaining) {
        steps.push({
          state: {
            nums: [...nums],
            stack: [...current],
            hashMap: { target, remaining, candidate: nums[i] },
            result: result.map((r) => `[${r.join(',')}]`),
          },
          highlights: [i],
          message: `nums[${i}] = ${nums[i]} > remaining ${remaining}, prune`,
          codeLine: 11,
        });
        break;
      }

      // Choose
      current.push(nums[i]);

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          hashMap: { target, remaining: remaining - nums[i], sum: target - remaining + nums[i] },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Add ${nums[i]} -> [${current.join(', ')}], remaining: ${remaining - nums[i]}`,
        codeLine: 13,
        action: 'push',
      });

      // Explore: i + 1 (each element used at most once)
      backtrack(i + 1, current, remaining - nums[i]);

      // Unchoose
      const removed = current.pop()!;

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          hashMap: { target, remaining },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Backtrack: remove ${removed} -> [${current.join(', ')}], remaining: ${remaining}`,
        codeLine: 15,
        action: 'pop',
      });
    }
  }

  backtrack(0, [], target);

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { target },
      result: result.map((r) => `[${r.join(',')}]`),
    },
    highlights: [],
    message: `Done! Found ${result.length} unique combinations that sum to ${target}`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

function runCombinationSumIIIterative(input: unknown): AlgorithmStep[] {
  const { candidates, target } = input as { candidates: number[]; target: number };
  const steps: AlgorithmStep[] = [];
  const nums = [...candidates].sort((a, b) => a - b);
  const result: number[][] = [];

  interface Frame {
    start: number;
    combo: number[];
    remaining: number;
  }
  const stack: Frame[] = [{ start: 0, combo: [], remaining: target }];
  const STEP_BUDGET = 70;
  let suppressed = 0;

  steps.push({
    state: { nums: [...nums], stack: [], hashMap: { target, frames: 1 }, result: [] },
    highlights: [],
    message: `No recursion: an explicit stack of frames (start, combo, remaining) replaces the call stack. Seed with (0, [], ${target})`,
    codeLine: 5,
  });

  while (stack.length > 0) {
    const { start, combo, remaining } = stack.pop()!;

    if (remaining === 0) {
      result.push(combo);
      steps.push({
        state: {
          nums: [...nums],
          stack: [...combo],
          hashMap: { target, remaining: 0, frames: stack.length },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: combo.map((val) => nums.indexOf(val)),
        message: `Pop frame with remaining 0: [${combo.join(', ')}] sums to ${target} (total: ${result.length})`,
        codeLine: 10,
        action: 'found',
      });
      continue;
    }

    const children: Frame[] = [];
    const pushedValues: number[] = [];
    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue; // skip duplicates at same level
      if (nums[i] > remaining) break; // prune: sorted, rest are larger
      children.push({ start: i + 1, combo: [...combo, nums[i]], remaining: remaining - nums[i] });
      pushedValues.push(nums[i]);
    }
    stack.push(...children);

    if (steps.length < STEP_BUDGET) {
      steps.push({
        state: {
          nums: [...nums],
          stack: [...combo],
          hashMap: { target, remaining, frames: stack.length },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: pushedValues.map((val) => nums.indexOf(val)),
        message: children.length > 0
          ? `Pop frame [${combo.join(', ')}] (remaining ${remaining}): push ${children.length} child frame${children.length !== 1 ? 's' : ''} extending with ${pushedValues.join(', ')} — duplicates skipped, over-target pruned`
          : `Pop frame [${combo.join(', ')}] (remaining ${remaining}): no candidate fits, dead end — frame simply discarded`,
        codeLine: children.length > 0 ? 17 : 12,
        action: 'pop',
      });
    } else {
      suppressed++;
    }
  }

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { target },
      result: result.map((r) => `[${r.join(',')}]`),
    },
    highlights: [],
    message: `Done! Stack empty — found ${result.length} unique combination${result.length !== 1 ? 's' : ''}${suppressed > 0 ? ` (${suppressed} similar frame expansions not shown)` : ''}. Same tree as recursion, managed by hand`,
    codeLine: 20,
    action: 'found',
  });

  return steps;
}

export const combinationSumII: Algorithm = {
  id: 'combination-sum-ii',
  name: 'Combination Sum II',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(2ⁿ)',
  spaceComplexity: 'O(target)',
  pattern: 'Backtracking — sort, use once, skip duplicates at same level',
  description:
    'Given a collection of candidate numbers and a target number, find all unique combinations where the candidate numbers sum to the target. Each number may only be used once. Sort first and skip duplicates at the same recursion level.',
  problemUrl: 'https://leetcode.com/problems/combination-sum-ii/',
  code: {
    python: `def combinationSum2(candidates, target):
    result = []
    candidates.sort()

    def backtrack(start, current, remaining):
        if remaining == 0:
            result.append(current[:])
            return

        for i in range(start, len(candidates)):
            # Skip duplicates at same level
            if i > start and candidates[i] == candidates[i - 1]:
                continue
            # Prune
            if candidates[i] > remaining:
                break
            current.append(candidates[i])
            backtrack(i + 1, current, remaining - candidates[i])
            current.pop()

    backtrack(0, [], target)
    return result`,
    javascript: `function combinationSum2(candidates, target) {
    const result = [];
    candidates.sort((a, b) => a - b);

    function backtrack(start, current, remaining) {
        if (remaining === 0) {
            result.push([...current]);
            return;
        }

        for (let i = start; i < candidates.length; i++) {
            // Skip duplicates at same level
            if (i > start && candidates[i] === candidates[i - 1])
                continue;
            // Prune
            if (candidates[i] > remaining) break;
            current.push(candidates[i]);
            backtrack(i + 1, current, remaining - candidates[i]);
            current.pop();
        }
    }

    backtrack(0, [], target);
    return result;
}`,
    java: `public static List<List<Integer>> combinationSum2(int[] candidates, int target) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(candidates);
    backtrack(0, new ArrayList<>(), target, candidates, result);
    return result;
}

private static void backtrack(int start, List<Integer> current, int remaining, int[] candidates, List<List<Integer>> result) {
    if (remaining == 0) {
        result.add(new ArrayList<>(current));
        return;
    }

    for (int i = start; i < candidates.length; i++) {
        if (i > start && candidates[i] == candidates[i - 1]) continue;
        if (candidates[i] > remaining) break;
        current.add(candidates[i]);
        backtrack(i + 1, current, remaining - candidates[i], candidates, result);
        current.remove(current.size() - 1);
    }
}`,
  },
  defaultInput: { candidates: [10, 1, 2, 7, 6, 1, 5], target: 8 },
  run: runCombinationSumII,
  optimalApproachName: 'Backtracking + Skip Duplicates',
  approaches: [
    {
      id: 'iterative-explicit-stack',
      name: 'Iterative (Explicit Stack)',
      timeComplexity: 'O(2ⁿ)',
      spaceComplexity: 'O(2ⁿ)',
      description:
        'Explores the exact same pruned decision tree as the recursive solution, but manages frames (start, combo, remaining) on an explicit stack instead of the call stack — no recursion, no shared mutable path to undo.',
      code: {
        python: `def combinationSum2(candidates, target):
    candidates.sort()
    result = []
    # Each frame: (start, combo, remaining)
    stack = [(0, [], target)]

    while stack:
        start, combo, remaining = stack.pop()
        if remaining == 0:
            result.append(combo)
            continue
        for i in range(start, len(candidates)):
            if i > start and candidates[i] == candidates[i - 1]:
                continue
            if candidates[i] > remaining:
                break
            stack.append((i + 1, combo + [candidates[i]],
                          remaining - candidates[i]))

    return result`,
        javascript: `function combinationSum2(candidates, target) {
    candidates.sort((a, b) => a - b);
    const result = [];
    // Each frame: [start, combo, remaining]
    const stack = [[0, [], target]];

    while (stack.length) {
        const [start, combo, remaining] = stack.pop();
        if (remaining === 0) {
            result.push(combo);
            continue;
        }
        for (let i = start; i < candidates.length; i++) {
            if (i > start && candidates[i] === candidates[i - 1]) continue;
            if (candidates[i] > remaining) break;
            stack.push([i + 1, [...combo, candidates[i]],
                        remaining - candidates[i]]);
        }
    }

    return result;
}`,
        java: `public static List<List<Integer>> combinationSum2(int[] candidates, int target) {
    Arrays.sort(candidates);
    List<List<Integer>> result = new ArrayList<>();
    // Each frame: {start, combo, remaining}
    Deque<Object[]> stack = new ArrayDeque<>();
    stack.push(new Object[]{0, new ArrayList<Integer>(), target});

    while (!stack.isEmpty()) {
        Object[] frame = stack.pop();
        int start = (int) frame[0];
        List<Integer> combo = (List<Integer>) frame[1];
        int remaining = (int) frame[2];
        if (remaining == 0) {
            result.add(combo);
            continue;
        }
        for (int i = start; i < candidates.length; i++) {
            if (i > start && candidates[i] == candidates[i - 1]) continue;
            if (candidates[i] > remaining) break;
            List<Integer> next = new ArrayList<>(combo);
            next.add(candidates[i]);
            stack.push(new Object[]{i + 1, next, remaining - candidates[i]});
        }
    }
    return result;
}`,
      },
      run: runCombinationSumIIIterative,
      lineExplanations: {
        python: {
          1: 'Define function taking candidates and target',
          2: 'Sort to group duplicates and enable pruning',
          3: 'Initialize list of valid combinations',
          4: 'A frame captures everything a recursive call would know',
          5: 'Seed: start at index 0, empty combo, full target remaining',
          7: 'Keep exploring while frames remain',
          8: 'Pop the most recently pushed frame (LIFO = depth-first)',
          9: 'Remaining hit exactly 0 — this combo is an answer',
          10: 'Frames own their combo lists, so no copy needed',
          11: 'Nothing to expand below a completed combo',
          12: 'Expand: try each candidate from start onward',
          13: 'Skip duplicate values at the same tree level',
          14: 'Avoids generating the same combination twice',
          15: 'Sorted array: if this is too big, the rest are too',
          16: 'Prune the entire remainder of this level',
          17: 'Push a child frame: next index, extended combo ...',
          18: '... and the reduced remaining target',
          20: 'Stack drained — every branch was explored',
        },
        javascript: {
          1: 'Define function taking candidates and target',
          2: 'Sort to group duplicates and enable pruning',
          3: 'Initialize list of valid combinations',
          4: 'A frame captures everything a recursive call would know',
          5: 'Seed: start at index 0, empty combo, full target remaining',
          7: 'Keep exploring while frames remain',
          8: 'Pop the most recently pushed frame (LIFO = depth-first)',
          9: 'Remaining hit exactly 0 — this combo is an answer',
          10: 'Frames own their combo arrays, so no copy needed',
          11: 'Nothing to expand below a completed combo',
          13: 'Expand: try each candidate from start onward',
          14: 'Skip duplicate values at the same tree level',
          15: 'Sorted array: if this is too big, the rest are too — prune',
          16: 'Push a child frame: next index, extended combo ...',
          17: '... and the reduced remaining target',
          21: 'Stack drained — every branch was explored',
        },
        java: {
          1: 'Define method taking candidates and target',
          2: 'Sort to group duplicates and enable pruning',
          3: 'Initialize list of valid combinations',
          4: 'A frame captures everything a recursive call would know',
          5: 'Explicit stack replaces the call stack',
          6: 'Seed: start at index 0, empty combo, full target remaining',
          8: 'Keep exploring while frames remain',
          9: 'Pop the most recently pushed frame (LIFO = depth-first)',
          10: 'Unpack the start index',
          11: 'Unpack the combo built so far',
          12: 'Unpack the remaining target',
          13: 'Remaining hit exactly 0 — this combo is an answer',
          14: 'Frames own their combo lists, so no copy needed',
          15: 'Nothing to expand below a completed combo',
          17: 'Expand: try each candidate from start onward',
          18: 'Skip duplicate values at the same tree level',
          19: 'Sorted array: if this is too big, the rest are too — prune',
          20: 'Copy the combo for the child frame',
          21: 'Extend it with the chosen candidate',
          22: 'Push child frame with next index and reduced remaining',
          25: 'Stack drained — every branch was explored',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking candidates and target',
      2: 'Initialize list to store valid combinations',
      3: 'Sort candidates to enable dedup and pruning',
      5: 'Define recursive backtrack helper',
      6: 'Base case: remaining is zero, found combo',
      7: 'Save copy of current combination',
      8: 'Return after saving',
      10: 'Try each candidate from start onward',
      11: 'Skip duplicates at same recursion level',
      12: 'If same value as previous, skip',
      13: 'Continue to next candidate',
      14: 'Prune: candidate exceeds remaining',
      15: 'Break since candidates are sorted',
      16: 'Choose: add candidate to current combo',
      17: 'Recurse from next index (no reuse)',
      18: 'Unchoose: remove last candidate',
      21: 'Start backtracking from index 0',
      22: 'Return all valid combinations',
    },
    javascript: {
      1: 'Define function taking candidates and target',
      2: 'Initialize array for valid combinations',
      3: 'Sort candidates ascending',
      5: 'Define recursive backtrack helper',
      6: 'Base case: remaining is zero',
      7: 'Save copy of current combination',
      8: 'Return after saving',
      11: 'Try each candidate from start onward',
      12: 'Skip duplicates at same recursion level',
      13: 'If same as previous at same level, skip',
      14: 'Continue to next candidate',
      15: 'Prune: candidate exceeds remaining, break',
      16: 'Choose: add candidate to current combo',
      17: 'Recurse from next index (no reuse)',
      18: 'Unchoose: remove last candidate',
      23: 'Start backtracking from index 0',
      24: 'Return all valid combinations',
    },
    java: {
      1: 'Define method returning list of combinations',
      2: 'Initialize result list',
      3: 'Sort candidates for dedup and pruning',
      4: 'Start backtracking from index 0',
      5: 'Return all valid combinations',
      8: 'Define recursive backtrack helper method',
      9: 'Base case: remaining is zero',
      10: 'Save copy of current combination',
      11: 'Return after saving',
      14: 'Try each candidate from start onward',
      15: 'Skip duplicates at same recursion level',
      16: 'Prune: candidate exceeds remaining, break',
      17: 'Choose: add candidate to current combo',
      18: 'Recurse from next index (no reuse)',
      19: 'Unchoose: remove last element',
    },
  },
};
