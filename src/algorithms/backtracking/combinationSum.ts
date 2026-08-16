import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runCombinationSum(input: unknown): AlgorithmStep[] {
  const { candidates, target } = input as { candidates: number[]; target: number };
  const steps: AlgorithmStep[] = [];
  const result: number[][] = [];

  // Sort candidates for cleaner visualization
  const nums = [...candidates].sort((a, b) => a - b);

  steps.push({
    state: { nums: [...nums], stack: [], hashMap: { target, remaining: target }, result: [] },
    highlights: [],
    message: `Find all combinations in [${nums.join(', ')}] that sum to ${target}`,
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
        highlights: current.map((val) => nums.indexOf(val)),
        message: `Found combination [${current.join(', ')}] = ${target} (total: ${result.length})`,
        codeLine: 5,
        action: 'found',
      });
      return;
    }

    if (remaining < 0) {
      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          hashMap: { target, remaining, sum: target - remaining },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [],
        message: `Sum ${target - remaining} exceeds target ${target}, backtrack`,
        codeLine: 7,
      });
      return;
    }

    for (let i = start; i < nums.length; i++) {
      // Prune: if current candidate exceeds remaining, skip rest
      if (nums[i] > remaining) {
        steps.push({
          state: {
            nums: [...nums],
            stack: [...current],
            hashMap: { target, remaining, candidate: nums[i] },
            result: result.map((r) => `[${r.join(',')}]`),
          },
          highlights: [i],
          message: `nums[${i}] = ${nums[i]} > remaining ${remaining}, prune branch`,
          codeLine: 9,
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
        message: `Add ${nums[i]} -> [${current.join(', ')}], remaining: ${remaining} - ${nums[i]} = ${remaining - nums[i]}`,
        codeLine: 11,
        action: 'push',
      });

      // Explore: same index i allowed (can reuse elements)
      backtrack(i, current, remaining - nums[i]);

      // Unchoose
      const removed = current.pop()!;

      steps.push({
        state: {
          nums: [...nums],
          stack: [...current],
          hashMap: { target, remaining, sum: target - remaining },
          result: result.map((r) => `[${r.join(',')}]`),
        },
        highlights: [i],
        message: `Backtrack: remove ${removed} -> [${current.join(', ')}], remaining: ${remaining}`,
        codeLine: 13,
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
    message: `Done! Found ${result.length} combinations that sum to ${target}`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

function runCombinationSumDP(input: unknown): AlgorithmStep[] {
  const { candidates, target } = input as { candidates: number[]; target: number };
  const steps: AlgorithmStep[] = [];
  const nums = [...candidates].sort((a, b) => a - b);

  const dp: number[][][] = Array.from({ length: target + 1 }, () => []);
  dp[0] = [[]];

  steps.push({
    state: { nums: [...nums], stack: [], hashMap: { target, 'dp[0]': '[[]]' }, result: [] },
    highlights: [],
    message: `Bottom-up DP: dp[t] stores every combination summing to t. Seed dp[0] = [[]] (one way to make 0: pick nothing)`,
    codeLine: 4,
  });

  for (let ci = 0; ci < nums.length; ci++) {
    const c = nums[ci];

    steps.push({
      state: { nums: [...nums], stack: [c], hashMap: { target, candidate: c }, result: dp[target].map((r) => `[${r.join(',')}]`) },
      highlights: [ci],
      message: `Process candidate ${c}: for every sub-target t from ${c} to ${target}, extend each dp[t - ${c}] combination with ${c}`,
      codeLine: 6,
      action: 'visit',
    });

    for (let t = c; t <= target; t++) {
      if (dp[t - c].length === 0) continue;

      const added = dp[t - c].map((combo) => [...combo, c]);
      dp[t].push(...added);

      steps.push({
        state: {
          nums: [...nums],
          stack: [...added[added.length - 1]],
          hashMap: { target, candidate: c, subTarget: t, from: `dp[${t - c}]` },
          result: dp[target].map((r) => `[${r.join(',')}]`),
        },
        highlights: [ci],
        message: `dp[${t}] += ${added.map((r) => `[${r.join(',')}]`).join(', ')} (each dp[${t - c}] combo + ${c})`,
        codeLine: 9,
        action: 'insert',
      });
    }
  }

  steps.push({
    state: {
      nums: [...nums],
      stack: [],
      hashMap: { target },
      result: dp[target].map((r) => `[${r.join(',')}]`),
    },
    highlights: [],
    message: `Done! dp[${target}] holds all ${dp[target].length} combination${dp[target].length !== 1 ? 's' : ''} — built from small targets up, no recursion. Iterating candidates in the outer loop keeps combos ordered (no duplicates)`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

export const combinationSum: Algorithm = {
  id: 'combination-sum',
  name: 'Combination Sum',
  category: 'Backtracking',
  difficulty: 'Medium',
  timeComplexity: 'O(2^target)',
  spaceComplexity: 'O(target)',
  pattern: 'Backtracking — try each candidate, allow repeats',
  description:
    'Given an array of distinct integers candidates and a target integer, return all unique combinations where the chosen numbers sum to target. The same number may be chosen an unlimited number of times. Use backtracking with pruning.',
  problemUrl: 'https://leetcode.com/problems/combination-sum/',
  code: {
    python: `def combinationSum(candidates, target):
    result = []
    candidates.sort()

    def backtrack(start, current, remaining):
        if remaining == 0:
            result.append(current[:])
            return
        if remaining < 0:
            return

        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                break
            current.append(candidates[i])
            backtrack(i, current, remaining - candidates[i])
            current.pop()

    backtrack(0, [], target)
    return result`,
    javascript: `function combinationSum(candidates, target) {
    const result = [];
    candidates.sort((a, b) => a - b);

    function backtrack(start, current, remaining) {
        if (remaining === 0) {
            result.push([...current]);
            return;
        }
        if (remaining < 0) return;

        for (let i = start; i < candidates.length; i++) {
            if (candidates[i] > remaining) break;
            current.push(candidates[i]);
            backtrack(i, current, remaining - candidates[i]);
            current.pop();
        }
    }

    backtrack(0, [], target);
    return result;
}`,
    java: `public static List<List<Integer>> combinationSum(int[] candidates, int target) {
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
    if (remaining < 0) return;

    for (int i = start; i < candidates.length; i++) {
        if (candidates[i] > remaining) break;
        current.add(candidates[i]);
        backtrack(i, current, remaining - candidates[i], candidates, result);
        current.remove(current.size() - 1);
    }
}`,
  },
  defaultInput: { candidates: [2, 3, 6, 7], target: 7 },
  run: runCombinationSum,
  optimalApproachName: 'Backtracking with Pruning',
  approaches: [
    {
      id: 'bottom-up-dp',
      name: 'Bottom-Up DP',
      timeComplexity: 'O(n·target·k)',
      spaceComplexity: 'O(target·k)',
      description:
        'Instead of a recursive decision tree, build a table where dp[t] lists every combination summing to t, filling it from 0 up to target one candidate at a time (unbounded-knapsack style).',
      code: {
        python: `def combinationSum(candidates, target):
    # dp[t] = list of combinations summing to t
    dp = [[] for _ in range(target + 1)]
    dp[0] = [[]]

    for c in candidates:
        for t in range(c, target + 1):
            for combo in dp[t - c]:
                dp[t].append(combo + [c])

    return dp[target]`,
        javascript: `function combinationSum(candidates, target) {
    // dp[t] = list of combinations summing to t
    const dp = Array.from({ length: target + 1 }, () => []);
    dp[0] = [[]];

    for (const c of candidates) {
        for (let t = c; t <= target; t++) {
            for (const combo of dp[t - c]) {
                dp[t].push([...combo, c]);
            }
        }
    }

    return dp[target];
}`,
        java: `public static List<List<Integer>> combinationSum(int[] candidates, int target) {
    // dp[t] = list of combinations summing to t
    List<List<List<Integer>>> dp = new ArrayList<>();
    for (int t = 0; t <= target; t++) dp.add(new ArrayList<>());
    dp.get(0).add(new ArrayList<>());

    for (int c : candidates) {
        for (int t = c; t <= target; t++) {
            for (List<Integer> combo : dp.get(t - c)) {
                List<Integer> next = new ArrayList<>(combo);
                next.add(c);
                dp.get(t).add(next);
            }
        }
    }
    return dp.get(target);
}`,
      },
      run: runCombinationSumDP,
      lineExplanations: {
        python: {
          1: 'Define function taking candidates and target',
          2: 'The table maps each sub-target to its combinations',
          3: 'One empty bucket per sub-target 0..target',
          4: 'Base case: one way to make 0 — the empty combination',
          6: 'Candidates in the outer loop → combos stay ordered, no duplicates',
          7: 'Ascending t lets a candidate be reused (unbounded knapsack)',
          8: 'Every combination that reaches t - c ...',
          9: '... plus c is a combination that reaches t',
          11: 'dp[target] is the full answer',
        },
        javascript: {
          1: 'Define function taking candidates and target',
          2: 'The table maps each sub-target to its combinations',
          3: 'One empty bucket per sub-target 0..target',
          4: 'Base case: one way to make 0 — the empty combination',
          6: 'Candidates in the outer loop → combos stay ordered, no duplicates',
          7: 'Ascending t lets a candidate be reused (unbounded knapsack)',
          8: 'Every combination that reaches t - c ...',
          9: '... plus c is a combination that reaches t',
          14: 'dp[target] is the full answer',
        },
        java: {
          1: 'Define method taking candidates and target',
          2: 'The table maps each sub-target to its combinations',
          3: 'Nested lists: dp[t] is a list of combinations',
          4: 'One empty bucket per sub-target 0..target',
          5: 'Base case: one way to make 0 — the empty combination',
          7: 'Candidates in the outer loop → combos stay ordered, no duplicates',
          8: 'Ascending t lets a candidate be reused (unbounded knapsack)',
          9: 'Every combination that reaches t - c ...',
          10: 'Copy the smaller combination',
          11: 'Append candidate c to it',
          12: '... giving a combination that reaches t',
          16: 'dp[target] is the full answer',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking candidates and target',
      2: 'Initialize list to store valid combinations',
      3: 'Sort candidates to enable pruning',
      5: 'Define recursive backtrack helper',
      6: 'Base case: remaining is zero, found valid combo',
      7: 'Save a copy of current combination to result',
      8: 'Stop exploring this branch',
      9: 'If remaining went negative, stop',
      10: 'Return to previous call',
      12: 'Try each candidate from start index onward',
      13: 'Prune: candidate too large, skip rest',
      14: 'Break since array is sorted',
      15: 'Choose: add candidate to current combo',
      16: 'Recurse with same index (reuse allowed)',
      17: 'Unchoose: remove last candidate (backtrack)',
      19: 'Start backtracking from index 0',
      20: 'Return all valid combinations',
    },
    javascript: {
      1: 'Define function taking candidates and target',
      2: 'Initialize array to store valid combinations',
      3: 'Sort candidates ascending for pruning',
      5: 'Define recursive backtrack helper',
      6: 'Base case: remaining is zero, found combo',
      7: 'Save copy of current combination to result',
      8: 'Return to stop further exploration',
      10: 'If remaining negative, stop this branch',
      12: 'Try each candidate from start index onward',
      13: 'Prune: candidate exceeds remaining, break',
      14: 'Choose: add candidate to current combo',
      15: 'Recurse with same index (reuse allowed)',
      16: 'Unchoose: remove last candidate (backtrack)',
      20: 'Start backtracking from index 0',
      21: 'Return all valid combinations',
    },
    java: {
      1: 'Define method returning list of combinations',
      2: 'Initialize result list',
      3: 'Sort candidates for pruning',
      4: 'Start backtracking from index 0',
      5: 'Return all valid combinations',
      8: 'Define recursive backtrack helper method',
      9: 'Base case: remaining is zero',
      10: 'Save copy of current combination to result',
      11: 'Return to stop exploring this branch',
      13: 'If remaining negative, stop this branch',
      15: 'Try each candidate from start index onward',
      16: 'Prune: candidate too large, break',
      17: 'Choose: add candidate to current combo',
      18: 'Recurse with same index (reuse allowed)',
      19: 'Unchoose: remove last element (backtrack)',
    },
  },
};
